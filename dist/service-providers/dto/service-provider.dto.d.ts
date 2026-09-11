import { ProviderApprovalStatus } from '@prisma/client';
export declare class CreateServiceProviderDto {
    name: string;
    categoryId: string;
    subcategoryId?: string;
    description?: string;
    phone?: string;
    landline?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    stateId: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    about?: string;
    services?: string;
    coverPhotoUrl?: string;
    gallery?: string[];
    isActive?: boolean;
    approvalStatus?: ProviderApprovalStatus;
}
export declare class UpdateServiceProviderDto {
    name?: string;
    categoryId?: string;
    subcategoryId?: string | null;
    description?: string;
    phone?: string;
    landline?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    stateId?: string;
    latitude?: number | null;
    longitude?: number | null;
    googlePlaceId?: string | null;
    about?: string;
    services?: string;
    coverPhotoUrl?: string | null;
    gallery?: string[];
    isActive?: boolean;
}
export declare class RejectServiceProviderDto {
    reason: string;
}
export declare class AssignProviderAdminDto {
    userId: string;
    isPrimary?: boolean;
}
export declare class ListServiceProvidersQueryDto {
    search?: string;
    keyword?: string;
    stateId?: string;
    categoryId?: string;
    subcategoryId?: string;
    city?: string;
    approvalStatus?: ProviderApprovalStatus;
    isActive?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
