export declare class CreatePaymentPlanDto {
    code: string;
    name: string;
    amount: number;
    currency?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class UpdatePaymentPlanDto {
    code?: string;
    name?: string;
    amount?: number;
    currency?: string;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
}
