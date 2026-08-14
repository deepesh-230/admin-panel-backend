import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(search?: string, isActive?: string): Promise<({
        _count: {
            subcategories: number;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
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
        id: string;
        description: string | null;
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
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            slug: string | null;
            sortOrder: number;
            categoryId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
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
    }>;
}
