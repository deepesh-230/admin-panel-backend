import { PaymentPurpose, PaymentStatus } from '@prisma/client';
export declare class ListPaymentsQueryDto {
    search?: string;
    status?: PaymentStatus;
    purpose?: PaymentPurpose;
    from?: string;
    to?: string;
}
export declare class CreatePaymentDto {
    userId?: string;
    payerName?: string;
    payerEmail?: string;
    payerPhone?: string;
    amount: number;
    currency?: string;
    status?: PaymentStatus;
    purpose?: PaymentPurpose;
    planId?: string;
    gateway?: string;
    orderId?: string;
    paymentId?: string;
    referenceNo?: string;
    notes?: string;
    paidAt?: string;
}
export declare class UpdatePaymentDto {
    userId?: string | null;
    payerName?: string;
    payerEmail?: string;
    payerPhone?: string;
    amount?: number;
    currency?: string;
    status?: PaymentStatus;
    purpose?: PaymentPurpose;
    planId?: string;
    gateway?: string;
    orderId?: string;
    paymentId?: string;
    referenceNo?: string;
    notes?: string;
    paidAt?: string | null;
}
