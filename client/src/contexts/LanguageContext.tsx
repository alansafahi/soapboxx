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
  const [language, setLanguageState] = useState<string>(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem('soapbox_language') || 'en';
  });

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
      
      // Force a page refresh to ensure all components re-render with new translations
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const t = (key: string): string => {
    if (translations && translations[key]) {
      return translations[key];
    }
    
    // Fallback to English if key not found
    if (fallbackTranslations[key]) {
      return fallbackTranslations[key];
    }
    
    // Return key as last resort
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