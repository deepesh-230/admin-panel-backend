export declare const SYSTEM_SETTING_KEYS: {
    readonly JOB_ALERT_RETENTION_MONTHS: "job_alert_retention_months";
};
export type SystemSettingKey = (typeof SYSTEM_SETTING_KEYS)[keyof typeof SYSTEM_SETTING_KEYS];
export declare const DEFAULT_SYSTEM_SETTINGS: {
    key: SystemSettingKey;
    value: string;
    label: string;
    description: string;
}[];
