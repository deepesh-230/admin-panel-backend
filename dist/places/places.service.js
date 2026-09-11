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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const LOCAL_ADDRESS_TYPES = new Set([
    'street_address',
    'route',
    'premise',
    'subpremise',
    'street_number',
    'locality',
    'sublocality',
    'sublocality_level_1',
    'sublocality_level_2',
    'neighborhood',
    'establishment',
    'point_of_interest',
    'postal_code',
]);
let PlacesService = class PlacesService {
    config;
    constructor(config) {
        this.config = config;
    }
    getApiKey() {
        const key = this.config.get('GOOGLE_MAPS_API_KEY') ||
            process.env.GOOGLE_MAPS_API_KEY ||
            'AIzaSyCMpzC9h1qmCRgC6SYHVzKhn4vFHztXp-A';
        if (!key.trim()) {
            throw new common_1.ServiceUnavailableException('Google Maps API key is not configured');
        }
        return key.trim();
    }
    isRegionOnlyPrediction(types = []) {
        if (!types.length)
            return false;
        const hasLocalDetail = types.some((type) => LOCAL_ADDRESS_TYPES.has(type));
        if (hasLocalDetail)
            return false;
        return types.some((type) => type === 'administrative_area_level_1' ||
            type === 'country' ||
            type === 'administrative_area_level_2');
    }
    component(components, ...types) {
        return components.find((c) => types.some((t) => c.types.includes(t)))?.long_name;
    }
    async autocomplete(query) {
        const trimmed = query.trim();
        if (trimmed.length < 2)
            return [];
        const params = new URLSearchParams({
            input: trimmed,
            key: this.getApiKey(),
            components: 'country:in',
        });
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
        if (!response.ok) {
            throw new common_1.BadRequestException('Place search failed');
        }
        const data = (await response.json());
        if (data.status === 'ZERO_RESULTS')
            return [];
        if (data.status !== 'OK') {
            throw new common_1.BadRequestException(data.error_message || `Place search failed (${data.status})`);
        }
        return (data.predictions ?? [])
            .filter((p) => !this.isRegionOnlyPrediction(p.types))
            .slice(0, 8)
            .map((p) => ({
            placeId: p.place_id,
            description: p.description,
        }));
    }
    async details(placeId, fallbackLabel) {
        if (!placeId.trim()) {
            throw new common_1.BadRequestException('placeId is required');
        }
        const params = new URLSearchParams({
            place_id: placeId.trim(),
            fields: 'geometry,formatted_address,address_components,name',
            key: this.getApiKey(),
        });
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
        if (!response.ok) {
            throw new common_1.BadRequestException('Could not load place details');
        }
        const data = (await response.json());
        const location = data.result?.geometry?.location;
        if (data.status !== 'OK' || !location) {
            throw new common_1.BadRequestException(data.error_message || 'Could not load place details');
        }
        const components = data.result?.address_components || [];
        const address = data.result?.formatted_address?.trim() ||
            data.result?.name?.trim() ||
            fallbackLabel?.trim() ||
            '';
        const city = this.component(components, 'locality') ||
            this.component(components, 'sublocality_level_1', 'sublocality', 'neighborhood') ||
            undefined;
        const stateName = this.component(components, 'administrative_area_level_1');
        const pincode = this.component(components, 'postal_code');
        return {
            label: address,
            address,
            latitude: location.lat,
            longitude: location.lng,
            city,
            stateName,
            pincode,
        };
    }
};
exports.PlacesService = PlacesService;
exports.PlacesService = PlacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PlacesService);
//# sourceMappingURL=places.service.js.map