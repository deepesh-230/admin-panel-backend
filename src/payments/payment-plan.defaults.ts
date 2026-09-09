export const DEFAULT_PAYMENT_PLANS = [
  {
    code: 'silver',
    name: 'Silver',
    amount: 199,
    description: 'Support the app and unlock a Silver star.',
    sortOrder: 1,
  },
  {
    code: 'gold',
    name: 'Gold',
    amount: 499,
    description: 'Stand out with a Gold star on your profile.',
    sortOrder: 2,
  },
  {
    code: 'platinum',
    name: 'Platinum',
    amount: 999,
    description: 'Top support with a Platinum star.',
    sortOrder: 3,
  },
] as const;
