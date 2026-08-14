export declare class CreateSubcategoryDto {
    categoryId: string;
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
}
export declare class UpdateSubcategoryDto {
    categoryId?: string;
    name?: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
}
