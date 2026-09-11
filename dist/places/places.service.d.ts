import { ConfigService } from '@nestjs/config';
export declare class PlacesService {
    private readonly config;
    constructor(config: ConfigService);
    private getApiKey;
    private isRegionOnlyPrediction;
    private component;
    autocomplete(query: string): Promise<{
        placeId: string;
        description: string;
    }[]>;
    details(placeId: string, fallbackLabel?: string): Promise<{
        label: string;
        address: string;
        latitude: number;
        longitude: number;
        city: string | undefined;
        stateName: string | undefined;
        pincode: string | undefined;
    }>;
}
