import { PrismaService } from '../prisma/prisma.service';
export declare class EnquiriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(searchQuery?: string, kind?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        kind: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        kind: string;
    }>;
    create(data: {
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
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        kind: string;
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
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        kind: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        kind: string;
    }>;
}
