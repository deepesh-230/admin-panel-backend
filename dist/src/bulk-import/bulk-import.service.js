"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const state_scope_1 = require("../common/utils/state-scope");
const slugify_1 = require("../common/utils/slugify");
const prisma_service_1 = require("../prisma/prisma.service");
const bulk_import_utils_1 = require("./bulk-import.utils");
const MAX_ROWS = 500;
const ENTITY_PERMISSION = {
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
let BulkImportService = class BulkImportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async import(entity, rows, dryRun, currentUser, context) {
        this.assertPermission(entity, currentUser);
        if (rows.length > MAX_ROWS) {
            throw new common_1.BadRequestException(`Maximum ${MAX_ROWS} rows per import`);
        }
        const result = {
            dryRun,
            total: rows.length,
            created: 0,
            skipped: 0,
            failed: 0,
            errors: [],
        };
        const categoryCache = new Map();
        const subcategoryCache = new Map();
        const stateCache = new Map();
        for (let i = 0; i < rows.length; i++) {
            const rowNum = i + 2;
            const row = (0, bulk_import_utils_1.normalizeRow)(rows[i]);
            try {
                const outcome = await this.importRow(entity, row, dryRun, currentUser, context, categoryCache, subcategoryCache, stateCache);
                if (outcome === 'created')
                    result.created += 1;
                else
                    result.skipped += 1;
            }
            catch (err) {
                result.failed += 1;
                result.errors.push({
                    row: rowNum,
                    message: err instanceof Error ? err.message : 'Import failed',
                });
            }
        }
        return result;
    }
    assertPermission(entity, user) {
        if (user.role === client_1.RoleName.ADMIN)
            return;
        const required = ENTITY_PERMISSION[entity];
        const perms = user.permissions || [];
        if (!perms.includes(required)) {
            throw new common_1.ForbiddenException(`Missing required permission: ${required}`);
        }
    }
    async importRow(entity, row, dryRun, user, context, categoryCache, subcategoryCache, stateCache) {
        switch (entity) {
            case 'categories':
                return this.importCategory(row, dryRun);
            case 'subcategories':
                return this.importSubcategory(row, dryRun, context, categoryCache);
            case 'keywords':
                return this.importKeyword(row, dryRun, context, categoryCache, subcategoryCache);
            case 'service-providers':
                return this.importServiceProvider(row, dryRun, user, categoryCache, subcategoryCache, stateCache);
            case 'marketplace-products':
                return this.importMarketplaceProduct(row, dryRun);
            case 'volunteers':
                return this.importVolunteer(row, dryRun);
            case 'faqs':
                return this.importCms('faq', row, dryRun, ['title'], (r) => ({
                    title: (0, bulk_import_utils_1.pick)(r, 'title'),
                    description: (0, bulk_import_utils_1.pick)(r, 'description') || undefined,
                    isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(r, 'isactive', 'active'), true),
                }));
            case 'blogs':
                return this.importCms('blog', row, dryRun, ['title'], (r) => ({
                    title: (0, bulk_import_utils_1.pick)(r, 'title'),
                    shortDescription: (0, bulk_import_utils_1.pick)(r, 'shortdescription', 'short_description') || undefined,
                    description: (0, bulk_import_utils_1.pick)(r, 'description') || undefined,
                    image: (0, bulk_import_utils_1.pick)(r, 'image', 'imageurl', 'image_url') || undefined,
                    isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(r, 'isactive', 'active'), true),
                }));
            case 'job-alerts':
                return this.importCms('jobAlert', row, dryRun, ['title'], (r) => ({
                    title: (0, bulk_import_utils_1.pick)(r, 'title'),
                    description: (0, bulk_import_utils_1.pick)(r, 'description') || undefined,
                    postDate: (0, bulk_import_utils_1.pick)(r, 'postdate', 'post_date') || undefined,
                    lastDate: (0, bulk_import_utils_1.pick)(r, 'lastdate', 'last_date') || undefined,
                    isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(r, 'isactive', 'active'), true),
                }));
            case 'useful-links':
                return this.importCms('usefulLink', row, dryRun, ['title', 'url'], (r) => ({
                    title: (0, bulk_import_utils_1.pick)(r, 'title'),
                    url: (0, bulk_import_utils_1.pick)(r, 'url', 'link'),
                    isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(r, 'isactive', 'active'), true),
                }));
            default:
                throw new common_1.BadRequestException(`Unsupported entity: ${entity}`);
        }
    }
    async importCategory(row, dryRun) {
        const name = (0, bulk_import_utils_1.pick)(row, 'name');
        if (!name)
            throw new common_1.BadRequestException('name is required');
        const slug = (0, bulk_import_utils_1.pick)(row, 'slug') || (0, slugify_1.slugify)(name);
        const existing = await this.prisma.category.findFirst({
            where: { OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }] },
        });
        if (existing)
            return 'skipped';
        const typeRaw = (0, bulk_import_utils_1.pick)(row, 'type').toUpperCase();
        const type = typeRaw === 'CARE' || typeRaw === 'HOME'
            ? client_1.CategoryType.CARE
            : client_1.CategoryType.SERVICE;
        if (dryRun)
            return 'created';
        await this.prisma.category.create({
            data: {
                name,
                slug,
                description: (0, bulk_import_utils_1.pick)(row, 'description') || undefined,
                type,
                sortOrder: (0, bulk_import_utils_1.parseIntSafe)((0, bulk_import_utils_1.pick)(row, 'sortorder', 'sort_order')),
                isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(row, 'isactive', 'active'), true),
            },
        });
        return 'created';
    }
    async resolveCategoryId(row, contextCategoryId, cache) {
        const raw = (0, bulk_import_utils_1.pick)(row, 'categoryid', 'category_id') ||
            (0, bulk_import_utils_1.pick)(row, 'category') ||
            contextCategoryId ||
            '';
        if (!raw)
            throw new common_1.BadRequestException('category is required');
        if ((0, bulk_import_utils_1.isUuid)(raw))
            return raw;
        const key = raw.toLowerCase();
        if (cache.has(key))
            return cache.get(key);
        const category = await this.prisma.category.findFirst({
            where: { name: { equals: raw, mode: 'insensitive' } },
        });
        if (!category)
            throw new common_1.BadRequestException(`Category not found: ${raw}`);
        cache.set(key, category.id);
        return category.id;
    }
    async resolveSubcategoryId(row, categoryId, contextSubcategoryId, cache) {
        const raw = (0, bulk_import_utils_1.pick)(row, 'subcategoryid', 'subcategory_id') ||
            (0, bulk_import_utils_1.pick)(row, 'subcategory') ||
            contextSubcategoryId ||
            '';
        if (!raw)
            return undefined;
        if ((0, bulk_import_utils_1.isUuid)(raw))
            return raw;
        const key = `${categoryId}::${raw.toLowerCase()}`;
        if (cache.has(key))
            return cache.get(key);
        const subcategory = await this.prisma.subcategory.findFirst({
            where: {
                categoryId,
                name: { equals: raw, mode: 'insensitive' },
            },
        });
        if (!subcategory) {
            throw new common_1.BadRequestException(`Subcategory not found: ${raw}`);
        }
        cache.set(key, subcategory.id);
        return subcategory.id;
    }
    async resolveStateId(row, user, cache) {
        const raw = (0, bulk_import_utils_1.pick)(row, 'stateid', 'state_id', 'state');
        const scoped = (0, state_scope_1.resolveScopedStateId)(user, raw || undefined);
        if (!scoped) {
            throw new common_1.BadRequestException('state is required');
        }
        if (user.role === client_1.RoleName.STATE_ADMIN) {
            (0, state_scope_1.assertStateAccess)(user, scoped);
            return scoped;
        }
        if ((0, bulk_import_utils_1.isUuid)(scoped))
            return scoped;
        const key = scoped.toLowerCase();
        if (cache.has(key))
            return cache.get(key);
        const state = await this.prisma.state.findFirst({
            where: {
                OR: [
                    { name: { equals: scoped, mode: 'insensitive' } },
                    { code: { equals: scoped, mode: 'insensitive' } },
                ],
            },
        });
        if (!state)
            throw new common_1.BadRequestException(`State not found: ${scoped}`);
        cache.set(key, state.id);
        return state.id;
    }
    async importSubcategory(row, dryRun, context, categoryCache) {
        const categoryId = await this.resolveCategoryId(row, context?.categoryId, categoryCache);
        const name = (0, bulk_import_utils_1.pick)(row, 'name');
        if (!name)
            throw new common_1.BadRequestException('name is required');
        const existing = await this.prisma.subcategory.findFirst({
            where: { categoryId, name: { equals: name, mode: 'insensitive' } },
        });
        if (existing)
            return 'skipped';
        const slug = (0, bulk_import_utils_1.pick)(row, 'slug') || (0, slugify_1.slugify)(name);
        if (dryRun)
            return 'created';
        await this.prisma.subcategory.create({
            data: {
                categoryId,
                name,
                slug,
                description: (0, bulk_import_utils_1.pick)(row, 'description') || undefined,
                sortOrder: (0, bulk_import_utils_1.parseIntSafe)((0, bulk_import_utils_1.pick)(row, 'sortorder', 'sort_order')),
                isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(row, 'isactive', 'active'), true),
            },
        });
        return 'created';
    }
    async importKeyword(row, dryRun, context, categoryCache, subcategoryCache) {
        const categoryId = await this.resolveCategoryId(row, context?.categoryId, categoryCache);
        const subcategoryId = await this.resolveSubcategoryId(row, categoryId, context?.subcategoryId, subcategoryCache);
        if (!subcategoryId) {
            throw new common_1.BadRequestException('subcategory is required');
        }
        const term = (0, bulk_import_utils_1.pick)(row, 'term', 'keyword');
        if (!term)
            throw new common_1.BadRequestException('term is required');
        const existing = await this.prisma.keyword.findFirst({
            where: {
                subcategoryId,
                term: { equals: term, mode: 'insensitive' },
            },
        });
        if (existing)
            return 'skipped';
        if (dryRun)
            return 'created';
        await this.prisma.keyword.create({
            data: {
                subcategoryId,
                term,
                isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(row, 'isactive', 'active'), true),
            },
        });
        return 'created';
    }
    async importServiceProvider(row, dryRun, user, categoryCache, subcategoryCache, stateCache) {
        const name = (0, bulk_import_utils_1.pick)(row, 'name');
        if (!name)
            throw new common_1.BadRequestException('name is required');
        const categoryId = await this.resolveCategoryId(row, undefined, categoryCache);
        const subcategoryId = await this.resolveSubcategoryId(row, categoryId, undefined, subcategoryCache);
        const stateId = await this.resolveStateId(row, user, stateCache);
        const statusRaw = (0, bulk_import_utils_1.pick)(row, 'approvalstatus', 'approval_status', 'status').toUpperCase();
        let approvalStatus = client_1.ProviderApprovalStatus.APPROVED;
        if (statusRaw === 'PENDING' || statusRaw === 'PENDING_APPROVAL') {
            approvalStatus = client_1.ProviderApprovalStatus.PENDING_APPROVAL;
        }
        else if (statusRaw === 'REJECTED') {
            approvalStatus = client_1.ProviderApprovalStatus.REJECTED;
        }
        if (dryRun)
            return 'created';
        await this.prisma.serviceProvider.create({
            data: {
                name,
                categoryId,
                subcategoryId,
                stateId,
                description: (0, bulk_import_utils_1.pick)(row, 'description') || undefined,
                phone: (0, bulk_import_utils_1.pick)(row, 'phone') || undefined,
                landline: (0, bulk_import_utils_1.pick)(row, 'landline') || undefined,
                email: (0, bulk_import_utils_1.pick)(row, 'email') || undefined,
                website: (0, bulk_import_utils_1.pick)(row, 'website') || undefined,
                address: (0, bulk_import_utils_1.pick)(row, 'address') || undefined,
                city: (0, bulk_import_utils_1.pick)(row, 'city') || undefined,
                latitude: (0, bulk_import_utils_1.parseFloatSafe)((0, bulk_import_utils_1.pick)(row, 'latitude', 'lat')),
                longitude: (0, bulk_import_utils_1.parseFloatSafe)((0, bulk_import_utils_1.pick)(row, 'longitude', 'lng', 'lon')),
                googlePlaceId: (0, bulk_import_utils_1.pick)(row, 'googleplaceid', 'google_place_id') || undefined,
                about: (0, bulk_import_utils_1.pick)(row, 'about') || undefined,
                services: (0, bulk_import_utils_1.pick)(row, 'services') || undefined,
                coverPhotoUrl: (0, bulk_import_utils_1.pick)(row, 'coverphotourl', 'cover_photo_url', 'image') || undefined,
                isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(row, 'isactive', 'active'), true),
                approvalStatus,
                createdById: user.id,
                approvedById: approvalStatus === client_1.ProviderApprovalStatus.APPROVED ? user.id : undefined,
                approvedAt: approvalStatus === client_1.ProviderApprovalStatus.APPROVED ? new Date() : undefined,
            },
        });
        return 'created';
    }
    async importMarketplaceProduct(row, dryRun) {
        const name = (0, bulk_import_utils_1.pick)(row, 'name', 'product');
        if (!name)
            throw new common_1.BadRequestException('name is required');
        if (dryRun)
            return 'created';
        const intentRaw = (0, bulk_import_utils_1.pick)(row, 'listingintent', 'listing_intent', 'intent').toLowerCase();
        await this.prisma.marketplaceProduct.create({
            data: {
                name,
                actualPrice: (0, bulk_import_utils_1.pick)(row, 'actualprice', 'actual_price', 'mrp') || undefined,
                offerPrice: (0, bulk_import_utils_1.pick)(row, 'offerprice', 'offer_price', 'price') || undefined,
                phone: (0, bulk_import_utils_1.pick)(row, 'phone') || undefined,
                listingIntent: intentRaw === 'buy' ? 'buy' : 'sell',
                sellerName: (0, bulk_import_utils_1.pick)(row, 'sellername', 'seller_name', 'seller') || undefined,
                description: (0, bulk_import_utils_1.pick)(row, 'description') || undefined,
                address: (0, bulk_import_utils_1.pick)(row, 'address') || undefined,
                color: (0, bulk_import_utils_1.pick)(row, 'color') || undefined,
                brand: (0, bulk_import_utils_1.pick)(row, 'brand') || undefined,
                features: (0, bulk_import_utils_1.pick)(row, 'features') || undefined,
                location: (0, bulk_import_utils_1.pick)(row, 'location') || undefined,
                isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(row, 'isactive', 'active'), true),
            },
        });
        return 'created';
    }
    async importVolunteer(row, dryRun) {
        const name = (0, bulk_import_utils_1.pick)(row, 'name');
        if (!name)
            throw new common_1.BadRequestException('name is required');
        if (dryRun)
            return 'created';
        await this.prisma.volunteer.create({
            data: {
                name,
                email: (0, bulk_import_utils_1.pick)(row, 'email') || undefined,
                phone: (0, bulk_import_utils_1.pick)(row, 'phone') || undefined,
                location: (0, bulk_import_utils_1.pick)(row, 'location') || undefined,
                isActive: (0, bulk_import_utils_1.parseBool)((0, bulk_import_utils_1.pick)(row, 'isactive', 'active'), true),
            },
        });
        return 'created';
    }
    async importCms(model, row, dryRun, requiredFields, build) {
        for (const field of requiredFields) {
            if (!(0, bulk_import_utils_1.pick)(row, field)) {
                throw new common_1.BadRequestException(`${field} is required`);
            }
        }
        if (dryRun)
            return 'created';
        const data = build(row);
        switch (model) {
            case 'faq':
                await this.prisma.faq.create({ data: data });
                break;
            case 'blog':
                await this.prisma.blog.create({ data: data });
                break;
            case 'jobAlert':
                await this.prisma.jobAlert.create({ data: data });
                break;
            case 'usefulLink':
                await this.prisma.usefulLink.create({ data: data });
                break;
        }
        return 'created';
    }
    getTemplate(entity) {
        const templates = {
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
};
exports.BulkImportService = BulkImportService;
exports.BulkImportService = BulkImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BulkImportService);
//# sourceMappingURL=bulk-import.service.js.map