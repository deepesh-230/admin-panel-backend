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
exports.BulkImportController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const bulk_import_service_1 = require("./bulk-import.service");
const bulk_import_types_1 = require("./bulk-import.types");
const bulk_import_dto_1 = require("./dto/bulk-import.dto");
let BulkImportController = class BulkImportController {
    bulkImportService;
    constructor(bulkImportService) {
        this.bulkImportService = bulkImportService;
    }
    getTemplate(entity) {
        if (!bulk_import_types_1.BULK_IMPORT_ENTITIES.includes(entity)) {
            return { columns: [], sample: [] };
        }
        return this.bulkImportService.getTemplate(entity);
    }
    import(dto, user) {
        return this.bulkImportService.import(dto.entity, dto.rows, dto.dryRun ?? false, user, { categoryId: dto.categoryId, subcategoryId: dto.subcategoryId });
    }
};
exports.BulkImportController = BulkImportController;
__decorate([
    (0, common_1.Get)(':entity/template'),
    __param(0, (0, common_1.Param)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_import_dto_1.BulkImportDto, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "import", null);
exports.BulkImportController = BulkImportController = __decorate([
    (0, common_1.Controller)('bulk-import'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN, client_1.RoleName.VOLUNTEER),
    __metadata("design:paramtypes", [bulk_import_service_1.BulkImportService])
], BulkImportController);
//# sourceMappingURL=bulk-import.controller.js.map