export const APP_CONSTANTS = {
  MAX_CONTRIBUTION_AMOUNT: 100000000,
  MIN_CONTRIBUTION_AMOUNT: 1000,
  MAX_TONTINE_MEMBERS: 50,
  MIN_TONTINE_MEMBERS: 2,
  MAX_TONTINE_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  VOTING_PERIOD_DAYS: 3,
  DISPUTE_RESOLUTION_DAYS: 7,
  PAYOUT_PROCESSING_HOURS: 24,
  PAGINATION_DEFAULT_PAGE_SIZE: 20,
  REFRESH_INTERVAL_MS: 30000,
};

export const TONTINE_TYPES = {
  rotating: { label: "Rotating", description: "Members take turns receiving the pot" },
  savings: { label: "Savings", description: "Collective savings with shared interest" },
  investment: { label: "Investment", description: "Pool funds for joint investments" },
  social: { label: "Social", description: "Social welfare and emergency support" },
} as const;

export const CONTRIBUTION_FREQUENCIES = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
} as const;

export const CURRENCIES = {
  XOF: { symbol: "FCFA", name: "West African CFA Franc" },
  XAF: { symbol: "FCFA", name: "Central African CFA Franc" },
  NGN: { symbol: "₦", name: "Nigerian Naira" },
  GHS: { symbol: "₵", name: "Ghanaian Cedi" },
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
} as const;
