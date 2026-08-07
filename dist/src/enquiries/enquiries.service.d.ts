import { PrismaService } from '../prisma/prisma.service';
export declare class EnquiriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(searchQuery?: string): Promise<{
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
    create(data: {
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
    update(id: string, data: {
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
