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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const dashboard_service_1 = require("./dashboard.service");
class SetFlagDto {
    entity;
    id;
    flag;
}
__decorate([
    (0, class_validator_1.IsIn)(['enquiry', 'suggestion', 'jobAlert', 'event', 'marketplaceProduct']),
    __metadata("design:type", String)
], SetFlagDto.prototype, "entity", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SetFlagDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AdminLifecycleFlag),
    __metadata("design:type", String)
], SetFlagDto.prototype, "flag", void 0);
class CreateEventDto {
    title;
    description;
    location;
    startsAt;
    endsAt;
    isActive;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "startsAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "endsAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEventDto.prototype, "isActive", void 0);
class UpdateEventDto {
    title;
    description;
    location;
    startsAt;
    endsAt;
    isActive;
    adminFlag;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "startsAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateEventDto.prototype, "endsAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateEventDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AdminLifecycleFlag),
    __metadata("design:type", String)
], UpdateEventDto.prototype, "adminFlag", void 0);
let DashboardController = class DashboardController {
    dashboardService;
    prisma;
    constructor(dashboardService, prisma) {
        this.dashboardService = dashboardService;
        this.prisma = prisma;
    }
    getStats(user, from, to) {
        return this.dashboardService.getStats(user, { from, to });
    }
    purgeDeleted() {
        return this.dashboardService.purgeDeleted(60);
    }
    backfill() {
        return this.dashboardService.backfill();
    }
    async setFlag(dto) {
        const deletedAt = dto.flag === client_1.AdminLifecycleFlag.DELETE ? new Date() : null;
        const data = { adminFlag: dto.flag, deletedAt };
        switch (dto.entity) {
            case 'enquiry':
                return this.prisma.enquiry.update({ where: { id: dto.id }, data });
            case 'suggestion':
                return this.prisma.suggestion.update({ where: { id: dto.id }, data });
            case 'jobAlert':
                return this.prisma.jobAlert.update({ where: { id: dto.id }, data });
            case 'event':
                return this.prisma.event.update({ where: { id: dto.id }, data });
            case 'marketplaceProduct':
                return this.prisma.marketplaceProduct.update({ where: { id: dto.id }, data });
            default:
                return { ok: false };
        }
    }
    listEvents(from, to) {
        const now = new Date();
        const windowStart = from ? new Date(from) : now;
        const windowEnd = to ? new Date(to) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return this.prisma.event.findMany({
            where: {
                adminFlag: { not: client_1.AdminLifecycleFlag.DELETE },
                deletedAt: null,
                startsAt: { lte: windowEnd },
                OR: [{ endsAt: null }, { endsAt: { gte: windowStart } }],
            },
            orderBy: { startsAt: 'asc' },
        });
    }
    createEvent(dto) {
        return this.prisma.event.create({
            data: {
                title: dto.title.trim(),
                description: dto.description,
                location: dto.location,
                startsAt: new Date(dto.startsAt),
                endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
                isActive: dto.isActive ?? true,
            },
        });
    }
    async updateEvent(id, dto) {
        const deletedAt = dto.adminFlag === client_1.AdminLifecycleFlag.DELETE
            ? new Date()
            : dto.adminFlag
                ? null
                : undefined;
        return this.prisma.event.update({
            where: { id },
            data: {
                ...(dto.title !== undefined && { title: dto.title.trim() }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.location !== undefined && { location: dto.location }),
                ...(dto.startsAt !== undefined && { startsAt: new Date(dto.startsAt) }),
                ...(dto.endsAt !== undefined && {
                    endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
                }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.adminFlag !== undefined && { adminFlag: dto.adminFlag }),
                ...(deletedAt !== undefined && { deletedAt }),
            },
        });
    }
    async removeEvent(id) {
        await this.prisma.event.update({
            where: { id },
            data: { adminFlag: client_1.AdminLifecycleFlag.DELETE, deletedAt: new Date(), isActive: false },
        });
        return { id, deleted: true };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('purge-deleted'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "purgeDeleted", null);
__decorate([
    (0, common_1.Post)('backfill'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "backfill", null);
__decorate([
    (0, common_1.Patch)('flag'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SetFlagDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "setFlag", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "listEvents", null);
__decorate([
    (0, common_1.Post)('events'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateEventDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateEventDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "removeEvent", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    (0, permissions_decorator_1.Permissions)('dashboard.read'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        prisma_service_1.PrismaService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map