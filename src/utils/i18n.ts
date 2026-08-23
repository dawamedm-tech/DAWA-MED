import { Language, CountryConfig, OrderStatus, MedicineCategory } from '../types';
import { TRANSLATIONS } from '../data/translations';

/**
 * Safe translation string accessor with fallback to English
 */
export function translate(key: string, language: Language = 'en', params?: Record<string, string | number>): string {
  const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
  let text = langDict[key] || TRANSLATIONS.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
    });
  }

  return text;
}

/**
 * Format currency according to locale & country config
 */
export function formatCurrency(usdAmount: number, country: CountryConfig, language: Language = 'en'): string {
  const localAmount = Math.round(usdAmount * country.exchangeRateToUSD);
  
  try {
    const localeCode = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : language === 'sw' ? 'sw-KE' : 'en-US';
    const formattedNumber = new Intl.NumberFormat(localeCode).format(localAmount);
    return `${country.currencySymbol} ${formattedNumber}`;
  } catch {
    return `${country.currencySymbol} ${localAmount.toLocaleString()}`;
  }
}

/**
 * Format raw number with proper locale glyphs/separators
 */
export function formatNumber(num: number, language: Language = 'en'): string {
  try {
    const localeCode = language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : language === 'sw' ? 'sw-KE' : 'en-US';
    return new Intl.NumberFormat(localeCode).format(num);
  } catch {
    return num.toLocaleString();
  }
}

/**
 * Localized date formatting
 */
export function formatDate(dateInput: string | Date | number, language: Language = 'en'): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const localeCode = language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : language === 'sw' ? 'sw-KE' : 'en-US';
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Localized date with time
 */
export function formatDateTime(dateInput: string | Date | number, language: Language = 'en'): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const localeCode = language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : language === 'sw' ? 'sw-KE' : 'en-US';
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Get translated Order Status label
 */
export function getStatusLabel(status: OrderStatus, language: Language = 'en'): string {
  const key = `status_${status}`;
  return translate(key, language);
}

/**
 * Get translated Category label
 */
export function getCategoryLabel(category: MedicineCategory | 'all', language: Language = 'en'): string {
  const catMap: Record<string, string> = {
    all: 'allCategories',
    chronic: 'catChronic',
    antibiotics: 'catAntibiotics',
    pain_fever: 'catPain',
    respiratory: 'catRespiratory',
    gastro: 'catGastro',
    vitamins: 'catVitamins',
    first_aid: 'catFirstAid',
    maternal: 'catMaternal',
    personal_care: 'catPersonalCare',
    other: 'catOther',
  };

  const key = catMap[category] || 'allCategories';
  return translate(key, language);
}
