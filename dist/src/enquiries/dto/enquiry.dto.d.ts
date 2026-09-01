import { EnquiryStatus } from '@prisma/client';
export declare class CreateEnquiryDto {
    category: string;
    subCategory: string;
    product: string;
    name?: string;
    email: string;
    phone?: string;
    message?: string;
    marketplaceProductId?: string;
    date: string;
    createdBy: string;
    kind?: string;
    status?: EnquiryStatus;
    providerId?: string;
    stateId?: string;
}
export declare class UpdateEnquiryDto {
    category?: string;
    subCategory?: string;
    product?: string;
    name?: string;
    email?: string;
    date?: string;
    createdBy?: string;
    kind?: string;
    status?: EnquiryStatus;
    providerId?: string;
    stateId?: string;
}
export declare class ListEnquiriesQueryDto {
    search?: string;
    kind?: string;
    status?: EnquiryStatus;
}
