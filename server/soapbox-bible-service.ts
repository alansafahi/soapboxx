import { scriptureApiService } from './scripture-api-service.js';
import { lookupBibleVerse } from './bible-api.js';

// Only allow these 6 Bible versions
const ALLOWED_TRANSLATIONS = ['KJV', 'KJVA', 'WEB', 'ASV', 'CEV', 'GNT'] as const;
type AllowedTranslation = typeof ALLOWED_TRANSLATIONS[number];

interface SoapBoxVerseResult {
  id: number;
  reference: string;
  text: string;
  translation: string;
  source: string;
}

/**
 * SoapBox Bible Service - API-first Bible verse lookup
 * Uses Scripture API → ChatGPT fallback as per July 2025 architecture
 */
class SoapBoxBibleService {
  /**
   * Look up a specific Bible verse using API-first approach
   */
  async getVerse(reference: string, translation: AllowedTranslation = 'KJV'): Promise<SoapBoxVerseResult | null> {
    try {
      // First try Scripture API
      const scriptureResult = await scriptureApiService.lookupVerse(reference, translation);
      if (scriptureResult) {
        return {
          id: Math.floor(Math.random() * 1000000), // Generate unique ID
          reference: scriptureResult.reference,
          text: scriptureResult.text,
          translation: scriptureResult.version,
          source: 'Scripture API'
        };
      }

      // Fallback to ChatGPT API
      const chatGptResult = await lookupBibleVerse(reference, translation);
      if (chatGptResult) {
        return {
          id: Math.floor(Math.random() * 1000000), // Generate unique ID
          reference: chatGptResult.reference,
          text: chatGptResult.text,
          translation: chatGptResult.version,
          source: 'ChatGPT API'
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Search for Bible verses using API-first approach
   */
  async searchVerses(query: string, translation?: AllowedTranslation, limit: number = 6): Promise<SoapBoxVerseResult[]> {
    try {
      // Use ChatGPT for search since it's more flexible for search queries
      const results = await lookupBibleVerse(query, translation || 'KJV');
      if (results) {
        return [{
          id: Math.floor(Math.random() * 1000000),
          reference: results.reference,
          text: results.text,
          translation: results.version,
          source: 'ChatGPT API'
        }];
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get Bible statistics (simplified for API-first approach)
   */
  async getStats() {
    return {
      totalVerses: 'API-based lookup',
      totalTranslations: ALLOWED_TRANSLATIONS.length,
      allowedTranslations: ALLOWED_TRANSLATIONS,
      cacheStrategy: 'Eliminated per July 2025 architecture',
      lookupMethod: 'Scripture API → ChatGPT fallback'
    };
  }
}

// Export singleton instance
export const soapboxBibleService = new SoapBoxBibleService();
export type { SoapBoxVerseResult, AllowedTranslation };
export { ALLOWED_TRANSLATIONS };