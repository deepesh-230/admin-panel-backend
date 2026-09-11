import { CreatePaymentPlanDto, UpdatePaymentPlanDto } from './dto/payment-plan.dto';
import { PaymentPlansService } from './payment-plans.service';
export declare class PaymentPlansController {
    private readonly paymentPlans;
    constructor(paymentPlans: PaymentPlansService);
    list(): Promise<{
        amount: number;
        id: string;
        code: string;
        name: string;
        currency: string;
        description: string | null;
        durationValue: number;
        durationUnit: import("@prisma/client").PaymentPlanDurationUnit;
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
        durationValue: number;
        durationUnit: import("@prisma/client").PaymentPlanDurationUnit;
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
        durationValue: number;
        durationUnit: import("@prisma/client").PaymentPlanDurationUnit;
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
        durationValue: number;
        durationUnit: import("@prisma/client").PaymentPlanDurationUnit;
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
