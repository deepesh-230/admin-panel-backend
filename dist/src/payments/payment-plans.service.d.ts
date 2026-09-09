import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto } from './dto/payment-plan.dto';
export declare class PaymentPlansService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    ensureDefaults(): Promise<void>;
    private serialize;
    listAdmin(): Promise<{
        amount: number;
        id: string;
        code: string;
        name: string;
        currency: string;
        description: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    listPublic(): Promise<{
        amount: number;
        id: string;
        code: string;
        name: string;
        currency: string;
        description: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        amount: number;
        id: string;
        code: string;
        name: string;
        currency: string;
        description: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreatePaymentPlanDto): Promise<{
        amount: number;
        id: string;
        code: string;
        name: string;
        currency: string;
        description: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdatePaymentPlanDto): Promise<{
        amount: number;
        id: string;
        code: string;
        name: string;
        currency: string;
        description: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
