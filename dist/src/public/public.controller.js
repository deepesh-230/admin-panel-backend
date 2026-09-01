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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../common/decorators/public.decorator");
const create_public_enquiry_dto_1 = require("./dto/create-public-enquiry.dto");
const public_service_1 = require("./public.service");
let PublicController = class PublicController {
    publicService;
    constructor(publicService) {
        this.publicService = publicService;
    }
    listCategories(type) {
        const typeFilter = type === client_1.CategoryType.CARE || type === client_1.CategoryType.SERVICE ? type : undefined;
        return this.publicService.listCategories(typeFilter);
    }
    listSubcategories(categoryId) {
        return this.publicService.listSubcategories(categoryId);
    }
    listStates() {
        return this.publicService.listStates();
    }
    listFaqs() {
        return this.publicService.listFaqs();
    }
    listBlogs() {
        return this.publicService.listBlogs();
    }
    listJobAlerts() {
        return this.publicService.listJobAlerts();
    }
    listUsefulLinks() {
        return this.publicService.listUsefulLinks();
    }
    getPage(slug) {
        return this.publicService.getPageBySlug(slug);
    }
    getContact() {
        return this.publicService.getContact();
    }
    listMarketplaceProducts(search) {
        return this.publicService.listMarketplaceProducts(search);
    }
    getMarketplaceProduct(id) {
        return this.publicService.getMarketplaceProduct(id);
    }
    createEnquiry(dto) {
        return this.publicService.createEnquiry(dto);
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Get)('categories/:categoryId/subcategories'),
    __param(0, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listSubcategories", null);
__decorate([
    (0, common_1.Get)('states'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listStates", null);
__decorate([
    (0, common_1.Get)('faqs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listFaqs", null);
__decorate([
    (0, common_1.Get)('blogs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listBlogs", null);
__decorate([
    (0, common_1.Get)('job-alerts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listJobAlerts", null);
__decorate([
    (0, common_1.Get)('useful-links'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listUsefulLinks", null);
__decorate([
    (0, common_1.Get)('pages/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getPage", null);
__decorate([
    (0, common_1.Get)('contact'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getContact", null);
__decorate([
    (0, common_1.Get)('marketplace/products'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "listMarketplaceProducts", null);
__decorate([
    (0, common_1.Get)('marketplace/products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "getMarketplaceProduct", null);
__decorate([
    (0, common_1.Post)('enquiries'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_public_enquiry_dto_1.CreatePublicEnquiryDto]),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "createEnquiry", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)('public'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [public_service_1.PublicService])
], PublicController);
//# sourceMappingURL=public.controller.js.map