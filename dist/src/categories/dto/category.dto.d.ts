import { CategoryType } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    type?: CategoryType;
}
export declare class UpdateCategoryDto {
    name?: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    type?: CategoryType;
}
