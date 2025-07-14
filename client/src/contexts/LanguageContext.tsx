import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface LanguageContextType {
  language: string;
  t: (key: string) => string;
  setLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation mappings
const translations = {
  en: {
    'settings.title': 'Settings & Preferences',
    'settings.description': 'Customize your spiritual journey experience',
    'language.title': 'Language & Region',
    'language.description': 'Select your preferred language and regional settings',
    'language.label': 'Language',
    'general.title': 'General Preferences',
    'general.description': 'Customize your reading experience and interface preferences',
    'theme.label': 'Theme',
    'fontSize.label': 'Font Size',
    'readingSpeed.label': 'Reading Speed',
    'audioSpeed.label': 'Audio Speed',
    'timezone.label': 'Timezone',
    'familyMode.label': 'Family Mode',
    'familyMode.description': 'Enable child-safe content filtering and simplified interface',
    'notifications.title': 'Notifications',
    'notifications.description': 'Configure when and how you receive spiritual reminders',
    'prayerTimes.label': 'Prayer Times',
    'prayerTimes.description': 'Set your preferred times for prayer reminders',
    'quietHours.label': 'Quiet Hours',
    'quietHours.description': 'No notifications during these hours',
    'offline.title': 'Offline Content',
    'sync.title': 'Cross-Platform Sync',
    'ai.title': 'AI Personalization',
    'multilingual.title': 'Multilingual Content',
    'multilingual.description': 'Content is automatically translated to your preferred language while maintaining theological accuracy and cultural sensitivity.',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.auto': 'Auto',
    'fontSize.small': 'Small',
    'fontSize.medium': 'Medium',
    'fontSize.large': 'Large',
    'readingSpeed.slow': 'Slow',
    'readingSpeed.medium': 'Medium',
    'readingSpeed.fast': 'Fast',
    'general': 'General',
    'notifications': 'Notifications',
    'offline': 'Offline',
    'sync': 'Sync',
    'ai': 'AI',
    'language': 'Language'
  },
  es: {
    'settings.title': 'Configuración y Preferencias',
    'settings.description': 'Personaliza tu experiencia de viaje espiritual',
    'language.title': 'Idioma y Región',
    'language.description': 'Selecciona tu idioma preferido y configuración regional',
    'language.label': 'Idioma',
    'general.title': 'Preferencias Generales',
    'general.description': 'Personaliza tu experiencia de lectura y preferencias de interfaz',
    'theme.label': 'Tema',
    'fontSize.label': 'Tamaño de Fuente',
    'readingSpeed.label': 'Velocidad de Lectura',
    'audioSpeed.label': 'Velocidad de Audio',
    'timezone.label': 'Zona Horaria',
    'familyMode.label': 'Modo Familiar',
    'familyMode.description': 'Habilitar filtrado de contenido seguro para niños e interfaz simplificada',
    'notifications.title': 'Notificaciones',
    'notifications.description': 'Configura cuándo y cómo recibir recordatorios espirituales',
    'prayerTimes.label': 'Horarios de Oración',
    'prayerTimes.description': 'Establece tus horarios preferidos para recordatorios de oración',
    'quietHours.label': 'Horas de Silencio',
    'quietHours.description': 'Sin notificaciones durante estas horas',
    'offline.title': 'Contenido Sin Conexión',
    'sync.title': 'Sincronización Multiplataforma',
    'ai.title': 'Personalización IA',
    'multilingual.title': 'Contenido Multilingüe',
    'multilingual.description': 'El contenido se traduce automáticamente a tu idioma preferido manteniendo la precisión teológica y sensibilidad cultural.',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.auto': 'Automático',
    'fontSize.small': 'Pequeño',
    'fontSize.medium': 'Mediano',
    'fontSize.large': 'Grande',
    'readingSpeed.slow': 'Lento',
    'readingSpeed.medium': 'Medio',
    'readingSpeed.fast': 'Rápido',
    'general': 'General',
    'notifications': 'Notific.',
    'offline': 'Sin Red',
    'sync': 'Sinc.',
    'ai': 'IA',
    'language': 'Idioma'
  },
  fr: {
    'settings.title': 'Paramètres et Préférences',
    'settings.description': 'Personnalisez votre expérience de voyage spirituel',
    'language.title': 'Langue et Région',
    'language.description': 'Sélectionnez votre langue préférée et paramètres régionaux',
    'language.label': 'Langue',
    'general.title': 'Préférences Générales',
    'general.description': 'Personnalisez votre expérience de lecture et préférences d\'interface',
    'theme.label': 'Thème',
    'fontSize.label': 'Taille de Police',
    'readingSpeed.label': 'Vitesse de Lecture',
    'audioSpeed.label': 'Vitesse Audio',
    'timezone.label': 'Fuseau Horaire',
    'familyMode.label': 'Mode Famille',
    'familyMode.description': 'Activer le filtrage de contenu sûr pour enfants et interface simplifiée',
    'notifications.title': 'Notifications',
    'notifications.description': 'Configurez quand et comment recevoir des rappels spirituels',
    'prayerTimes.label': 'Heures de Prière',
    'prayerTimes.description': 'Définissez vos heures préférées pour les rappels de prière',
    'quietHours.label': 'Heures Silencieuses',
    'quietHours.description': 'Aucune notification pendant ces heures',
    'offline.title': 'Contenu Hors Ligne',
    'sync.title': 'Synchronisation Multi-plateforme',
    'ai.title': 'Personnalisation IA',
    'multilingual.title': 'Contenu Multilingue',
    'multilingual.description': 'Le contenu est automatiquement traduit dans votre langue préférée tout en maintenant la précision théologique et la sensibilité culturelle.',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
    'theme.auto': 'Auto',
    'fontSize.small': 'Petit',
    'fontSize.medium': 'Moyen',
    'fontSize.large': 'Grand',
    'readingSpeed.slow': 'Lent',
    'readingSpeed.medium': 'Moyen',
    'readingSpeed.fast': 'Rapide',
    'general': 'Général',
    'notifications': 'Notif.',
    'offline': 'Hors ligne',
    'sync': 'Sync',
    'ai': 'IA',
    'language': 'Langue'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en');

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['/api/user/preferences'],
  });

  // Update language when preferences change
  useEffect(() => {
    if (preferences?.language) {
      setLanguage(preferences.language);
    }
  }, [preferences]);

  // Translation function
  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations] || translations.en;
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}