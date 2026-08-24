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
exports.EnquiriesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enquiries_service_1 = require("./enquiries.service");
let EnquiriesController = class EnquiriesController {
    enquiriesService;
    constructor(enquiriesService) {
        this.enquiriesService = enquiriesService;
    }
    findAll(search, kind) {
        return this.enquiriesService.findAll(search, kind);
    }
    findOne(id) {
        return this.enquiriesService.findOne(id);
    }
    create(body) {
        return this.enquiriesService.create(body);
    }
    update(id, body) {
        return this.enquiriesService.update(id, body);
    }
    remove(id) {
        return this.enquiriesService.remove(id);
    }
};
exports.EnquiriesController = EnquiriesController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('enquiries.read'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('enquiries.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('enquiries.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('enquiries.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('enquiries.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnquiriesController.prototype, "remove", null);
exports.EnquiriesController = EnquiriesController = __decorate([
    (0, common_1.Controller)('enquiries'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [enquiries_service_1.EnquiriesService])
], EnquiriesController);
//# sourceMappingURL=enquiries.controller.js.map