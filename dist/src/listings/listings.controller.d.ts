import { ListingsService } from './listings.service';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    findAll(search?: string): Promise<{
        date: string;
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: boolean;
        image: string;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
    }[]>;
    findOne(id: string): Promise<{
        date: string;
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: boolean;
        image: string;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
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
        date: string;
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: boolean;
        image: string;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
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
        date: string;
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: boolean;
        image: string;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
    }>;
    updateStatus(id: string, status: boolean): Promise<{
        date: string;
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: boolean;
        image: string;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
    }>;
    remove(id: string): Promise<{
        date: string;
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        status: boolean;
        image: string;
        createdBy: string;
        product: string;
        sNo: number;
        subCategory: string;
    }>;
}
