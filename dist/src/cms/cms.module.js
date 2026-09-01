"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsModule = void 0;
const common_1 = require("@nestjs/common");
const cms_controller_1 = require("./cms.controller");
const cms_service_1 = require("./cms.service");
const broadcasts_service_1 = require("./broadcasts.service");
let CmsModule = class CmsModule {
};
exports.CmsModule = CmsModule;
exports.CmsModule = CmsModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            cms_controller_1.FaqsController,
            cms_controller_1.UsefulLinksController,
            cms_controller_1.HelpTicketsController,
            cms_controller_1.CmsPagesController,
            cms_controller_1.BlogsController,
            cms_controller_1.JobAlertsController,
            cms_controller_1.SuggestionsController,
            cms_controller_1.VolunteersController,
            cms_controller_1.MarketplaceProductsController,
            cms_controller_1.MarketplacePartiesController,
        ],
        providers: [cms_service_1.CmsService, broadcasts_service_1.BroadcastsService],
        exports: [cms_service_1.CmsService, broadcasts_service_1.BroadcastsService],
    })
], CmsModule);
//# sourceMappingURL=cms.module.js.map