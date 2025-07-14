import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LanguageContextType {
  language: string;
  t: (key: string) => string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fallback translations (kept for emergency use only)
const fallbackTranslations: Record<string, string> = {
  'settings.title': 'Settings & Preferences',
  'settings.description': 'Customize your spiritual journey experience',
  'nav.home': 'Home',
  'nav.messages': 'Messages',
  'nav.contacts': 'Contacts',
  'nav.churches': 'Churches',
  'nav.events': 'Events',
  'language.label': 'Language',
  'general.title': 'General Preferences',
  'theme.label': 'Theme',
  'notifications.title': 'Notifications',
  'nav.settings': 'Settings',
  'nav.profile': 'Profile',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.loading': 'Loading...',
  'common.error': 'Error'
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
        document.documentElement.setAttribute('dir', 'rtl');
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

  // Fetch translations from the database
  const { data: translations, isLoading } = useQuery({
    queryKey: ['/api/translations', language],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/translations/${language}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Translations loaded:', data.translations ? Object.keys(data.translations).length : 0, 'keys');
          console.log('Sample translations:', data.translations ? Object.keys(data.translations).slice(0, 3) : 'none');
          console.log('First translation:', data.translations ? Object.entries(data.translations)[0] : 'none');
          return data.translations || {};
        }
        throw new Error(`Failed to fetch translations: ${response.status}`);
      } catch (error) {
        console.warn('Database translations unavailable, using fallback:', error);
        return fallbackTranslations;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  const t = (key: string): string => {
    // Debug logging to see what's happening
    if (key === 'nav.home' || key === 'home.dailySpiritualRhythm') {
      console.log(`Looking up "${key}":`, translations?.[key], 'Language:', language);
    }
    
    if (translations && translations[key]) {
      return translations[key];
    }
    
    // Fallback to English if key not found
    if (fallbackTranslations[key]) {
      return fallbackTranslations[key];
    }
    
    // Return key as last resort (this is what causes the keys to show)
    console.warn(`Translation key not found: "${key}" for language "${language}"`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      t, 
      setLanguage, 
      isLoading 
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