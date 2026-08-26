"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const categories_module_1 = require("./categories/categories.module");
const cms_module_1 = require("./cms/cms.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const enquiries_module_1 = require("./enquiries/enquiries.module");
const keywords_module_1 = require("./keywords/keywords.module");
const listings_module_1 = require("./listings/listings.module");
const prisma_module_1 = require("./prisma/prisma.module");
const service_providers_module_1 = require("./service-providers/service-providers.module");
const state_admins_module_1 = require("./state-admins/state-admins.module");
const states_module_1 = require("./states/states.module");
const subcategories_module_1 = require("./subcategories/subcategories.module");
const volunteer_admins_module_1 = require("./volunteer-admins/volunteer-admins.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            dashboard_module_1.DashboardModule,
            enquiries_module_1.EnquiriesModule,
            listings_module_1.ListingsModule,
            states_module_1.StatesModule,
            state_admins_module_1.StateAdminsModule,
            categories_module_1.CategoriesModule,
            cms_module_1.CmsModule,
            subcategories_module_1.SubcategoriesModule,
            keywords_module_1.KeywordsModule,
            users_module_1.UsersModule,
            service_providers_module_1.ServiceProvidersModule,
            volunteer_admins_module_1.VolunteerAdminsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_GUARD, useClass: permissions_guard_1.PermissionsGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: transform_interceptor_1.TransformInterceptor },
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.AllExceptionsFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map