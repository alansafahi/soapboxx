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
  
  // Initialize language from localStorage on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('soapbox_language') || 'en';
    console.log('Loading language from localStorage:', savedLang);
    setLanguageState(savedLang);
  }, []);

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
      setLanguageState(newLanguage);
      localStorage.setItem('soapbox_language', newLanguage);
      
      // Invalidate translations query to fetch new language
      await queryClient.invalidateQueries({
        queryKey: ['/api/translations', language]
      });
      
      // Also invalidate the new language query
      await queryClient.invalidateQueries({
        queryKey: ['/api/translations', newLanguage]
      });
      
      // Force immediate update
      console.log('Language changed to:', newLanguage, 'localStorage will be:', newLanguage);
      
      // Force a page refresh to ensure all components re-render with new translations
      setTimeout(() => {
        console.log('Reloading page for language change...');
        window.location.reload();
      }, 200);
    } catch (error) {
      console.error('Error setting language:', error);
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