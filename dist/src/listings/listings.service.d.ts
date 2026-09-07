import { PrismaService } from '../prisma/prisma.service';
export declare class ListingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(searchQuery?: string): Promise<{
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
