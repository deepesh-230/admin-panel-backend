import { PrismaService } from '../prisma/prisma.service';
import { CreateKeywordDto, UpdateKeywordDto } from './dto/keyword.dto';
export declare class KeywordsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string): Promise<({
        subcategory: {
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            };
            categoryId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        term: string;
        subcategoryId: string;
    })[]>;
    findOne(id: string): Promise<{
        subcategory: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            slug: string | null;
            sortOrder: number;
            categoryId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        term: string;
        subcategoryId: string;
    }>;
    create(dto: CreateKeywordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        term: string;
        subcategoryId: string;
    }>;
    update(id: string, dto: UpdateKeywordDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        term: string;
        subcategoryId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        term: string;
        subcategoryId: string;
    }>;
}
