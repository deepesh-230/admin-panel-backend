import { ListingsService } from './listings.service';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    findAll(search?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        image: string;
        status: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        image: string;
        status: boolean;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        image: string;
        status: boolean;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        image: string;
        status: boolean;
    }>;
    updateStatus(id: string, status: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        image: string;
        status: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        image: string;
        status: boolean;
    }>;
}
