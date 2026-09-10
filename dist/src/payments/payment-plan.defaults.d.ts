export declare const DEFAULT_PAYMENT_PLANS: readonly [{
    readonly code: "silver";
    readonly name: "Silver";
    readonly amount: 199;
    readonly description: "Support the app and unlock a Silver star.";
    readonly durationValue: 1;
    readonly durationUnit: "YEAR";
    readonly sortOrder: 1;
}, {
    readonly code: "gold";
    readonly name: "Gold";
    readonly amount: 499;
    readonly description: "Stand out with a Gold star on your profile.";
    readonly durationValue: 1;
    readonly durationUnit: "YEAR";
    readonly sortOrder: 2;
}, {
    readonly code: "platinum";
    readonly name: "Platinum";
    readonly amount: 999;
    readonly description: "Top support with a Platinum star.";
    readonly durationValue: 1;
    readonly durationUnit: "YEAR";
    readonly sortOrder: 3;
}];
export type PaymentPlanDurationUnit = 'MONTH' | 'YEAR';
export declare function addPlanDuration(from: Date, value: number, unit: PaymentPlanDurationUnit): Date;
