import { PrismaService } from '../prisma/prisma.service';
export declare class ListingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(searchQuery?: string): Promise<{
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
    create(data: {
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
    update(id: string, data: {
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
