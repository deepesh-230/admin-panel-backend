export declare const SYSTEM_SETTING_KEYS: {
    readonly JOB_ALERT_RETENTION_MONTHS: "job_alert_retention_months";
    readonly SPONSORSHIP_PLANS_HEADER: "sponsorship_plans_header";
};
export type SystemSettingKey = (typeof SYSTEM_SETTING_KEYS)[keyof typeof SYSTEM_SETTING_KEYS];
export declare const DEFAULT_SPONSORSHIP_PLANS_HEADER = "Choose a plan at your convenience. This is a sponsorship (like a donation). After payment, a starred icon is enabled on your profile.";
export declare const DEFAULT_SYSTEM_SETTINGS: {
    key: SystemSettingKey;
    value: string;
    label: string;
    description: string;
}[];
