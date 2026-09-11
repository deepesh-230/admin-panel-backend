import { CategoryType } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(search?: string, isActive?: string, type?: CategoryType): Promise<({
        _count: {
            subcategories: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    })[]>;
    listSubcategories(categoryId: string): Promise<({
        _count: {
            keywords: number;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        sortOrder: number;
        categoryId: string;
    })[]>;
    findOne(id: string): Promise<{
        subcategories: ({
            keywords: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                term: string;
                subcategoryId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string | null;
            description: string | null;
            sortOrder: number;
            categoryId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
}
