"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SYSTEM_SETTINGS = exports.SYSTEM_SETTING_KEYS = void 0;
exports.SYSTEM_SETTING_KEYS = {
    JOB_ALERT_RETENTION_MONTHS: 'job_alert_retention_months',
};
exports.DEFAULT_SYSTEM_SETTINGS = [
    {
        key: exports.SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS,
        value: '2',
        label: 'Job alert retention (months)',
        description: 'After the closing date, deactivated job alerts stay accessible for this many months, then are auto-deleted.',
    },
];
//# sourceMappingURL=system-setting.defaults.js.map