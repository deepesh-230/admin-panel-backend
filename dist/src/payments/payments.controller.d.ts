import { CreatePaymentDto, ListPaymentsQueryDto, UpdatePaymentDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(query: ListPaymentsQueryDto): Promise<{
        id: string;
        userId: string | null;
        payerName: string | null;
        payerEmail: string | null;
        payerPhone: string | null;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        planId: string | null;
        gateway: string | null;
        orderId: string | null;
        paymentId: string | null;
        referenceNo: string | null;
        notes: string | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            name: string | null;
            email: string;
            phone: string | null;
        } | null;
    }[]>;
    summary(): Promise<{
        successCount: number;
        successAmount: number;
        pendingCount: number;
        failedCount: number;
        refundedCount: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        userId: string | null;
        payerName: string | null;
        payerEmail: string | null;
        payerPhone: string | null;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        planId: string | null;
        gateway: string | null;
        orderId: string | null;
        paymentId: string | null;
        referenceNo: string | null;
        notes: string | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            name: string | null;
            email: string;
            phone: string | null;
        } | null;
    }>;
    create(dto: CreatePaymentDto): Promise<{
        id: string;
        userId: string | null;
        payerName: string | null;
        payerEmail: string | null;
        payerPhone: string | null;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        planId: string | null;
        gateway: string | null;
        orderId: string | null;
        paymentId: string | null;
        referenceNo: string | null;
        notes: string | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            name: string | null;
            email: string;
            phone: string | null;
        } | null;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        id: string;
        userId: string | null;
        payerName: string | null;
        payerEmail: string | null;
        payerPhone: string | null;
        amount: number;
        currency: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        purpose: import("@prisma/client").$Enums.PaymentPurpose;
        planId: string | null;
        gateway: string | null;
        orderId: string | null;
        paymentId: string | null;
        referenceNo: string | null;
        notes: string | null;
        paidAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            name: string | null;
            email: string;
            phone: string | null;
        } | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
