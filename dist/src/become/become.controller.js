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
exports.BecomeApplicationsController = exports.BecomeQuestionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const become_service_1 = require("./become.service");
const become_dto_1 = require("./dto/become.dto");
let BecomeQuestionsController = class BecomeQuestionsController {
    become;
    constructor(become) {
        this.become = become;
    }
    list(target) {
        const filter = target && Object.values(client_1.BecomeTarget).includes(target) ? target : undefined;
        return this.become.listQuestionsAdmin(filter);
    }
    create(dto) {
        return this.become.createQuestion(dto);
    }
    update(id, dto) {
        return this.become.updateQuestion(id, dto);
    }
    remove(id) {
        return this.become.removeQuestion(id);
    }
};
exports.BecomeQuestionsController = BecomeQuestionsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Query)('target')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BecomeQuestionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [become_dto_1.CreateBecomeQuestionDto]),
    __metadata("design:returntype", void 0)
], BecomeQuestionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, become_dto_1.UpdateBecomeQuestionDto]),
    __metadata("design:returntype", void 0)
], BecomeQuestionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BecomeQuestionsController.prototype, "remove", null);
exports.BecomeQuestionsController = BecomeQuestionsController = __decorate([
    (0, common_1.Controller)('become-questions'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [become_service_1.BecomeService])
], BecomeQuestionsController);
let BecomeApplicationsController = class BecomeApplicationsController {
    become;
    constructor(become) {
        this.become = become;
    }
    list(target, status, search) {
        const targetFilter = target && Object.values(client_1.BecomeTarget).includes(target) ? target : undefined;
        const statusFilter = status && Object.values(client_1.BecomeApplicationStatus).includes(status)
            ? status
            : undefined;
        return this.become.listApplications({
            target: targetFilter,
            status: statusFilter,
            search,
        });
    }
    findOne(id) {
        return this.become.getApplication(id);
    }
    update(id, dto) {
        return this.become.updateApplication(id, dto);
    }
};
exports.BecomeApplicationsController = BecomeApplicationsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Query)('target')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BecomeApplicationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BecomeApplicationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, become_dto_1.UpdateBecomeApplicationDto]),
    __metadata("design:returntype", void 0)
], BecomeApplicationsController.prototype, "update", null);
exports.BecomeApplicationsController = BecomeApplicationsController = __decorate([
    (0, common_1.Controller)('become-applications'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [become_service_1.BecomeService])
], BecomeApplicationsController);
//# sourceMappingURL=become.controller.js.map