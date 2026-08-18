import { COUNTRIES } from '../constants/countries';

export const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return false;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const expectedLength = country.phoneCode.length + 8;
  return cleanPhone.length >= expectedLength && cleanPhone.startsWith(country.phoneCode.replace('+', ''));
};

export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return phone;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith(country.phoneCode.replace('+', ''))) {
    return cleanPhone;
  }
  return `${country.phoneCode.replace('+', '')}${cleanPhone}`;
};

export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

export const getCountryFromPhone = (phone: string): string | null => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  for (const country of COUNTRIES) {
    const prefix = country.phoneCode.replace('+', '');
    if (cleanPhone.startsWith(prefix)) {
      return country.code;
    }
  }
  return null;
};

export const maskPhoneNumber = (phone: string): string => {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  const masked = '*'.repeat(clean.length - 4);
  return `${masked}${last4}`;
};
