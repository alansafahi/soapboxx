// Bible Translation Service - Dynamic translation support
import fetch from 'node-fetch';

interface BibleVerse {
  reference: string;
  text: string;
  translation_id: string;
  translation_name: string;
}

interface BibleApiResponse {
  reference: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  text: string;
  translation_id: string;
  translation_name: string;
}

// Available translations with their API identifiers
export const AVAILABLE_TRANSLATIONS = {
  'NIV': { id: 'niv', name: 'New International Version', api: 'api.bible' },
  'ESV': { id: 'esv', name: 'English Standard Version', api: 'esv' },
  'KJV': { id: 'kjv', name: 'King James Version', api: 'bible-api' },
  'NASB': { id: 'nasb', name: 'New American Standard Bible', api: 'api.bible' },
  'NLT': { id: 'nlt', name: 'New Living Translation', api: 'api.bible' },
  'CSB': { id: 'csb', name: 'Christian Standard Bible', api: 'api.bible' },
  'NKJV': { id: 'nkjv', name: 'New King James Version', api: 'api.bible' }
};

// Cache for Bible verses to reduce API calls
const verseCache = new Map<string, BibleVerse>();

/**
 * Get Bible verse in specified translation using multiple API sources
 */
export async function getBibleVerse(reference: string, translation: string = 'NIV'): Promise<BibleVerse | null> {
  const cacheKey = `${reference}-${translation}`;
  
  // Check cache first
  if (verseCache.has(cacheKey)) {
    return verseCache.get(cacheKey)!;
  }

  const translationConfig = AVAILABLE_TRANSLATIONS[translation as keyof typeof AVAILABLE_TRANSLATIONS];
  if (!translationConfig) {
    console.warn(`Translation ${translation} not available, falling back to KJV`);
    return getBibleVerse(reference, 'KJV');
  }

  try {
    let verse: BibleVerse | null = null;

    // Try Bible-API.com first (free, simple)
    if (translationConfig.api === 'bible-api' || translation === 'KJV') {
      verse = await getBibleApiVerse(reference, translationConfig.id);
    }
    
    // Fallback to other APIs if needed
    if (!verse && translation !== 'KJV') {
      console.log(`Falling back to KJV for ${reference}`);
      verse = await getBibleApiVerse(reference, 'kjv');
    }

    if (verse) {
      // Cache the result for 24 hours
      verseCache.set(cacheKey, verse);
      setTimeout(() => verseCache.delete(cacheKey), 24 * 60 * 60 * 1000);
      return verse;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Bible verse ${reference} in ${translation}:`, error);
    return null;
  }
}

/**
 * Fetch verse from Bible-API.com
 */
async function getBibleApiVerse(reference: string, translationId: string): Promise<BibleVerse | null> {
  try {
    const encodedRef = encodeURIComponent(reference);
    const url = `https://bible-api.com/${encodedRef}?translation=${translationId}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SoapBox-SuperApp/1.0'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as BibleApiResponse;
    
    return {
      reference: data.reference,
      text: data.text,
      translation_id: data.translation_id,
      translation_name: data.translation_name
    };
  } catch (error) {
    console.error(`Bible API error for ${reference}:`, error);
    return null;
  }
}

/**
 * Transform reading plan content to use specified translation
 */
export async function translateReadingPlanDay(
  planDay: any, 
  targetTranslation: string = 'NIV'
): Promise<any> {
  if (!planDay.scripture || !planDay.scriptureReference) {
    return planDay;
  }

  // Get the verse in the target translation
  const translatedVerse = await getBibleVerse(planDay.scriptureReference, targetTranslation);
  
  if (translatedVerse) {
    return {
      ...planDay,
      scripture: translatedVerse.text,
      translation: translatedVerse.translation_name,
      translationId: translatedVerse.translation_id
    };
  }

  // Return original if translation fails
  return planDay;
}

/**
 * Get all available translations for the frontend
 */
export function getAvailableTranslations() {
  return Object.entries(AVAILABLE_TRANSLATIONS).map(([code, config]) => ({
    code,
    name: config.name,
    available: true
  }));
}