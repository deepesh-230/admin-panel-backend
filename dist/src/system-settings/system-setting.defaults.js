"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SYSTEM_SETTINGS = exports.DEFAULT_SPONSORSHIP_PLANS_HEADER = exports.SYSTEM_SETTING_KEYS = void 0;
exports.SYSTEM_SETTING_KEYS = {
    JOB_ALERT_RETENTION_MONTHS: 'job_alert_retention_months',
    SPONSORSHIP_PLANS_HEADER: 'sponsorship_plans_header',
};
exports.DEFAULT_SPONSORSHIP_PLANS_HEADER = 'Choose a plan at your convenience. This is a sponsorship (like a donation). After payment, a starred icon is enabled on your profile.';
exports.DEFAULT_SYSTEM_SETTINGS = [
    {
        key: exports.SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS,
        value: '2',
        label: 'Job alert retention (months)',
        description: 'After the closing date, deactivated job alerts stay accessible for this many months, then are auto-deleted.',
    },
    {
        key: exports.SYSTEM_SETTING_KEYS.SPONSORSHIP_PLANS_HEADER,
        value: exports.DEFAULT_SPONSORSHIP_PLANS_HEADER,
        label: 'Sponsorship plans header',
        description: 'Intro text shown at the top of the mobile sponsorship / payment plans screen.',
    },
];
//# sourceMappingURL=system-setting.defaults.js.map