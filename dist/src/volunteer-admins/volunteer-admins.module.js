"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerAdminsModule = void 0;
const common_1 = require("@nestjs/common");
const volunteer_admins_controller_1 = require("./volunteer-admins.controller");
const volunteer_admins_service_1 = require("./volunteer-admins.service");
let VolunteerAdminsModule = class VolunteerAdminsModule {
};
exports.VolunteerAdminsModule = VolunteerAdminsModule;
exports.VolunteerAdminsModule = VolunteerAdminsModule = __decorate([
    (0, common_1.Module)({
        controllers: [volunteer_admins_controller_1.VolunteerAdminsController],
        providers: [volunteer_admins_service_1.VolunteerAdminsService],
    })
], VolunteerAdminsModule);
//# sourceMappingURL=volunteer-admins.module.js.map