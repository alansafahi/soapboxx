import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LanguageContextType {
  language: string;
  t: (key: string, fallbackToAI?: boolean) => string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
  cacheStats: {
    dbHits: number;
    aiHits: number;
    cacheHits: number;
  };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Core translation cache for performance (localStorage)
let translationCache: Record<string, Record<string, string>> = {};
let cacheStats = { dbHits: 0, aiHits: 0, cacheHits: 0 };

// Critical fallback translations (absolute minimum)
const criticalFallbacks: Record<string, string> = {
  'nav.home': 'Home',
  'nav.settings': 'Settings',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'buttons.cancel': 'Cancel'
};

// AI Translation function with caching
const getAITranslation = async (key: string, targetLanguage: string): Promise<string> => {
  try {
    // Check cache first
    const cacheKey = `${targetLanguage}:${key}`;
    const cached = localStorage.getItem(`ai_translation_${cacheKey}`);
    if (cached) {
      cacheStats.cacheHits++;
      return cached;
    }

    // Call AI translation service
    const response = await apiRequest('POST', '/api/ai-translate', {
      key,
      text: criticalFallbacks[key] || key,
      targetLanguage
    });
    
    if (response?.translation) {
      // Cache the result
      localStorage.setItem(`ai_translation_${cacheKey}`, response.translation);
      cacheStats.aiHits++;
      return response.translation;
    }
    
    return key;
  } catch (error) {
    console.warn('AI translation failed:', error);
    return criticalFallbacks[key] || key;
  }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<string>('en');
  
  // EXTREME LANGUAGE MONITORING
  useEffect(() => {
    const initLanguage = () => {
      // Check URL params first (highest priority)
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      
      if (urlLang && urlLang !== language) {
        console.log('🎯 URL LANGUAGE DETECTED:', urlLang);
        localStorage.setItem('soapbox_language', urlLang);
        setLanguageState(urlLang);
        return;
      }
      
      // Check multiple storage locations
      const storedLang = localStorage.getItem('soapbox_language') || 
                        sessionStorage.getItem('soapbox_language') || 
                        localStorage.getItem('soapbox_lang_backup') || 'en';
      
      console.log('🔍 LANGUAGE DETECTION - URL:', urlLang, 'Storage:', storedLang, 'Current:', language);
      
      // EMERGENCY OVERRIDE: If user manually set to Farsi, force it immediately
      if (storedLang === 'fa' && language !== 'fa') {
        console.log('🚨 EMERGENCY FARSI OVERRIDE DETECTED');
        document.documentElement.setAttribute('lang', 'fa');
        // DON'T set dir=rtl to avoid layout flipping
      }
      
      if (storedLang !== language) {
        console.log('🔄 FORCING LANGUAGE SYNC:', storedLang);
        setLanguageState(storedLang);
      }
    };
    
    initLanguage();
    
    // Monitor for changes every 100ms (aggressive polling)
    const interval = setInterval(initLanguage, 100);
    
    return () => clearInterval(interval);
  }, [language]);

  const queryClient = useQueryClient();

  // Fetch core translations from the database (optimized hybrid approach)
  const { data: coreTranslations, isLoading } = useQuery({
    queryKey: ['/api/translations/core', language],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/translations/core/${language}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          cacheStats.dbHits += Object.keys(data.translations || {}).length;
          return data.translations || {};
        }
        throw new Error(`Failed to fetch core translations: ${response.status}`);
      } catch (error) {
        console.warn('Database core translations unavailable, using critical fallbacks:', error);
        return criticalFallbacks;
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes (longer cache for core)
    retry: 1
  });

  const setLanguage = async (newLanguage: string) => {
    try {
      console.log('🚀 AGGRESSIVE LANGUAGE FORCE-CHANGE to:', newLanguage);
      
      // NUCLEAR OPTION: Force immediate page navigation with language in URL
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLanguage);
      
      // Set in multiple storage locations
      localStorage.setItem('soapbox_language', newLanguage);
      localStorage.setItem('soapbox_lang_backup', newLanguage);
      sessionStorage.setItem('soapbox_language', newLanguage);
      
      // Force immediate state
      setLanguageState(newLanguage);
      
      // Clear all caches aggressively
      await queryClient.clear();
      
      console.log('💥 FORCING NAVIGATION RELOAD with lang:', newLanguage);
      
      // Force navigation to trigger complete component remount
      window.location.href = url.toString();
      
    } catch (error) {
      console.error('Error setting language:', error);
      // Emergency fallback
      localStorage.setItem('soapbox_language', newLanguage);
      window.location.reload();
    }
  };

  const t = (key: string, fallbackToAI?: boolean): string => {
    // 1. Check core database translations first (fastest)
    if (coreTranslations && coreTranslations[key]) {
      return coreTranslations[key];
    }
    
    // 2. Check critical fallbacks for essential UI
    if (criticalFallbacks[key]) {
      return criticalFallbacks[key];
    }
    
    // 3. For non-core keys, use AI translation if enabled
    if (fallbackToAI && language !== 'en') {
      // Return key immediately, but trigger AI translation in background
      setTimeout(async () => {
        try {
          const aiTranslation = await getAITranslation(key, language);
          // Update the component that uses this translation
          queryClient.invalidateQueries({
            queryKey: ['/api/translations/core', language]
          });
        } catch (error) {
          console.warn('Background AI translation failed:', error);
        }
      }, 0);
    }
    
    // 4. Return key as fallback (no more console warnings for cleaner production)
    return key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      t, 
      setLanguage, 
      isLoading,
      cacheStats 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};