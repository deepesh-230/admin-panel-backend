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
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const categories_service_1 = require("../categories/categories.service");
const cms_service_1 = require("../cms/cms.service");
const marketplace_service_1 = require("../marketplace/marketplace.service");
const prisma_service_1 = require("../prisma/prisma.service");
const states_service_1 = require("../states/states.service");
let PublicService = class PublicService {
    categories;
    states;
    cms;
    marketplace;
    prisma;
    config;
    constructor(categories, states, cms, marketplace, prisma, config) {
        this.categories = categories;
        this.states = states;
        this.cms = cms;
        this.marketplace = marketplace;
        this.prisma = prisma;
        this.config = config;
    }
    listCategories(type) {
        return this.categories.findAll(undefined, true, type);
    }
    async listSubcategories(categoryId) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId, isActive: true },
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
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
    async getPageBySlug(slug) {
        const page = await this.prisma.cmsPage.findFirst({
            where: { slug, isActive: true },
        });
        if (!page)
            throw new common_1.NotFoundException('Page not found');
        return page;
    }
    getContact() {
        return {
            address: this.config.get('CONTACT_ADDRESS') || '',
            phone: this.config.get('CONTACT_PHONE') || '',
            email: this.config.get('CONTACT_EMAIL') || '',
            logo: this.config.get('CONTACT_LOGO_URL') || '',
        };
    }
    listMarketplaceProducts(search) {
        return this.marketplace.listPublic(search);
    }
    getMarketplaceProduct(id) {
        return this.marketplace.findPublic(id);
    }
    async createEnquiry(dto) {
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
                kind: 'USER',
                status: client_1.EnquiryStatus.NEW,
                marketplaceProductId: dto.marketplaceProductId,
            },
        });
    }
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService,
        states_service_1.StatesService,
        cms_service_1.CmsService,
        marketplace_service_1.MarketplaceService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], PublicService);
//# sourceMappingURL=public.service.js.map