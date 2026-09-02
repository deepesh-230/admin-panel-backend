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
const broadcasts_service_1 = require("./broadcasts.service");
const marketplace_service_1 = require("../marketplace/marketplace.service");
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
let FaqsController = class FaqsController {
    cms;
    constructor(cms) {
        this.cms = cms;
    }
    findAll(search) {
        return this.cms.findAll('faq', search, ['title', 'description', 'slug']);
    }
    findOne(id) {
        return this.cms.findOne('faq', id);
    }
    create(body) {
        return this.cms.create('faq', body);
    }
    update(id, body) {
        return this.cms.update('faq', id, body);
    }
    remove(id) {
        return this.cms.remove('faq', id);
    }
};
exports.FaqsController = FaqsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FaqsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FaqsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FaqsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FaqsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FaqsController.prototype, "remove", null);
exports.FaqsController = FaqsController = __decorate([
    (0, common_1.Controller)('faqs'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [cms_service_1.CmsService])
], FaqsController);
let UsefulLinksController = class UsefulLinksController {
    cms;
    broadcasts;
    constructor(cms, broadcasts) {
        this.cms = cms;
        this.broadcasts = broadcasts;
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
        return this.broadcasts.broadcastUsefulLink(id);
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
    __metadata("design:paramtypes", [cms_service_1.CmsService,
        broadcasts_service_1.BroadcastsService])
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
let JobAlertsController = class JobAlertsController {
    cms;
    broadcasts;
    constructor(cms, broadcasts) {
        this.cms = cms;
        this.broadcasts = broadcasts;
    }
    findAll(search) {
        return this.cms.findAll('jobAlert', search, ['title', 'description']);
    }
    findOne(id) {
        return this.cms.findOne('jobAlert', id);
    }
    create(body) {
        return this.cms.create('jobAlert', body);
    }
    broadcast(id) {
        return this.broadcasts.broadcastJobAlert(id);
    }
    update(id, body) {
        return this.cms.update('jobAlert', id, body);
    }
    remove(id) {
        return this.cms.remove('jobAlert', id);
    }
};
exports.JobAlertsController = JobAlertsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobAlertsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobAlertsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobAlertsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/broadcast'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobAlertsController.prototype, "broadcast", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobAlertsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('cms.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobAlertsController.prototype, "remove", null);
exports.JobAlertsController = JobAlertsController = __decorate([
    (0, common_1.Controller)('job-alerts'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [cms_service_1.CmsService,
        broadcasts_service_1.BroadcastsService])
], JobAlertsController);
class SuggestionsController extends resourceController('suggestions', 'suggestion', 'cms', ['title', 'description', 'receivedFrom']) {
}
exports.SuggestionsController = SuggestionsController;
class VolunteersController extends resourceController('volunteers', 'volunteer', 'volunteers', ['name', 'email', 'phone', 'location'], undefined, [client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN, client_1.RoleName.VOLUNTEER]) {
}
exports.VolunteersController = VolunteersController;
let MarketplaceProductsController = class MarketplaceProductsController {
    marketplace;
    constructor(marketplace) {
        this.marketplace = marketplace;
    }
    findAll(search, listingIntent) {
        return this.marketplace.listAdmin(search, listingIntent);
    }
    findOne(id) {
        return this.marketplace.findAdmin(id);
    }
    create(body) {
        return this.marketplace.createAdmin(body);
    }
    update(id, body) {
        return this.marketplace.updateAdmin(id, body);
    }
    remove(id) {
        return this.marketplace.removeAdmin(id);
    }
};
exports.MarketplaceProductsController = MarketplaceProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('marketplace.read'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('listingIntent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MarketplaceProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('marketplace.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketplaceProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('marketplace.write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MarketplaceProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('marketplace.write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MarketplaceProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('marketplace.write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketplaceProductsController.prototype, "remove", null);
exports.MarketplaceProductsController = MarketplaceProductsController = __decorate([
    (0, common_1.Controller)('marketplace/products'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN),
    __metadata("design:paramtypes", [marketplace_service_1.MarketplaceService])
], MarketplaceProductsController);
class MarketplacePartiesController extends resourceController('marketplace/parties', 'marketplaceParty', 'marketplace', ['name', 'email', 'phone'], (query) => (query.kind ? { kind: query.kind } : {})) {
}
exports.MarketplacePartiesController = MarketplacePartiesController;
//# sourceMappingURL=cms.controller.js.map