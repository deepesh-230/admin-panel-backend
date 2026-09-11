import { AutocompleteQueryDto, DetailsQueryDto } from './dto/places-query.dto';
import { PlacesService } from './places.service';
export declare class PlacesController {
    private readonly placesService;
    constructor(placesService: PlacesService);
    autocomplete(query: AutocompleteQueryDto): Promise<{
        placeId: string;
        description: string;
    }[]>;
    details(query: DetailsQueryDto): Promise<{
        label: string;
        address: string;
        latitude: number;
        longitude: number;
        city: string | undefined;
        stateName: string | undefined;
        pincode: string | undefined;
    }>;
}
