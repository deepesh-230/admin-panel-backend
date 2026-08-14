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
exports.ServiceProvidersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const service_provider_dto_1 = require("./dto/service-provider.dto");
const service_providers_service_1 = require("./service-providers.service");
let ServiceProvidersController = class ServiceProvidersController {
    serviceProvidersService;
    constructor(serviceProvidersService) {
        this.serviceProvidersService = serviceProvidersService;
    }
    searchPublic(query) {
        return this.serviceProvidersService.searchPublic(query);
    }
    findOnePublic(id) {
        return this.serviceProvidersService.findOnePublic(id);
    }
    findAll(user, query) {
        return this.serviceProvidersService.findAll(user, query);
    }
    findOne(id, user) {
        return this.serviceProvidersService.findOne(id, user);
    }
    create(dto, user) {
        return this.serviceProvidersService.create(dto, user);
    }
    update(id, dto, user) {
        return this.serviceProvidersService.update(id, dto, user);
    }
    remove(id, user) {
        return this.serviceProvidersService.remove(id, user);
    }
    approve(id, user) {
        return this.serviceProvidersService.approve(id, user);
    }
    reject(id, dto, user) {
        return this.serviceProvidersService.reject(id, dto.reason, user);
    }
    listAdmins(id, user) {
        return this.serviceProvidersService.listAdmins(id, user);
    }
    assignAdmin(id, dto, user) {
        return this.serviceProvidersService.assignAdmin(id, dto, user);
    }
    removeAdmin(id, userId, user) {
        return this.serviceProvidersService.removeAdmin(id, userId, user);
    }
};
exports.ServiceProvidersController = ServiceProvidersController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_provider_dto_1.ListServiceProvidersQueryDto]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "searchPublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('search/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('providers.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, service_provider_dto_1.ListServiceProvidersQueryDto]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('providers.read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('providers.write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_provider_dto_1.CreateServiceProviderDto, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('providers.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, service_provider_dto_1.UpdateServiceProviderDto, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('providers.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, permissions_decorator_1.Permissions)('providers.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, permissions_decorator_1.Permissions)('providers.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, service_provider_dto_1.RejectServiceProviderDto, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(':id/admins'),
    (0, permissions_decorator_1.Permissions)('providers.read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "listAdmins", null);
__decorate([
    (0, common_1.Post)(':id/admins'),
    (0, permissions_decorator_1.Permissions)('providers.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, service_provider_dto_1.AssignProviderAdminDto, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "assignAdmin", null);
__decorate([
    (0, common_1.Delete)(':id/admins/:userId'),
    (0, permissions_decorator_1.Permissions)('providers.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ServiceProvidersController.prototype, "removeAdmin", null);
exports.ServiceProvidersController = ServiceProvidersController = __decorate([
    (0, common_1.Controller)('service-providers'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [service_providers_service_1.ServiceProvidersService])
], ServiceProvidersController);
//# sourceMappingURL=service-providers.controller.js.map