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
exports.MarketplacePartiesController = exports.MarketplaceProductsController = exports.VolunteersController = exports.SuggestionsController = exports.JobAlertsController = exports.BlogsController = exports.CmsPagesController = exports.HelpTicketsController = exports.UsefulLinksController = exports.FaqsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const cms_service_1 = require("./cms.service");
function resourceController(path, model, permission, searchFields, extraWhere, roles = [client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN]) {
    let ResourceController = class ResourceController {
        cms;
        constructor(cms) {
            this.cms = cms;
        }
        findAll(search, kind) {
            const where = extraWhere?.({ kind }) ?? {};
            return this.cms.findAll(model, search, searchFields, where);
        }
        findOne(id) {
            return this.cms.findOne(model, id);
        }
        create(body) {
            const where = extraWhere?.({}) ?? {};
            return this.cms.create(model, { ...where, ...body });
        }
        update(id, body) {
            return this.cms.update(model, id, body);
        }
        remove(id) {
            return this.cms.remove(model, id);
        }
    };
    __decorate([
        (0, common_1.Get)(),
        (0, permissions_decorator_1.Permissions)(`${permission}.read`),
        __param(0, (0, common_1.Query)('search')),
        __param(1, (0, common_1.Query)('kind')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String]),
        __metadata("design:returntype", void 0)
    ], ResourceController.prototype, "findAll", null);
    __decorate([
        (0, common_1.Get)(':id'),
        (0, permissions_decorator_1.Permissions)(`${permission}.read`),
        __param(0, (0, common_1.Param)('id')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", void 0)
    ], ResourceController.prototype, "findOne", null);
    __decorate([
        (0, common_1.Post)(),
        (0, permissions_decorator_1.Permissions)(`${permission}.write`),
        __param(0, (0, common_1.Body)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], ResourceController.prototype, "create", null);
    __decorate([
        (0, common_1.Patch)(':id'),
        (0, permissions_decorator_1.Permissions)(`${permission}.write`),
        __param(0, (0, common_1.Param)('id')),
        __param(1, (0, common_1.Body)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object]),
        __metadata("design:returntype", void 0)
    ], ResourceController.prototype, "update", null);
    __decorate([
        (0, common_1.Delete)(':id'),
        (0, permissions_decorator_1.Permissions)(`${permission}.write`),
        __param(0, (0, common_1.Param)('id')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", void 0)
    ], ResourceController.prototype, "remove", null);
    ResourceController = __decorate([
        (0, common_1.Controller)(path),
        (0, roles_decorator_1.Roles)(...roles),
        __metadata("design:paramtypes", [cms_service_1.CmsService])
    ], ResourceController);
    return ResourceController;
}
class FaqsController extends resourceController('faqs', 'faq', 'cms', [
    'title',
    'description',
]) {
}
exports.FaqsController = FaqsController;
let UsefulLinksController = class UsefulLinksController {
    cms;
    constructor(cms) {
        this.cms = cms;
    }
    findAll(search) {
        return this.cms.findAll('usefulLink', search, ['title', 'url']);
    }
    findOne(id) {
        return this.cms.findOne('usefulLink', id);
    }
    create(body) {
        return this.cms.create('usefulLink', body);
    }
    broadcast(id) {
        return this.cms.broadcastLink(id);
    }
    update(id, body) {
        return this.cms.update('usefulLink', id, body);
    }
    remove(id) {
        return this.cms.remove('usefulLink', id);
    }
};
exports.UsefulLinksController = UsefulLinksController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsefulLinksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsefulLinksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsefulLinksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/broadcast'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsefulLinksController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsefulLinksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsefulLinksController.prototype, "remove", null);
exports.UsefulLinksController = UsefulLinksController = __decorate([
    (0, common_1.Controller)('useful-links'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [cms_service_1.CmsService])
], UsefulLinksController);
class HelpTicketsController extends resourceController('help-tickets', 'helpTicket', 'cms', ['name', 'email', 'message']) {
}
exports.HelpTicketsController = HelpTicketsController;
class CmsPagesController extends resourceController('pages', 'cmsPage', 'cms', [
    'title',
    'slug',
    'content',
]) {
}
exports.CmsPagesController = CmsPagesController;
class BlogsController extends resourceController('blogs', 'blog', 'cms', [
    'title',
    'shortDescription',
    'description',
]) {
}
exports.BlogsController = BlogsController;
class JobAlertsController extends resourceController('job-alerts', 'jobAlert', 'cms', [
    'title',
    'description',
]) {
}
exports.JobAlertsController = JobAlertsController;
class SuggestionsController extends resourceController('suggestions', 'suggestion', 'cms', ['title', 'description']) {
}
exports.SuggestionsController = SuggestionsController;
class VolunteersController extends resourceController('volunteers', 'volunteer', 'volunteers', ['name', 'email', 'phone', 'location'], undefined, [client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN, client_1.RoleName.VOLUNTEER]) {
}
exports.VolunteersController = VolunteersController;
class MarketplaceProductsController extends resourceController('marketplace/products', 'marketplaceProduct', 'marketplace', ['name', 'sellerName', 'phone']) {
}
exports.MarketplaceProductsController = MarketplaceProductsController;
class MarketplacePartiesController extends resourceController('marketplace/parties', 'marketplaceParty', 'marketplace', ['name', 'email', 'phone'], (query) => (query.kind ? { kind: query.kind } : {})) {
}
exports.MarketplacePartiesController = MarketplacePartiesController;
//# sourceMappingURL=cms.controller.js.map