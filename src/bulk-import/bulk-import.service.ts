import {
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  CategoryType,
  Prisma,
  ProviderApprovalStatus,
  RoleName,
} from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import {
  assertStateAccess,
  resolveScopedStateId,
} from '../common/utils/state-scope';
import { slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import type { BulkImportEntity, BulkImportResult } from './bulk-import.types';
import {
  isUuid,
  normalizeRow,
  parseBool,
  parseFloatSafe,
  parseIntSafe,
  pick,
} from './bulk-import.utils';

const MAX_ROWS = 500;

const ENTITY_PERMISSION: Record<BulkImportEntity, string> = {
  categories: 'categories.write',
  subcategories: 'categories.write',
  keywords: 'categories.write',
  'service-providers': 'providers.write',
  'marketplace-products': 'marketplace.write',
  volunteers: 'volunteers.write',
  faqs: 'cms.write',
  blogs: 'cms.write',
  'job-alerts': 'cms.write',
  'useful-links': 'cms.write',
};

@Injectable()
export class BulkImportService {
  constructor(private prisma: PrismaService) {}

  async import(
    entity: BulkImportEntity,
    rows: Record<string, string>[],
    dryRun: boolean,
    currentUser: AuthUser,
    context?: { categoryId?: string; subcategoryId?: string },
  ): Promise<BulkImportResult> {
    this.assertPermission(entity, currentUser);

    if (rows.length > MAX_ROWS) {
      throw new BadRequestException(`Maximum ${MAX_ROWS} rows per import`);
    }

    const result: BulkImportResult = {
      dryRun,
      total: rows.length,
      created: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    const categoryCache = new Map<string, string>();
    const subcategoryCache = new Map<string, string>();
    const stateCache = new Map<string, string>();

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // header is row 1
      const row = normalizeRow(rows[i]);
      try {
        const outcome = await this.importRow(
          entity,
          row,
          dryRun,
          currentUser,
          context,
          categoryCache,
          subcategoryCache,
          stateCache,
        );
        if (outcome === 'created') result.created += 1;
        else result.skipped += 1;
      } catch (err) {
        result.failed += 1;
        result.errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Import failed',
        });
      }
    }

    return result;
  }

  private assertPermission(entity: BulkImportEntity, user: AuthUser) {
    if (user.role === RoleName.ADMIN) return;
    const required = ENTITY_PERMISSION[entity];
    const perms: string[] = user.permissions || [];
    if (!perms.includes(required)) {
      throw new ForbiddenException(`Missing required permission: ${required}`);
    }
  }

  private async importRow(
    entity: BulkImportEntity,
    row: Record<string, string>,
    dryRun: boolean,
    user: AuthUser,
    context: { categoryId?: string; subcategoryId?: string } | undefined,
    categoryCache: Map<string, string>,
    subcategoryCache: Map<string, string>,
    stateCache: Map<string, string>,
  ): Promise<'created' | 'skipped'> {
    switch (entity) {
      case 'categories':
        return this.importCategory(row, dryRun);
      case 'subcategories':
        return this.importSubcategory(row, dryRun, context, categoryCache);
      case 'keywords':
        return this.importKeyword(row, dryRun, context, categoryCache, subcategoryCache);
      case 'service-providers':
        return this.importServiceProvider(
          row,
          dryRun,
          user,
          categoryCache,
          subcategoryCache,
          stateCache,
        );
      case 'marketplace-products':
        return this.importMarketplaceProduct(row, dryRun);
      case 'volunteers':
        return this.importVolunteer(row, dryRun);
      case 'faqs':
        return this.importCms('faq', row, dryRun, ['title'], (r) => ({
          title: pick(r, 'title'),
          description: pick(r, 'description') || undefined,
          isActive: parseBool(pick(r, 'isactive', 'active'), true),
        }));
      case 'blogs':
        return this.importCms('blog', row, dryRun, ['title'], (r) => ({
          title: pick(r, 'title'),
          shortDescription: pick(r, 'shortdescription', 'short_description') || undefined,
          description: pick(r, 'description') || undefined,
          image: pick(r, 'image', 'imageurl', 'image_url') || undefined,
          isActive: parseBool(pick(r, 'isactive', 'active'), true),
        }));
      case 'job-alerts':
        return this.importCms('jobAlert', row, dryRun, ['title'], (r) => ({
          title: pick(r, 'title'),
          description: pick(r, 'description') || undefined,
          postDate: pick(r, 'postdate', 'post_date') || undefined,
          lastDate: pick(r, 'lastdate', 'last_date') || undefined,
          isActive: parseBool(pick(r, 'isactive', 'active'), true),
        }));
      case 'useful-links':
        return this.importCms('usefulLink', row, dryRun, ['title', 'url'], (r) => ({
          title: pick(r, 'title'),
          url: pick(r, 'url', 'link'),
          isActive: parseBool(pick(r, 'isactive', 'active'), true),
        }));
      default:
        throw new BadRequestException(`Unsupported entity: ${entity}`);
    }
  }

  private async importCategory(
    row: Record<string, string>,
    dryRun: boolean,
  ): Promise<'created' | 'skipped'> {
    const name = pick(row, 'name');
    if (!name) throw new BadRequestException('name is required');

    const slug = pick(row, 'slug') || slugify(name);
    const existing = await this.prisma.category.findFirst({
      where: { OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }] },
    });
    if (existing) return 'skipped';

    const typeRaw = pick(row, 'type').toUpperCase();
    const type =
      typeRaw === 'CARE' || typeRaw === 'HOME'
        ? CategoryType.CARE
        : CategoryType.SERVICE;

    if (dryRun) return 'created';

    await this.prisma.category.create({
      data: {
        name,
        slug,
        description: pick(row, 'description') || undefined,
        type,
        sortOrder: parseIntSafe(pick(row, 'sortorder', 'sort_order')),
        isActive: parseBool(pick(row, 'isactive', 'active'), true),
      },
    });
    return 'created';
  }

  private async resolveCategoryId(
    row: Record<string, string>,
    contextCategoryId: string | undefined,
    cache: Map<string, string>,
  ): Promise<string> {
    const raw =
      pick(row, 'categoryid', 'category_id') ||
      pick(row, 'category') ||
      contextCategoryId ||
      '';
    if (!raw) throw new BadRequestException('category is required');
    if (isUuid(raw)) return raw;

    const key = raw.toLowerCase();
    if (cache.has(key)) return cache.get(key)!;

    const category = await this.prisma.category.findFirst({
      where: { name: { equals: raw, mode: 'insensitive' } },
    });
    if (!category) throw new BadRequestException(`Category not found: ${raw}`);
    cache.set(key, category.id);
    return category.id;
  }

  private async resolveSubcategoryId(
    row: Record<string, string>,
    categoryId: string,
    contextSubcategoryId: string | undefined,
    cache: Map<string, string>,
  ): Promise<string | undefined> {
    const raw =
      pick(row, 'subcategoryid', 'subcategory_id') ||
      pick(row, 'subcategory') ||
      contextSubcategoryId ||
      '';
    if (!raw) return undefined;
    if (isUuid(raw)) return raw;

    const key = `${categoryId}::${raw.toLowerCase()}`;
    if (cache.has(key)) return cache.get(key);

    const subcategory = await this.prisma.subcategory.findFirst({
      where: {
        categoryId,
        name: { equals: raw, mode: 'insensitive' },
      },
    });
    if (!subcategory) {
      throw new BadRequestException(`Subcategory not found: ${raw}`);
    }
    cache.set(key, subcategory.id);
    return subcategory.id;
  }

  private async resolveStateId(
    row: Record<string, string>,
    user: AuthUser,
    cache: Map<string, string>,
  ): Promise<string> {
    const raw = pick(row, 'stateid', 'state_id', 'state');
    const scoped = resolveScopedStateId(user, raw || undefined);
    if (!scoped) {
      throw new BadRequestException('state is required');
    }

    if (user.role === RoleName.STATE_ADMIN) {
      assertStateAccess(user, scoped);
      return scoped;
    }

    if (isUuid(scoped)) return scoped;

    const key = scoped.toLowerCase();
    if (cache.has(key)) return cache.get(key)!;

    const state = await this.prisma.state.findFirst({
      where: {
        OR: [
          { name: { equals: scoped, mode: 'insensitive' } },
          { code: { equals: scoped, mode: 'insensitive' } },
        ],
      },
    });
    if (!state) throw new BadRequestException(`State not found: ${scoped}`);
    cache.set(key, state.id);
    return state.id;
  }

  private async importSubcategory(
    row: Record<string, string>,
    dryRun: boolean,
    context: { categoryId?: string } | undefined,
    categoryCache: Map<string, string>,
  ): Promise<'created' | 'skipped'> {
    const categoryId = await this.resolveCategoryId(
      row,
      context?.categoryId,
      categoryCache,
    );
    const name = pick(row, 'name');
    if (!name) throw new BadRequestException('name is required');

    const existing = await this.prisma.subcategory.findFirst({
      where: { categoryId, name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) return 'skipped';

    const slug = pick(row, 'slug') || slugify(name);
    if (dryRun) return 'created';

    await this.prisma.subcategory.create({
      data: {
        categoryId,
        name,
        slug,
        description: pick(row, 'description') || undefined,
        sortOrder: parseIntSafe(pick(row, 'sortorder', 'sort_order')),
        isActive: parseBool(pick(row, 'isactive', 'active'), true),
      },
    });
    return 'created';
  }

  private async importKeyword(
    row: Record<string, string>,
    dryRun: boolean,
    context: { categoryId?: string; subcategoryId?: string } | undefined,
    categoryCache: Map<string, string>,
    subcategoryCache: Map<string, string>,
  ): Promise<'created' | 'skipped'> {
    const categoryId = await this.resolveCategoryId(
      row,
      context?.categoryId,
      categoryCache,
    );
    const subcategoryId = await this.resolveSubcategoryId(
      row,
      categoryId,
      context?.subcategoryId,
      subcategoryCache,
    );
    if (!subcategoryId) {
      throw new BadRequestException('subcategory is required');
    }

    const term = pick(row, 'term', 'keyword');
    if (!term) throw new BadRequestException('term is required');

    const existing = await this.prisma.keyword.findFirst({
      where: {
        subcategoryId,
        term: { equals: term, mode: 'insensitive' },
      },
    });
    if (existing) return 'skipped';

    if (dryRun) return 'created';

    await this.prisma.keyword.create({
      data: {
        subcategoryId,
        term,
        isActive: parseBool(pick(row, 'isactive', 'active'), true),
      },
    });
    return 'created';
  }

  private async importServiceProvider(
    row: Record<string, string>,
    dryRun: boolean,
    user: AuthUser,
    categoryCache: Map<string, string>,
    subcategoryCache: Map<string, string>,
    stateCache: Map<string, string>,
  ): Promise<'created' | 'skipped'> {
    const name = pick(row, 'name');
    if (!name) throw new BadRequestException('name is required');

    const categoryId = await this.resolveCategoryId(row, undefined, categoryCache);
    const subcategoryId = await this.resolveSubcategoryId(
      row,
      categoryId,
      undefined,
      subcategoryCache,
    );
    const stateId = await this.resolveStateId(row, user, stateCache);

    const statusRaw = pick(row, 'approvalstatus', 'approval_status', 'status').toUpperCase();
    let approvalStatus: ProviderApprovalStatus = ProviderApprovalStatus.APPROVED;
    if (statusRaw === 'PENDING' || statusRaw === 'PENDING_APPROVAL') {
      approvalStatus = ProviderApprovalStatus.PENDING_APPROVAL;
    } else if (statusRaw === 'REJECTED') {
      approvalStatus = ProviderApprovalStatus.REJECTED;
    }

    if (dryRun) return 'created';

    await this.prisma.serviceProvider.create({
      data: {
        name,
        categoryId,
        subcategoryId,
        stateId,
        description: pick(row, 'description') || undefined,
        phone: pick(row, 'phone') || undefined,
        landline: pick(row, 'landline') || undefined,
        email: pick(row, 'email') || undefined,
        website: pick(row, 'website') || undefined,
        address: pick(row, 'address') || undefined,
        city: pick(row, 'city') || undefined,
        latitude: parseFloatSafe(pick(row, 'latitude', 'lat')),
        longitude: parseFloatSafe(pick(row, 'longitude', 'lng', 'lon')),
        googlePlaceId: pick(row, 'googleplaceid', 'google_place_id') || undefined,
        about: pick(row, 'about') || undefined,
        services: pick(row, 'services') || undefined,
        coverPhotoUrl: pick(row, 'coverphotourl', 'cover_photo_url', 'image') || undefined,
        isActive: parseBool(pick(row, 'isactive', 'active'), true),
        approvalStatus,
        createdById: user.id,
        approvedById:
          approvalStatus === ProviderApprovalStatus.APPROVED ? user.id : undefined,
        approvedAt:
          approvalStatus === ProviderApprovalStatus.APPROVED ? new Date() : undefined,
      },
    });
    return 'created';
  }

  private async importMarketplaceProduct(
    row: Record<string, string>,
    dryRun: boolean,
  ): Promise<'created' | 'skipped'> {
    const name = pick(row, 'name', 'product');
    if (!name) throw new BadRequestException('name is required');

    if (dryRun) return 'created';

    const intentRaw = pick(row, 'listingintent', 'listing_intent', 'intent').toLowerCase();
    await this.prisma.marketplaceProduct.create({
      data: {
        name,
        actualPrice: pick(row, 'actualprice', 'actual_price', 'mrp') || undefined,
        offerPrice: pick(row, 'offerprice', 'offer_price', 'price') || undefined,
        phone: pick(row, 'phone') || undefined,
        listingIntent: intentRaw === 'buy' ? 'buy' : 'sell',
        sellerName: pick(row, 'sellername', 'seller_name', 'seller') || undefined,
        description: pick(row, 'description') || undefined,
        address: pick(row, 'address') || undefined,
        color: pick(row, 'color') || undefined,
        brand: pick(row, 'brand') || undefined,
        features: pick(row, 'features') || undefined,
        location: pick(row, 'location') || undefined,
        isActive: parseBool(pick(row, 'isactive', 'active'), true),
      },
    });
    return 'created';
  }

  private async importVolunteer(
    row: Record<string, string>,
    dryRun: boolean,
  ): Promise<'created' | 'skipped'> {
    const name = pick(row, 'name');
    if (!name) throw new BadRequestException('name is required');

    if (dryRun) return 'created';

    await this.prisma.volunteer.create({
      data: {
        name,
        email: pick(row, 'email') || undefined,
        phone: pick(row, 'phone') || undefined,
        location: pick(row, 'location') || undefined,
        isActive: parseBool(pick(row, 'isactive', 'active'), true),
      },
    });
    return 'created';
  }

  private async importCms(
    model: 'faq' | 'blog' | 'jobAlert' | 'usefulLink',
    row: Record<string, string>,
    dryRun: boolean,
    requiredFields: string[],
    build: (row: Record<string, string>) => Record<string, unknown>,
  ): Promise<'created' | 'skipped'> {
    for (const field of requiredFields) {
      if (!pick(row, field)) {
        throw new BadRequestException(`${field} is required`);
      }
    }

    if (dryRun) return 'created';

    const data = build(row);
    switch (model) {
      case 'faq':
        await this.prisma.faq.create({ data: data as Prisma.FaqCreateInput });
        break;
      case 'blog':
        await this.prisma.blog.create({ data: data as Prisma.BlogCreateInput });
        break;
      case 'jobAlert':
        await this.prisma.jobAlert.create({ data: data as Prisma.JobAlertCreateInput });
        break;
      case 'usefulLink':
        await this.prisma.usefulLink.create({ data: data as Prisma.UsefulLinkCreateInput });
        break;
    }
    return 'created';
  }

  getTemplate(entity: BulkImportEntity): { columns: string[]; sample: string[] } {
    const templates: Record<BulkImportEntity, { columns: string[]; sample: string[] }> = {
      categories: {
        columns: ['name', 'slug', 'description', 'type', 'sortOrder', 'isActive'],
        sample: ['Physiotherapy', 'physiotherapy', 'Rehab services', 'SERVICE', '0', 'true'],
      },
      subcategories: {
        columns: ['category', 'name', 'slug', 'description', 'sortOrder', 'isActive'],
        sample: ['Physiotherapy', 'Pediatric PT', 'pediatric-pt', '', '0', 'true'],
      },
      keywords: {
        columns: ['category', 'subcategory', 'term', 'isActive'],
        sample: ['Physiotherapy', 'Pediatric PT', 'child therapy', 'true'],
      },
      'service-providers': {
        columns: [
          'name',
          'category',
          'subcategory',
          'state',
          'city',
          'address',
          'phone',
          'email',
          'website',
          'description',
          'latitude',
          'longitude',
          'coverPhotoUrl',
          'isActive',
          'approvalStatus',
        ],
        sample: [
          'ABC Clinic',
          'Physiotherapy',
          'Pediatric PT',
          'Maharashtra',
          'Mumbai',
          '123 Main St',
          '9876543210',
          'info@abc.com',
          'https://abc.com',
          'Full-service clinic',
          '19.076',
          '72.877',
          '',
          'true',
          'APPROVED',
        ],
      },
      'marketplace-products': {
        columns: [
          'name',
          'actualPrice',
          'offerPrice',
          'phone',
          'listingIntent',
          'sellerName',
          'description',
          'address',
          'brand',
          'isActive',
        ],
        sample: [
          'Wheelchair',
          '15000',
          '12000',
          '9876543210',
          'sell',
          'John Doe',
          'Lightweight wheelchair',
          'Pune',
          'XYZ',
          'true',
        ],
      },
      volunteers: {
        columns: ['name', 'email', 'phone', 'location', 'isActive'],
        sample: ['Jane Doe', 'jane@example.com', '9876543210', 'Delhi', 'true'],
      },
      faqs: {
        columns: ['title', 'description', 'isActive'],
        sample: ['How to register?', 'Use the mobile app sign up flow.', 'true'],
      },
      blogs: {
        columns: ['title', 'shortDescription', 'description', 'image', 'isActive'],
        sample: ['Awareness day', 'Short summary', 'Full article text', '', 'true'],
      },
      'job-alerts': {
        columns: ['title', 'description', 'postDate', 'lastDate', 'isActive'],
        sample: ['Hiring therapist', 'Full-time role', '2026-01-01', '2026-02-01', 'true'],
      },
      'useful-links': {
        columns: ['title', 'url', 'isActive'],
        sample: ['Government portal', 'https://example.gov.in', 'true'],
      },
    };
    return templates[entity];
  }
}
