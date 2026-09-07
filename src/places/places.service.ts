import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AutocompleteResponse = {
  status: string;
  predictions?: {
    place_id: string;
    description: string;
    types?: string[];
  }[];
  error_message?: string;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type PlaceDetailsResponse = {
  status: string;
  result?: {
    formatted_address?: string;
    name?: string;
    geometry?: { location?: { lat: number; lng: number } };
    address_components?: AddressComponent[];
  };
  error_message?: string;
};

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

@Injectable()
export class PlacesService {
  constructor(private readonly config: ConfigService) {}

  private getApiKey() {
    const key =
      this.config.get<string>('GOOGLE_MAPS_API_KEY') ||
      process.env.GOOGLE_MAPS_API_KEY ||
      // Same default used by the mobile app for local development
      'AIzaSyCMpzC9h1qmCRgC6SYHVzKhn4vFHztXp-A';
    if (!key.trim()) {
      throw new ServiceUnavailableException('Google Maps API key is not configured');
    }
    return key.trim();
  }

  private isRegionOnlyPrediction(types: string[] = []) {
    if (!types.length) return false;
    const hasLocalDetail = types.some((type) => LOCAL_ADDRESS_TYPES.has(type));
    if (hasLocalDetail) return false;
    return types.some(
      (type) =>
        type === 'administrative_area_level_1' ||
        type === 'country' ||
        type === 'administrative_area_level_2',
    );
  }

  private component(components: AddressComponent[], ...types: string[]) {
    return components.find((c) => types.some((t) => c.types.includes(t)))?.long_name;
  }

  async autocomplete(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const params = new URLSearchParams({
      input: trimmed,
      key: this.getApiKey(),
      components: 'country:in',
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
    );
    if (!response.ok) {
      throw new BadRequestException('Place search failed');
    }

    const data = (await response.json()) as AutocompleteResponse;
    if (data.status === 'ZERO_RESULTS') return [];
    if (data.status !== 'OK') {
      throw new BadRequestException(data.error_message || `Place search failed (${data.status})`);
    }

    return (data.predictions ?? [])
      .filter((p) => !this.isRegionOnlyPrediction(p.types))
      .slice(0, 8)
      .map((p) => ({
        placeId: p.place_id,
        description: p.description,
      }));
  }

  async details(placeId: string, fallbackLabel?: string) {
    if (!placeId.trim()) {
      throw new BadRequestException('placeId is required');
    }

    const params = new URLSearchParams({
      place_id: placeId.trim(),
      fields: 'geometry,formatted_address,address_components,name',
      key: this.getApiKey(),
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    );
    if (!response.ok) {
      throw new BadRequestException('Could not load place details');
    }

    const data = (await response.json()) as PlaceDetailsResponse;
    const location = data.result?.geometry?.location;
    if (data.status !== 'OK' || !location) {
      throw new BadRequestException(data.error_message || 'Could not load place details');
    }

    const components = data.result?.address_components || [];
    const address =
      data.result?.formatted_address?.trim() ||
      data.result?.name?.trim() ||
      fallbackLabel?.trim() ||
      '';
    const city =
      this.component(components, 'locality') ||
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
}
