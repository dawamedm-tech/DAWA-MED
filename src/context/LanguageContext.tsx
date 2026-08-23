import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  CountryConfig, 
  OrderStatus, 
  MedicineCategory, 
  UserRole,
  NotificationItem 
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  translate as i18nTranslate, 
  formatCurrency as i18nFormatCurrency,
  formatNumber as i18nFormatNumber,
  formatDate as i18nFormatDate,
  formatDateTime as i18nFormatDateTime,
  getStatusLabel as i18nGetStatusLabel,
  getCategoryLabel as i18nGetCategoryLabel
} from '../utils/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: Record<string, string>;
  translate: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (usdAmount: number, country: CountryConfig) => string;
  formatNumber: (num: number) => string;
  formatDate: (dateInput: string | Date | number) => string;
  formatDateTime: (dateInput: string | Date | number) => string;
  getStatusLabel: (status: OrderStatus) => string;
  getCategoryLabel: (category: MedicineCategory | 'all') => string;
  translatePaymentMethod: (method: string) => string;
  translatePaymentStatus: (status: string) => string;
  translateRole: (role: UserRole) => string;
  translateIncidentType: (type: string) => string;
  translateFrequency: (freq: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'dawa_med_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'ar' || saved === 'fr' || saved === 'sw')) {
        return saved as Language;
      }
    } catch {
      // Fallback if localStorage is restricted
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore write errors
    }
  };

  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Keep DOM in sync with direction, language, and typography
  useEffect(() => {
    if (isRtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.style.fontFamily = "'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
      document.body.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  }, [language, isRtl]);

  const translate = (key: string, params?: Record<string, string | number>) => {
    return i18nTranslate(key, language, params);
  };

  const formatCurrency = (usdAmount: number, country: CountryConfig) => {
    return i18nFormatCurrency(usdAmount, country, language);
  };

  const formatNumber = (num: number) => {
    return i18nFormatNumber(num, language);
  };

  const formatDate = (dateInput: string | Date | number) => {
    return i18nFormatDate(dateInput, language);
  };

  const formatDateTime = (dateInput: string | Date | number) => {
    return i18nFormatDateTime(dateInput, language);
  };

  const getStatusLabel = (status: OrderStatus) => {
    return i18nGetStatusLabel(status, language);
  };

  const getCategoryLabel = (category: MedicineCategory | 'all') => {
    return i18nGetCategoryLabel(category, language);
  };

  const translatePaymentMethod = (method: string): string => {
    const key = `payment_${method.toLowerCase().replace(/[\s-]/g, '_')}`;
    const direct = translate(key);
    if (direct !== key) return direct;

    switch (method.toLowerCase()) {
      case 'mobile_money':
      case 'mobile money':
        return translate('mobileMoney');
      case 'cash_on_delivery':
      case 'cash on delivery':
      case 'cash':
        return translate('cashOnDelivery');
      case 'card':
      case 'credit_card':
      case 'bank card':
        return translate('bankCard');
      default:
        return method;
    }
  };

  const translatePaymentStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
        return language === 'ar' ? 'تم الدفع' : language === 'fr' ? 'Payé' : language === 'sw' ? 'Imelipwa' : 'Paid';
      case 'pending':
        return language === 'ar' ? 'معلق / بانتظار الدفع' : language === 'fr' ? 'En attente' : language === 'sw' ? 'Inasubiri' : 'Pending';
      case 'refunded':
        return language === 'ar' ? 'مسترجع' : language === 'fr' ? 'Remboursé' : language === 'sw' ? 'Imerudishwa' : 'Refunded';
      case 'failed':
        return language === 'ar' ? 'فشل الدفع' : language === 'fr' ? 'Échoué' : language === 'sw' ? 'Imeshindikana' : 'Failed';
      default:
        return status;
    }
  };

  const translateRole = (role: UserRole): string => {
    switch (role) {
      case 'website':
        return translate('roleWebsite');
      case 'customer':
        return translate('roleCustomer');
      case 'pharmacy':
        return translate('rolePharmacy');
      case 'driver':
        return translate('roleDriver');
      case 'subscription':
        return translate('roleSubscription');
      case 'admin':
        return translate('roleAdmin');
      default:
        return role;
    }
  };

  const translateIncidentType = (type: string): string => {
    switch (type) {
      case 'temperature_excursion':
        return language === 'ar' ? 'تجاوز درجة حرارة التبريد' : language === 'fr' ? 'Écart de température' : 'Temperature Excursion';
      case 'damaged_package':
        return language === 'ar' ? 'طرد متضرر' : language === 'fr' ? 'Colis endommagé' : 'Damaged Package';
      case 'late_delivery':
        return language === 'ar' ? 'تأخر في التوصيل' : language === 'fr' ? 'Livraison en retard' : 'Late Delivery';
      case 'incorrect_item':
        return language === 'ar' ? 'دواء غير مطابق' : language === 'fr' ? 'Article incorrect' : 'Incorrect Item';
      case 'customer_unreachable':
        return language === 'ar' ? 'المريض غير متاح' : language === 'fr' ? 'Patient injoignable' : 'Customer Unreachable';
      default:
        return type;
    }
  };

  const translateFrequency = (freq: string): string => {
    switch (freq.toLowerCase()) {
      case 'daily':
        return language === 'ar' ? 'يومياً' : language === 'fr' ? 'Quotidien' : language === 'sw' ? 'Kila siku' : 'Daily';
      case 'twice_daily':
      case 'twice daily':
        return language === 'ar' ? 'مرتين يومياً' : language === 'fr' ? 'Deux fois par jour' : language === 'sw' ? 'Mara mbili kwa siku' : 'Twice daily';
      case 'three_times_daily':
      case 'three times daily':
        return language === 'ar' ? '3 مرات يومياً' : language === 'fr' ? 'Trois fois par jour' : language === 'sw' ? 'Mara tatu kwa siku' : 'Three times daily';
      case 'weekly':
        return language === 'ar' ? 'أسبوعياً' : language === 'fr' ? 'Hebdomadaire' : language === 'sw' ? 'Kila wiki' : 'Weekly';
      case 'monthly':
        return language === 'ar' ? 'شهرياً' : language === 'fr' ? 'Mensuel' : language === 'sw' ? 'Kila mwezi' : 'Monthly';
      case 'as_needed':
      case 'as needed':
        return language === 'ar' ? 'عند اللزوم' : language === 'fr' ? 'Au besoin' : language === 'sw' ? 'Inapohitajika' : 'As needed';
      default:
        return freq;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRtl,
        t,
        translate,
        formatCurrency,
        formatNumber,
        formatDate,
        formatDateTime,
        getStatusLabel,
        getCategoryLabel,
        translatePaymentMethod,
        translatePaymentStatus,
        translateRole,
        translateIncidentType,
        translateFrequency,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => useLanguage();
