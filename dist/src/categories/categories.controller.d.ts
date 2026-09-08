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
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
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
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
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
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            slug: string | null;
            sortOrder: number;
            categoryId: string;
        })[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
    remove(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    }>;
}
