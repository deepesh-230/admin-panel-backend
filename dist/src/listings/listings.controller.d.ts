import { ListingsService } from './listings.service';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    findAll(search?: string): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        image: string;
        status: boolean;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
        date: string;
    }[]>;
    findOne(id: string): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        image: string;
        status: boolean;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
        date: string;
    }>;
    create(body: {
        category: string;
        subCategory: string;
        product: string;
        email: string;
        image: string;
        createdBy: string;
        date: string;
        status?: boolean;
    }): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        image: string;
        status: boolean;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
        date: string;
    }>;
    update(id: string, body: {
        category?: string;
        subCategory?: string;
        product?: string;
        email?: string;
        image?: string;
        createdBy?: string;
        date?: string;
        status?: boolean;
    }): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        image: string;
        status: boolean;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
        date: string;
    }>;
    updateStatus(id: string, status: boolean): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        image: string;
        status: boolean;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
        date: string;
    }>;
    remove(id: string): Promise<{
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        image: string;
        status: boolean;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
        date: string;
    }>;
}
