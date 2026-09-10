import { useState, useEffect, useCallback } from 'react';
import { brandingService, BrandingConfig, DEFAULT_BRANDING } from '../services/brandingService';

export interface UseBrandingReturn extends BrandingConfig {
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
  uploadLogo: (file: File, token: string) => Promise<{ success: boolean; logoUrl?: string; error?: string }>;
  resetLogo: (token: string) => Promise<{ success: boolean; error?: string }>;
  updateBranding: (updates: Partial<BrandingConfig>, token: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * useBranding Hook
 * Central hook for accessing the platform's unified visual identity and official logo
 */
export function useBranding(): UseBrandingReturn {
  const [branding, setBranding] = useState<BrandingConfig>(() => brandingService.getBranding());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to real-time updates from brandingService (Firestore listener backed)
    const unsubscribe = brandingService.subscribe((updated) => {
      setBranding(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshBranding = useCallback(async () => {
    setIsLoading(true);
    try {
      const fresh = await brandingService.fetchFromApi();
      setBranding(fresh);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadLogo = useCallback(async (file: File, token: string) => {
    setIsLoading(true);
    try {
      return await brandingService.uploadLogo(file, token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetLogo = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      return await brandingService.resetLogo(token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBranding = useCallback(async (updates: Partial<BrandingConfig>, token: string) => {
    setIsLoading(true);
    try {
      return await brandingService.updateBrandingMetadata(updates, token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    ...branding,
    isLoading,
    refreshBranding,
    uploadLogo,
    resetLogo,
    updateBranding
  };
}
