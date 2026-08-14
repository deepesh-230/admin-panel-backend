import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string, isActive?: boolean): Promise<({
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
