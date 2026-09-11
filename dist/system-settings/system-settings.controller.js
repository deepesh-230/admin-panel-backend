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
exports.SystemSettingsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const update_system_settings_dto_1 = require("./dto/update-system-settings.dto");
const system_settings_service_1 = require("./system-settings.service");
let SystemSettingsController = class SystemSettingsController {
    systemSettings;
    constructor(systemSettings) {
        this.systemSettings = systemSettings;
    }
    list() {
        return this.systemSettings.list();
    }
    update(dto) {
        return this.systemSettings.updateMany(dto.settings);
    }
    runLifecycle() {
        return this.systemSettings.runJobAlertLifecycle();
    }
};
exports.SystemSettingsController = SystemSettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_system_settings_dto_1.UpdateSystemSettingsDto]),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('run-job-alert-lifecycle'),
    (0, permissions_decorator_1.Permissions)('settings.write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemSettingsController.prototype, "runLifecycle", null);
exports.SystemSettingsController = SystemSettingsController = __decorate([
    (0, common_1.Controller)('system-settings'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    __metadata("design:paramtypes", [system_settings_service_1.SystemSettingsService])
], SystemSettingsController);
//# sourceMappingURL=system-settings.controller.js.map