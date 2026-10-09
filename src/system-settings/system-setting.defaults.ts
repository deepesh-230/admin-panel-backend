export const SYSTEM_SETTING_KEYS = {
  JOB_ALERT_RETENTION_MONTHS: 'job_alert_retention_months',
  SPONSORSHIP_PLANS_HEADER: 'sponsorship_plans_header',
} as const;

export type SystemSettingKey =
  (typeof SYSTEM_SETTING_KEYS)[keyof typeof SYSTEM_SETTING_KEYS];

export const DEFAULT_SPONSORSHIP_PLANS_HEADER =
  'Choose businesses to feature, then pick a plan. Amount is plan price × businesses selected. Sponsored businesses show a star badge and appear at the top of search results.';

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
  {
    key: SYSTEM_SETTING_KEYS.SPONSORSHIP_PLANS_HEADER,
    value: DEFAULT_SPONSORSHIP_PLANS_HEADER,
    label: 'Sponsorship plans header',
    description: 'Intro text shown at the top of the mobile sponsorship / payment plans screen.',
  },
];
