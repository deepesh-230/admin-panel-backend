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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const permissions_dto_1 = require("./dto/permissions.dto");
const permissions_service_1 = require("./permissions.service");
let PermissionsController = class PermissionsController {
    permissionsService;
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    getMatrix() {
        return this.permissionsService.getMatrix();
    }
    updateMatrix(dto) {
        return this.permissionsService.updateMatrix(dto.roles);
    }
    setRolePermissions(roleName, dto) {
        return this.permissionsService.setRolePermissions(roleName, dto.permissionCodes);
    }
    resetRole(roleName) {
        return this.permissionsService.resetRole(roleName);
    }
    resetAll() {
        return this.permissionsService.resetAllEditable();
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('matrix'),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getMatrix", null);
__decorate([
    (0, common_1.Put)('matrix'),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [permissions_dto_1.UpdatePermissionsMatrixDto]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "updateMatrix", null);
__decorate([
    (0, common_1.Put)('roles/:roleName'),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __param(0, (0, common_1.Param)('roleName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, permissions_dto_1.UpdateRolePermissionsDto]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "setRolePermissions", null);
__decorate([
    (0, common_1.Post)('roles/:roleName/reset'),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __param(0, (0, common_1.Param)('roleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "resetRole", null);
__decorate([
    (0, common_1.Post)('reset'),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "resetAll", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, common_1.Controller)('permissions'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map