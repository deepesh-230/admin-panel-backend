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
exports.PlacesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const places_query_dto_1 = require("./dto/places-query.dto");
const places_service_1 = require("./places.service");
let PlacesController = class PlacesController {
    placesService;
    constructor(placesService) {
        this.placesService = placesService;
    }
    autocomplete(query) {
        return this.placesService.autocomplete(query.q);
    }
    details(query) {
        return this.placesService.details(query.placeId, query.fallback);
    }
};
exports.PlacesController = PlacesController;
__decorate([
    (0, common_1.Get)('autocomplete'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [places_query_dto_1.AutocompleteQueryDto]),
    __metadata("design:returntype", void 0)
], PlacesController.prototype, "autocomplete", null);
__decorate([
    (0, common_1.Get)('details'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [places_query_dto_1.DetailsQueryDto]),
    __metadata("design:returntype", void 0)
], PlacesController.prototype, "details", null);
exports.PlacesController = PlacesController = __decorate([
    (0, common_1.Controller)('places'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.STATE_ADMIN, client_1.RoleName.SERVICE_PROVIDER_ADMIN),
    __metadata("design:paramtypes", [places_service_1.PlacesService])
], PlacesController);
//# sourceMappingURL=places.controller.js.map