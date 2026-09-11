"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PAYMENT_PLANS = void 0;
exports.addPlanDuration = addPlanDuration;
exports.DEFAULT_PAYMENT_PLANS = [
    {
        code: 'silver',
        name: 'Silver',
        amount: 199,
        description: 'Support the app and unlock a Silver star.',
        durationValue: 1,
        durationUnit: 'YEAR',
        sortOrder: 1,
    },
    {
        code: 'gold',
        name: 'Gold',
        amount: 499,
        description: 'Stand out with a Gold star on your profile.',
        durationValue: 1,
        durationUnit: 'YEAR',
        sortOrder: 2,
    },
    {
        code: 'platinum',
        name: 'Platinum',
        amount: 999,
        description: 'Top support with a Platinum star.',
        durationValue: 1,
        durationUnit: 'YEAR',
        sortOrder: 3,
    },
];
function addPlanDuration(from, value, unit) {
    const safeValue = Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
    const next = new Date(from.getTime());
    if (unit === 'MONTH') {
        next.setMonth(next.getMonth() + safeValue);
    }
    else {
        next.setFullYear(next.getFullYear() + safeValue);
    }
    return next;
}
//# sourceMappingURL=payment-plan.defaults.js.map