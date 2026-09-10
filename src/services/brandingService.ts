import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteSettings } from '../types';

export interface BrandingConfig {
  logoUrl: string;
  faviconUrl?: string;
  siteName: string;
  siteNameAr: string;
  siteNameFr: string;
  tagline: string;
  taglineAr: string;
  taglineFr: string;
  primaryColor: string;
  secondaryColor: string;
  logoFileName?: string;
  logoFileType?: string;
  logoFileSizeKb?: number;
  logoUpdatedAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  siteName: 'DAWA MED',
  siteNameAr: 'دواء ميد',
  siteNameFr: 'DAWA MED',
  tagline: 'Pan-African Verified Pharmacy Network & Cold-Chain Logistics',
  taglineAr: 'شبكة الصيدليات المعتمدة وسلسلة التبريد الموثوقة في إفريقيا',
  taglineFr: 'Réseau Pharmaceutique Vérifié & Logistique de la Chaîne du Froid',
  primaryColor: '#0E7A4B',
  secondaryColor: '#10B981',
  updatedAt: new Date().toISOString()
};

/**
 * Central Branding Service
 * Single Source of Truth for Platform Brand Identity & Persistent Configuration
 */
class BrandingService {
  private currentBranding: BrandingConfig = { ...DEFAULT_BRANDING };
  private listeners: Set<(branding: BrandingConfig) => void> = new Set();
  private isListening = false;
  private unsubscribeSnapshot: (() => void) | null = null;

  constructor() {
    this.initFirestoreListener();
  }

  /**
   * Initializes real-time Firestore listener on settings/platform document
   */
  private initFirestoreListener() {
    if (this.isListening || typeof window === 'undefined') return;

    try {
      const platformDocRef = doc(db, 'settings', 'platform');
      this.unsubscribeSnapshot = onSnapshot(
        platformDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<BrandingConfig>;
            this.currentBranding = {
              ...DEFAULT_BRANDING,
              ...data,
              // Ensure logoUrl is sanitized string
              logoUrl: data.logoUrl || ''
            };
            this.notifyListeners();
            this.applyDomBranding(this.currentBranding);
          } else {
            // Fallback to API if document does not exist yet
            this.fetchFromApi();
          }
        },
        (error) => {
          console.warn('[BrandingService] Firestore listener notice (fallback to REST):', error.message);
          this.fetchFromApi();
        }
      );
      this.isListening = true;
    } catch (err) {
      console.warn('[BrandingService] Failed to attach Firestore listener:', err);
      this.fetchFromApi();
    }
  }

  /**
   * Fallback REST loader from server
   */
  public async fetchFromApi(): Promise<BrandingConfig> {
    try {
      const res = await fetch('/api/site-settings?ts=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        this.currentBranding = {
          ...this.currentBranding,
          logoUrl: data.logoUrl || '',
          siteName: data.siteName || this.currentBranding.siteName,
          siteNameAr: data.siteNameAr || this.currentBranding.siteNameAr,
          siteNameFr: data.siteNameFr || this.currentBranding.siteNameFr,
          tagline: data.tagline || this.currentBranding.tagline,
          taglineAr: data.taglineAr || this.currentBranding.taglineAr,
          primaryColor: data.primaryBrandColor || this.currentBranding.primaryColor,
          logoFileName: data.logoFileName,
          logoUpdatedAt: data.logoUpdatedAt
        };
        this.notifyListeners();
        this.applyDomBranding(this.currentBranding);
      }
    } catch (e) {
      console.warn('[BrandingService] Failed to fetch branding from API:', e);
    }
    return this.currentBranding;
  }

  /**
   * Dynamically synchronizes HTML title and favicon with branding
   */
  private applyDomBranding(branding: BrandingConfig) {
    try {
      if (branding.faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.head.appendChild(link);
        }
        link.href = branding.faviconUrl;
      }
    } catch (err) {
      // Non-blocking DOM update
    }
  }

  /**
   * Subscribe to real-time branding updates
   */
  public subscribe(callback: (branding: BrandingConfig) => void): () => void {
    this.listeners.add(callback);
    // Emit immediate current state
    callback(this.currentBranding);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentBranding);
      } catch (e) {
        console.error('[BrandingService] Listener error:', e);
      }
    }
  }

  public getBranding(): BrandingConfig {
    return { ...this.currentBranding };
  }

  /**
   * Uploads and deploys new custom brand logo via verified admin endpoint
   */
  public async uploadLogo(
    file: File,
    token: string
  ): Promise<{ success: boolean; logoUrl?: string; error?: string }> {
    // Client-side quick validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { success: false, error: 'Unsupported file type. Supported formats: PNG, JPG, WEBP, SVG.' };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 2MB limit.' };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        try {
          const res = await fetch('/api/admin/site-settings/logo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              logoData: base64Data,
              fileName: file.name,
              fileType: file.type,
              fileSizeKb: Math.round(file.size / 1024)
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            // Update local memory & fetch fresh state
            if (data.logoUrl) {
              this.currentBranding.logoUrl = data.logoUrl;
              this.notifyListeners();
            }
            await this.fetchFromApi();
            resolve({ success: true, logoUrl: data.logoUrl });
          } else {
            resolve({ success: false, error: data.error || 'Failed to upload logo.' });
          }
        } catch (err: any) {
          resolve({ success: false, error: err?.message || 'Network error uploading logo.' });
        }
      };
      reader.onerror = () => resolve({ success: false, error: 'Failed to read image file.' });
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resets the brand logo to system default
   */
  public async resetLogo(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/site-settings/reset-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.currentBranding.logoUrl = '';
        this.notifyListeners();
        await this.fetchFromApi();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to reset logo.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error resetting logo.' };
    }
  }

  /**
   * Update full branding identity metadata in Firestore and server
   */
  public async updateBrandingMetadata(
    updates: Partial<BrandingConfig>,
    token: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.currentBranding = { ...this.currentBranding, ...updates };
        this.notifyListeners();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to save branding changes.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error updating branding.' };
    }
  }
}

export const brandingService = new BrandingService();
