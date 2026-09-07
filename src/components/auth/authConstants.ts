export interface DialCodeConfig {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
  nameAr: string;
}

export const COUNTRY_DIAL_CODES: Record<string, DialCodeConfig> = {
  KE: { code: 'KE', dialCode: '+254', flag: '🇰🇪', name: 'Kenya', nameAr: 'كينيا' },
  UG: { code: 'UG', dialCode: '+256', flag: '🇺🇬', name: 'Uganda', nameAr: 'أوغندا' },
  TZ: { code: 'TZ', dialCode: '+255', flag: '🇹🇿', name: 'Tanzania', nameAr: 'تنزانيا' },
  RW: { code: 'RW', dialCode: '+250', flag: '🇷🇼', name: 'Rwanda', nameAr: 'رواندا' },
  NG: { code: 'NG', dialCode: '+234', flag: '🇳🇬', name: 'Nigeria', nameAr: 'نيجيريا' },
  GH: { code: 'GH', dialCode: '+233', flag: '🇬🇭', name: 'Ghana', nameAr: 'غانا' },
  EG: { code: 'EG', dialCode: '+20', flag: '🇪🇬', name: 'Egypt', nameAr: 'مصر' },
  ZA: { code: 'ZA', dialCode: '+27', flag: '🇿🇦', name: 'South Africa', nameAr: 'جنوب أفريقيا' },
  ET: { code: 'ET', dialCode: '+251', flag: '🇪🇹', name: 'Ethiopia', nameAr: 'إثيوبيا' },
  CI: { code: 'CI', dialCode: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", nameAr: 'ساحل العاج' },
  SN: { code: 'SN', dialCode: '+221', flag: '🇸🇳', name: 'Senegal', nameAr: 'السنغال' },
  MA: { code: 'MA', dialCode: '+212', flag: '🇲🇦', name: 'Morocco', nameAr: 'المغرب' },
  SD: { code: 'SD', dialCode: '+249', flag: '🇸🇩', name: 'Sudan', nameAr: 'السودان' },
  SO: { code: 'SO', dialCode: '+252', flag: '🇸🇴', name: 'Somalia', nameAr: 'الصومال' }
};

export function getSafeDialCode(countryCode?: string): DialCodeConfig {
  if (!countryCode) return COUNTRY_DIAL_CODES.KE;
  const upper = countryCode.toUpperCase();
  return COUNTRY_DIAL_CODES[upper] || COUNTRY_DIAL_CODES.KE;
}
