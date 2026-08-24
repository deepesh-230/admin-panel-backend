import { EnquiriesService } from './enquiries.service';
export declare class EnquiriesController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
    findAll(search?: string, kind?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        kind: string;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        kind: string;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
    }>;
    create(body: {
        category: string;
        subCategory: string;
        product: string;
        name?: string;
        email: string;
        date: string;
        createdBy: string;
        kind?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        kind: string;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
    }>;
    update(id: string, body: {
        category?: string;
        subCategory?: string;
        product?: string;
        name?: string;
        email?: string;
        date?: string;
        createdBy?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        kind: string;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        kind: string;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
    }>;
}
