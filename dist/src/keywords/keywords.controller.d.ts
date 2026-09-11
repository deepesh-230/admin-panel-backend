import { CreateKeywordDto, UpdateKeywordDto } from './dto/keyword.dto';
import { KeywordsService } from './keywords.service';
export declare class KeywordsController {
    private readonly keywordsService;
    constructor(keywordsService: KeywordsService);
    findAll(search?: string): Promise<({
        subcategory: {
            name: string;
            category: {
                name: string;
                id: string;
            };
            id: string;
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
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            slug: string | null;
            description: string | null;
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
