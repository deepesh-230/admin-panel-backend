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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const broadcasts_service_1 = require("../cms/broadcasts.service");
const create_marketplace_product_dto_1 = require("./dto/create-marketplace-product.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const marketplace_service_1 = require("../marketplace/marketplace.service");
const prisma_service_1 = require("../prisma/prisma.service");
const digipin_util_1 = require("../common/digipin.util");
let ProfileController = class ProfileController {
    marketplace;
    prisma;
    broadcasts;
    constructor(marketplace, prisma, broadcasts) {
        this.marketplace = marketplace;
        this.prisma = prisma;
        this.broadcasts = broadcasts;
    }
    async updateProfile(user, dto) {
        const shouldRecomputeDigipin = dto.latitude !== undefined && dto.longitude !== undefined;
        const digipinFields = shouldRecomputeDigipin
            ? (0, digipin_util_1.resolveDigipinFields)(dto.latitude, dto.longitude, dto.pincode)
            : dto.pincode !== undefined
                ? { digipin: undefined, pincode: dto.pincode.trim() || null }
                : {};
        const updated = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                name: dto.name,
                phone: dto.phone,
                location: dto.location,
                latitude: dto.latitude,
                longitude: dto.longitude,
                km: dto.km,
                ...(digipinFields.digipin !== undefined ? { digipin: digipinFields.digipin } : {}),
                ...(digipinFields.pincode !== undefined ? { pincode: digipinFields.pincode } : {}),
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                location: true,
                latitude: true,
                longitude: true,
                digipin: true,
                pincode: true,
                km: true,
                isActive: true,
            },
        });
        return {
            success: true,
            message: 'Profile updated',
            data: updated,
        };
    }
    myMarketplaceProducts(user) {
        return this.marketplace.listForUser(user.id);
    }
    async createMarketplaceProduct(user, dto) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { name: true },
        });
        return this.marketplace.createForUser(user.id, dbUser?.name, dto);
    }
    listBroadcasts(user) {
        return this.broadcasts.listForUser(user.id);
    }
    markBroadcastRead(user, id) {
        return this.broadcasts.markRead(user.id, id);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Patch)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.END_USER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('marketplace/products'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "myMarketplaceProducts", null);
__decorate([
    (0, common_1.Post)('marketplace/products'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_marketplace_product_dto_1.CreateMarketplaceProductDto]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "createMarketplaceProduct", null);
__decorate([
    (0, common_1.Get)('broadcasts'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.END_USER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "listBroadcasts", null);
__decorate([
    (0, common_1.Patch)('broadcasts/:id/read'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.END_USER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "markBroadcastRead", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('profile'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.END_USER, client_1.RoleName.ADMIN),
    __metadata("design:paramtypes", [marketplace_service_1.MarketplaceService,
        prisma_service_1.PrismaService,
        broadcasts_service_1.BroadcastsService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map