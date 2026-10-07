import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BecomeTarget, CategoryType, EnquiryStatus, AdminLifecycleFlag } from '@prisma/client';
import { BecomeService } from '../become/become.service';
import { CreateBecomeApplicationDto } from '../become/dto/become.dto';
import { CategoriesService } from '../categories/categories.service';
import { CmsService } from '../cms/cms.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { PaymentPlansService } from '../payments/payment-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { StatesService } from '../states/states.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import {
  DEFAULT_SPONSORSHIP_PLANS_HEADER,
  SYSTEM_SETTING_KEYS,
} from '../system-settings/system-setting.defaults';
import { CreatePublicEnquiryDto } from './dto/create-public-enquiry.dto';
import { CreatePublicHelpTicketDto } from './dto/create-public-help-ticket.dto';
import { coverageVisibilityWhere, eventCoverageVisibilityWhere } from '../common/coverage';
import { CATALOG_TTL_MS, STATES_TTL_MS, catalogCache } from '../common/utils/ttl-cache';

@Injectable()
export class PublicService {
  constructor(
    private categories: CategoriesService,
    private states: StatesService,
    private cms: CmsService,
    private marketplace: MarketplaceService,
    private prisma: PrismaService,
    private config: ConfigService,
    private systemSettings: SystemSettingsService,
    private paymentPlans: PaymentPlansService,
    private become: BecomeService,
  ) {}

  listCategories(type?: CategoryType) {
    const key = `categories:public:${type ?? 'any'}`;
    const hit = catalogCache.get<Awaited<ReturnType<CategoriesService['findAll']>>>(key);
    if (hit) return Promise.resolve(hit);
    return this.categories.findAll(undefined, true, type).then((rows) => {
      catalogCache.set(key, rows, CATALOG_TTL_MS);
      return rows;
    });
  }

  async listSubcategories(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
    });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.subcategory.findMany({
      where: { categoryId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  listSubcategoriesByCategoryIds(categoryIds: string[]) {
    return this.categories.listSubcategoriesByCategoryIds(categoryIds, true);
  }

  listStates() {
    const key = 'states:public';
    const hit = catalogCache.get<Awaited<ReturnType<StatesService['findAll']>>>(key);
    if (hit) return Promise.resolve(hit);
    return this.states.findAll(undefined, true).then((rows) => {
      catalogCache.set(key, rows, STATES_TTL_MS);
      return rows;
    });
  }

  listFaqs() {
    return this.cms.findAll('faq', undefined, ['title', 'description'], { isActive: true });
  }

  listBlogs() {
    return this.cms.findAll('blog', undefined, ['title', 'shortDescription', 'description'], {
      isActive: true,
    });
  }

  async getBlog(id: string) {
    const row = await this.prisma.blog.findFirst({
      where: { id, isActive: true },
    });
    if (!row) throw new NotFoundException('Blog not found');
    return row;
  }

  listHomeBanners(viewer?: { stateId?: string; city?: string }) {
    return this.prisma.homeBanner.findMany({
      where: {
        isActive: true,
        ...coverageVisibilityWhere(viewer),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        image: true,
        url: true,
        sortOrder: true,
        coverageFlag: true,
        coverageStateId: true,
        coverageCity: true,
      },
    });
  }

  listJobAlerts() {
    return this.systemSettings.listPublicJobAlerts();
  }

  /** Upcoming / ongoing active events visible for the viewer's coverage. */
  listEvents(viewer?: { stateId?: string; city?: string }) {
    const now = new Date();
    return this.prisma.event.findMany({
      where: {
        isActive: true,
        adminFlag: { not: AdminLifecycleFlag.DELETE },
        deletedAt: null,
        AND: [
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          eventCoverageVisibilityWhere(viewer),
        ],
      },
      include: {
        coverageState: { select: { id: true, name: true, code: true } },
      },
      orderBy: { startsAt: 'asc' },
      take: 100,
    });
  }

  async listPaymentPlans() {
    const [plans, headerText] = await Promise.all([
      this.paymentPlans.listPublic(),
      this.systemSettings.getValue(
        SYSTEM_SETTING_KEYS.SPONSORSHIP_PLANS_HEADER,
        DEFAULT_SPONSORSHIP_PLANS_HEADER,
      ),
    ]);
    return { headerText, plans };
  }

  listUsefulLinks() {
    return this.cms.findAll('usefulLink', undefined, ['title', 'url'], { isActive: true });
  }

  listSocialSettings() {
    return this.cms.findAll('socialSetting', undefined, ['name', 'code'], { isActive: true });
  }

  async getPageBySlug(slug: string) {
    const aliases: Record<string, string[]> = {
      privacy: ['privacy', 'privacy-policy'],
      'privacy-policy': ['privacy-policy', 'privacy'],
      terms: ['terms', 'terms-and-conditions'],
      'terms-and-conditions': ['terms-and-conditions', 'terms'],
      about: ['about', 'about-us'],
      'about-us': ['about-us', 'about'],
    };
    const candidates = aliases[slug] || [slug];

    for (const candidate of candidates) {
      const page = await this.prisma.cmsPage.findFirst({
        where: { slug: candidate, isActive: true },
      });
      if (page) return page;
    }

    throw new NotFoundException('Page not found');
  }

  getContact() {
    return {
      address: this.config.get<string>('CONTACT_ADDRESS') || '',
      phone: this.config.get<string>('CONTACT_PHONE') || '',
      email: this.config.get<string>('CONTACT_EMAIL') || '',
      logo: this.config.get<string>('CONTACT_LOGO_URL') || '',
    };
  }

  listMarketplaceProducts(query?: {
    search?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    listingIntent?: string;
  }) {
    return this.marketplace.listPublic(query || {});
  }

  getMarketplaceProduct(id: string) {
    return this.marketplace.findPublic(id);
  }

  async createEnquiry(dto: CreatePublicEnquiryDto) {
    const last = await this.prisma.enquiry.findFirst({ orderBy: { sNo: 'desc' } });
    const nextSNo = (last?.sNo ?? 0) + 1;
    const now = new Date();
    const date = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return this.prisma.enquiry.create({
      data: {
        sNo: nextSNo,
        category: dto.category || 'Marketplace',
        subCategory: dto.subCategory || 'Sale',
        product: dto.product,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        date,
        createdBy: dto.createdBy,
        kind: dto.marketplaceProductId ? 'PRODUCT' : 'USER',
        status: EnquiryStatus.NEW,
        marketplaceProductId: dto.marketplaceProductId,
      },
    });
  }

  createHelpTicket(dto: CreatePublicHelpTicketDto) {
    return this.prisma.helpTicket.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        message: dto.message.trim(),
        status: 'OPEN',
      },
    });
  }

  listBecomeQuestions(target: BecomeTarget) {
    return this.become.listQuestionsPublic(target);
  }

  submitBecomeApplication(dto: CreateBecomeApplicationDto) {
    return this.become.submitApplication(dto);
  }

  listMyBecomeApplications(params: { userId?: string; email?: string }) {
    return this.become.listMine(params);
  }
}
