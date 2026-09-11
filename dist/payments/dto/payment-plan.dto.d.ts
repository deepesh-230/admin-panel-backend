declare const DURATION_UNITS: readonly ["MONTH", "YEAR"];
export declare class CreatePaymentPlanDto {
    code: string;
    name: string;
    amount: number;
    currency?: string;
    description?: string;
    durationValue?: number;
    durationUnit?: (typeof DURATION_UNITS)[number];
    sortOrder?: number;
    isActive?: boolean;
}
export declare class UpdatePaymentPlanDto {
    code?: string;
    name?: string;
    amount?: number;
    currency?: string;
    description?: string | null;
    durationValue?: number;
    durationUnit?: (typeof DURATION_UNITS)[number];
    sortOrder?: number;
    isActive?: boolean;
}
export {};
