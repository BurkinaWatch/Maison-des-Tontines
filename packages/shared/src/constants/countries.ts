export const COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225', currency: 'XOF', locale: 'fr-FR' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221', currency: 'XOF', locale: 'fr-FR' },
  { code: 'ML', name: 'Mali', phoneCode: '+223', currency: 'XOF', locale: 'fr-FR' },
  { code: 'BF', name: 'Burkina Faso', phoneCode: '+226', currency: 'XOF', locale: 'fr-FR' },
  { code: 'BJ', name: 'Bénin', phoneCode: '+229', currency: 'XOF', locale: 'fr-FR' },
  { code: 'NE', name: 'Niger', phoneCode: '+227', currency: 'XOF', locale: 'fr-FR' },
  { code: 'TG', name: 'Togo', phoneCode: '+228', currency: 'XOF', locale: 'fr-FR' },
  { code: 'GW', name: 'Guinée-Bissau', phoneCode: '+245', currency: 'XOF', locale: 'pt-GW' },
  { code: 'GN', name: 'Guinée', phoneCode: '+224', currency: 'GNF', locale: 'fr-FR' },
  { code: 'NG', name: 'Nigéria', phoneCode: '+234', currency: 'NGN', locale: 'en-NG' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233', currency: 'GHS', locale: 'en-GH' },
  { code: 'CM', name: 'Cameroun', phoneCode: '+237', currency: 'XAF', locale: 'fr-FR' },
  { code: 'TD', name: 'Tchad', phoneCode: '+235', currency: 'XAF', locale: 'fr-FR' },
  { code: 'GA', name: 'Gabon', phoneCode: '+241', currency: 'XAF', locale: 'fr-FR' },
  { code: 'CG', name: 'Congo', phoneCode: '+242', currency: 'XAF', locale: 'fr-FR' },
  { code: 'CD', name: 'RD Congo', phoneCode: '+243', currency: 'XAF', locale: 'fr-FR' },
  { code: 'CF', name: 'Rép. Centrafricaine', phoneCode: '+236', currency: 'XAF', locale: 'fr-FR' },
  { code: 'GQ', name: 'Guinée équatoriale', phoneCode: '+240', currency: 'XAF', locale: 'es-GQ' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254', currency: 'KES', locale: 'en-KE' },
  { code: 'UG', name: 'Ouganda', phoneCode: '+256', currency: 'UGX', locale: 'en-UG' },
  { code: 'TZ', name: 'Tanzanie', phoneCode: '+255', currency: 'TZS', locale: 'en-TZ' },
  { code: 'RW', name: 'Rwanda', phoneCode: '+250', currency: 'RWF', locale: 'rw-RW' },
  { code: 'BI', name: 'Burundi', phoneCode: '+257', currency: 'BIF', locale: 'fr-FR' },
  { code: 'MR', name: 'Mauritanie', phoneCode: '+222', currency: 'MRU', locale: 'ar-MR' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221', currency: 'XOF', locale: 'fr-FR' },
] as const;

export type CountryCode = typeof COUNTRIES[number]['code'];

export const getCountryByCode = (code: string) => COUNTRIES.find(c => c.code === code);
export const getCountryByPhoneCode = (phoneCode: string) => COUNTRIES.find(c => c.phoneCode === phoneCode);
