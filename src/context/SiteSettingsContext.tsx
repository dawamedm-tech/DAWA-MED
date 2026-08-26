import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  updateLocalSettings: (newSettings: Partial<SiteSettings>) => void;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'DAWA MED',
  siteNameAr: 'دواء ميد',
  siteNameFr: 'DAWA MED',
  tagline: 'Pan-African Verified Pharmacy Network & Cold-Chain Logistics',
  taglineAr: 'شبكة الصيدليات المعتمدة وسلسلة التبريد الموثوقة في إفريقيا',
  taglineFr: 'Réseau Pharmaceutique Vérifié & Logistique de la Chaîne du Froid',
  logoUrl: '',
  supportEmail: 'support@dawamed.com',
  supportPhone: '+254 700 000 000',
  primaryBrandColor: '#2D6A4F',
  enablePatientRegistration: true,
  enablePharmacyRegistration: true,
  requireMfaForAdmins: true,
  maintenanceMode: false,
  showAnnouncementNotice: false,
  updatedAt: new Date().toISOString()
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  loading: false,
  error: null,
  refreshSettings: async () => {},
  updateLocalSettings: () => {}
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/site-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
        setError(null);
      }
    } catch (err: any) {
      console.warn('[SiteSettingsContext] Failed to load site settings:', err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateLocalSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings: fetchSettings,
        updateLocalSettings
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
