// Centralized Bible Translation Configuration
// SBX-STD-004 Compliance: Single source of truth for all Bible translations

export interface BibleTranslation {
  code: string;
  name: string;
  displayName: string;
  isActive: boolean;
  apiSupported: boolean; // Which translations our APIs can actually fetch
  sortOrder: number;
}

// Currently supported Bible translations
// Note: Only include translations that our Bible API services can actually provide
export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  // Primary translations with full API support
  {
    code: 'NIV',
    name: 'New International Version',
    displayName: 'NIV - New International Version',
    isActive: true,
    apiSupported: true,
    sortOrder: 1
  },
  {
    code: 'ESV',
    name: 'English Standard Version', 
    displayName: 'ESV - English Standard Version',
    isActive: true,
    apiSupported: true,
    sortOrder: 2
  },
  {
    code: 'NKJV',
    name: 'New King James Version',
    displayName: 'NKJV - New King James Version', 
    isActive: true,
    apiSupported: true,
    sortOrder: 3
  },
  {
    code: 'KJV',
    name: 'King James Version',
    displayName: 'KJV - King James Version',
    isActive: true,
    apiSupported: true,
    sortOrder: 4
  },
  {
    code: 'NLT',
    name: 'New Living Translation',
    displayName: 'NLT - New Living Translation',
    isActive: true,
    apiSupported: true,
    sortOrder: 5
  },
  {
    code: 'NASB',
    name: 'New American Standard Bible',
    displayName: 'NASB - New American Standard Bible',
    isActive: true,
    apiSupported: true,
    sortOrder: 6
  },
  
  // Secondary translations (limited API support via SoapBox Bible Service)
  {
    code: 'KJVA',
    name: 'King James Version with Apocrypha',
    displayName: 'KJVA - King James Version with Apocrypha',
    isActive: true,
    apiSupported: true,
    sortOrder: 7
  },
  {
    code: 'WEB',
    name: 'World English Bible',
    displayName: 'WEB - World English Bible',
    isActive: true,
    apiSupported: true,
    sortOrder: 8
  },
  {
    code: 'ASV',
    name: 'American Standard Version',
    displayName: 'ASV - American Standard Version', 
    isActive: true,
    apiSupported: true,
    sortOrder: 9
  },
  {
    code: 'CEV',
    name: 'Contemporary English Version',
    displayName: 'CEV - Contemporary English Version',
    isActive: true,
    apiSupported: true,
    sortOrder: 10
  },
  {
    code: 'GNT',
    name: 'Good News Translation',
    displayName: 'GNT - Good News Translation',
    isActive: true,
    apiSupported: true,
    sortOrder: 11
  },
  
  {
    code: 'CSB',
    name: 'Christian Standard Bible',
    displayName: 'CSB - Christian Standard Bible',
    isActive: true,
    apiSupported: true,
    sortOrder: 12
  },
  
  // Future translations (inactive until API support confirmed)
  {
    code: 'AMP',
    name: 'Amplified Bible',
    displayName: 'AMP - Amplified Bible',
    isActive: false, // Disabled until API support verified
    apiSupported: false,
    sortOrder: 13
  },
  {
    code: 'MSG',
    name: 'The Message',
    displayName: 'MSG - The Message',
    isActive: false, // Disabled until API support verified
    apiSupported: false,
    sortOrder: 14
  },
  {
    code: 'NCV',
    name: 'New Century Version',
    displayName: 'NCV - New Century Version',
    isActive: false, // Disabled until API support verified  
    apiSupported: false,
    sortOrder: 15
  },
  {
    code: 'NRSV',
    name: 'New Revised Standard Version',
    displayName: 'NRSV - New Revised Standard Version',
    isActive: false, // Disabled until API support verified
    apiSupported: false,
    sortOrder: 16
  }
];

// Helper functions
export const getActiveBibleTranslations = (): BibleTranslation[] => {
  return BIBLE_TRANSLATIONS.filter(t => t.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getApiSupportedTranslations = (): BibleTranslation[] => {
  return BIBLE_TRANSLATIONS.filter(t => t.isActive && t.apiSupported).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getBibleTranslationByCode = (code: string): BibleTranslation | undefined => {
  return BIBLE_TRANSLATIONS.find(t => t.code === code);
};

export const isValidBibleTranslation = (code: string): boolean => {
  const translation = getBibleTranslationByCode(code);
  return translation ? translation.isActive : false;
};

export const getDefaultBibleTranslation = (): string => {
  // Return the first active translation instead of hardcoding
  const firstActive = getActiveBibleTranslations()[0];
  return firstActive ? firstActive.code : 'NIV';
};

// Export for easy imports
export const ACTIVE_BIBLE_TRANSLATIONS = getActiveBibleTranslations();
export const API_SUPPORTED_TRANSLATIONS = getApiSupportedTranslations();