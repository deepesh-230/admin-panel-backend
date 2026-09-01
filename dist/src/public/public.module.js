"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicModule = void 0;
const common_1 = require("@nestjs/common");
const categories_module_1 = require("../categories/categories.module");
const cms_module_1 = require("../cms/cms.module");
const marketplace_module_1 = require("../marketplace/marketplace.module");
const prisma_module_1 = require("../prisma/prisma.module");
const states_module_1 = require("../states/states.module");
const public_controller_1 = require("./public.controller");
const public_service_1 = require("./public.service");
let PublicModule = class PublicModule {
};
exports.PublicModule = PublicModule;
exports.PublicModule = PublicModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, categories_module_1.CategoriesModule, states_module_1.StatesModule, cms_module_1.CmsModule, marketplace_module_1.MarketplaceModule],
        controllers: [public_controller_1.PublicController],
        providers: [public_service_1.PublicService],
    })
], PublicModule);
//# sourceMappingURL=public.module.js.map