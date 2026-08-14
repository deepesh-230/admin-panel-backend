import { CreateSubcategoryDto, UpdateSubcategoryDto } from './dto/subcategory.dto';
import { SubcategoriesService } from './subcategories.service';
export declare class SubcategoriesController {
    private readonly subcategoriesService;
    constructor(subcategoriesService: SubcategoriesService);
    listKeywords(subcategoryId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        term: string;
        subcategoryId: string;
    }[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            slug: string | null;
            sortOrder: number;
        };
        keywords: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            term: string;
            subcategoryId: string;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
        categoryId: string;
    }>;
    create(dto: CreateSubcategoryDto): Promise<{
        keywords: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            term: string;
            subcategoryId: string;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
        categoryId: string;
    }>;
    update(id: string, dto: UpdateSubcategoryDto): Promise<{
        keywords: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            term: string;
            subcategoryId: string;
        }[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
        categoryId: string;
    }>;
}
