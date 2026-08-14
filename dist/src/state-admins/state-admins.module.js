"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateAdminsModule = void 0;
const common_1 = require("@nestjs/common");
const state_admins_controller_1 = require("./state-admins.controller");
const state_admins_service_1 = require("./state-admins.service");
let StateAdminsModule = class StateAdminsModule {
};
exports.StateAdminsModule = StateAdminsModule;
exports.StateAdminsModule = StateAdminsModule = __decorate([
    (0, common_1.Module)({
        controllers: [state_admins_controller_1.StateAdminsController],
        providers: [state_admins_service_1.StateAdminsService],
    })
], StateAdminsModule);
//# sourceMappingURL=state-admins.module.js.map