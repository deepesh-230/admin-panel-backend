"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BecomeModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const become_controller_1 = require("./become.controller");
const become_service_1 = require("./become.service");
let BecomeModule = class BecomeModule {
};
exports.BecomeModule = BecomeModule;
exports.BecomeModule = BecomeModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [become_controller_1.BecomeQuestionsController, become_controller_1.BecomeApplicationsController],
        providers: [become_service_1.BecomeService],
        exports: [become_service_1.BecomeService],
    })
], BecomeModule);
//# sourceMappingURL=become.module.js.map