import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/currencies';

export const formatCurrency = (amount: number, currency: string = DEFAULT_CURRENCY, locale: string = 'fr-FR'): string => {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) {
    return `${amount} ${currency}`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const parseCurrency = (value: string, currency: string = DEFAULT_CURRENCY): number => {
  const cleanValue = value.replace(/[^0-9]/g, '');
  return parseInt(cleanValue, 10) || 0;
};

export const getCurrencySymbol = (currency: string = DEFAULT_CURRENCY): string => {
  return CURRENCIES[currency]?.symbol || currency;
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  const rates: Record<string, number> = {
    XOF: 1,
    XAF: 1,
    GNF: 0.00076,
    NGN: 0.0014,
    GHS: 0.0012,
    KES: 0.0072,
    UGX: 0.00024,
    TZS: 0.00038,
  };
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  return (amount * fromRate) / toRate;
};

export const formatCurrencyCompact = (amount: number, currency: string = DEFAULT_CURRENCY): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${getCurrencySymbol(currency)}`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${getCurrencySymbol(currency)}`;
  }
  return `${amount} ${getCurrencySymbol(currency)}`;
};
