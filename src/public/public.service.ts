import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CategoryType, EnquiryStatus } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';
import { CmsService } from '../cms/cms.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { PrismaService } from '../prisma/prisma.service';
import { StatesService } from '../states/states.service';
import { CreatePublicEnquiryDto } from './dto/create-public-enquiry.dto';

@Injectable()
export class PublicService {
  constructor(
    private categories: CategoriesService,
    private states: StatesService,
    private cms: CmsService,
    private marketplace: MarketplaceService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  listCategories(type?: CategoryType) {
    return this.categories.findAll(undefined, true, type);
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

  listStates() {
    return this.states.findAll(undefined, true);
  }

  listFaqs() {
    return this.cms.findAll('faq', undefined, ['title', 'description'], { isActive: true });
  }

  listBlogs() {
    return this.cms.findAll('blog', undefined, ['title', 'shortDescription', 'description'], {
      isActive: true,
    });
  }

  listJobAlerts() {
    return this.cms.findAll('jobAlert', undefined, ['title', 'description'], { isActive: true });
  }

  listUsefulLinks() {
    return this.cms.findAll('usefulLink', undefined, ['title', 'url'], { isActive: true });
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findFirst({
      where: { slug, isActive: true },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  getContact() {
    return {
      address: this.config.get<string>('CONTACT_ADDRESS') || '',
      phone: this.config.get<string>('CONTACT_PHONE') || '',
      email: this.config.get<string>('CONTACT_EMAIL') || '',
      logo: this.config.get<string>('CONTACT_LOGO_URL') || '',
    };
  }

  listMarketplaceProducts(search?: string) {
    return this.marketplace.listPublic(search);
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
}
