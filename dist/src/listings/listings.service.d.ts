import { PrismaService } from '../prisma/prisma.service';
export declare class ListingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(searchQuery?: string): Promise<{
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
