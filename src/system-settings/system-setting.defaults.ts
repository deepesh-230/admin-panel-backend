export const SYSTEM_SETTING_KEYS = {
  JOB_ALERT_RETENTION_MONTHS: 'job_alert_retention_months',
} as const;

export type SystemSettingKey =
  (typeof SYSTEM_SETTING_KEYS)[keyof typeof SYSTEM_SETTING_KEYS];

export const DEFAULT_SYSTEM_SETTINGS: {
  key: SystemSettingKey;
  value: string;
  label: string;
  description: string;
}[] = [
  {
    key: SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS,
    value: '2',
    label: 'Job alert retention (months)',
    description:
      'After the closing date, deactivated job alerts stay accessible for this many months, then are auto-deleted.',
  },
];
