import { EnquiriesService } from './enquiries.service';
export declare class EnquiriesController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
    findAll(search?: string): Promise<{
        id: string;
        sNo: number;
        category: string;
        subCategory: string;
        product: string;
        name: string | null;
        email: string;
        date: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        sNo: number;
        category: string;
        subCategory: string;
        product: string;
        name: string | null;
        email: string;
        date: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: {
        category: string;
        subCategory: string;
        product: string;
        name?: string;
        email: string;
        date: string;
        createdBy: string;
    }): Promise<{
        id: string;
        sNo: number;
        category: string;
        subCategory: string;
        product: string;
        name: string | null;
        email: string;
        date: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
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
        sNo: number;
        category: string;
        subCategory: string;
        product: string;
        name: string | null;
        email: string;
        date: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        sNo: number;
        category: string;
        subCategory: string;
        product: string;
        name: string | null;
        email: string;
        date: string;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
