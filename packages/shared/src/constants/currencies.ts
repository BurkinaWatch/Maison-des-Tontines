export const CURRENCIES: Record<string, { code: string; name: string; symbol: string; locale: string }> = {
  XOF: { code: 'XOF', name: 'Franc CFA BCEAO', symbol: 'F CFA', locale: 'fr-FR' },
  XAF: { code: 'XAF', name: 'Franc CFA BEAC', symbol: 'F CFA', locale: 'fr-FR' },
  GNF: { code: 'GNF', name: 'Franc guinéen', symbol: 'FG', locale: 'fr-FR' },
  NGN: { code: 'NGN', name: 'Naira nigérian', symbol: '₦', locale: 'en-NG' },
  GHS: { code: 'GHS', name: 'Cedi ghanéen', symbol: 'GH₵', locale: 'en-GH' },
  KES: { code: 'KES', name: 'Shilling kényan', symbol: 'KSh', locale: 'en-KE' },
  UGX: { code: 'UGX', name: 'Shilling ougandais', symbol: 'USh', locale: 'en-UG' },
  TZS: { code: 'TZS', name: 'Shilling tanzanien', symbol: 'TSh', locale: 'en-TZ' },
};

export const DEFAULT_CURRENCY = 'XOF';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  XOF: 'F CFA',
  XAF: 'F CFA',
  GNF: 'FG',
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
  UGX: 'USh',
  TZS: 'TSh',
};
