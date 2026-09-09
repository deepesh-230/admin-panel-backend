export declare class CreateMyServiceProviderDto {
    name: string;
    categoryId: string;
    subcategoryId?: string;
    description?: string;
    phone?: string;
    landline?: string;
    email?: string;
    address?: string;
    city?: string;
    stateId?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    about?: string;
    services?: string;
    coverPhotoUrl?: string;
    gallery?: string[];
    locationLabel?: string;
}
export declare class UpdateMyServiceProviderDto {
    name?: string;
    categoryId?: string;
    subcategoryId?: string | null;
    description?: string;
    phone?: string;
    landline?: string;
    email?: string;
    address?: string;
    city?: string;
    stateId?: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    about?: string;
    services?: string;
    coverPhotoUrl?: string | null;
    gallery?: string[];
    locationLabel?: string;
}
