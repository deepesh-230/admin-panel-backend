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
exports.VolunteerAdminsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const volunteer_admin_dto_1 = require("./dto/volunteer-admin.dto");
const volunteer_admins_service_1 = require("./volunteer-admins.service");
let VolunteerAdminsController = class VolunteerAdminsController {
    volunteerAdminsService;
    constructor(volunteerAdminsService) {
        this.volunteerAdminsService = volunteerAdminsService;
    }
    findAll(search, isActive) {
        const activeFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.volunteerAdminsService.findAll({ search, isActive: activeFilter });
    }
    findOne(id) {
        return this.volunteerAdminsService.findOne(id);
    }
    create(dto) {
        return this.volunteerAdminsService.create(dto);
    }
    update(id, dto) {
        return this.volunteerAdminsService.update(id, dto);
    }
    remove(id) {
        return this.volunteerAdminsService.remove(id);
    }
};
exports.VolunteerAdminsController = VolunteerAdminsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('users.read'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VolunteerAdminsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('users.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VolunteerAdminsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, permissions_decorator_1.Permissions)('users.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [volunteer_admin_dto_1.CreateVolunteerAdminDto]),
    __metadata("design:returntype", void 0)
], VolunteerAdminsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, permissions_decorator_1.Permissions)('users.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, volunteer_admin_dto_1.UpdateVolunteerAdminDto]),
    __metadata("design:returntype", void 0)
], VolunteerAdminsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, permissions_decorator_1.Permissions)('users.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VolunteerAdminsController.prototype, "remove", null);
exports.VolunteerAdminsController = VolunteerAdminsController = __decorate([
    (0, common_1.Controller)('volunteer-admins'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [volunteer_admins_service_1.VolunteerAdminsService])
], VolunteerAdminsController);
//# sourceMappingURL=volunteer-admins.controller.js.map