import OpenAI from "openai";
import { db } from "./db";
import { translations } from "../shared/schema";
import { eq, and, count as drizzleCount } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TranslationMap {
  [key: string]: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fa', name: 'Farsi/Persian' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' }
];

export class AITranslationService {
  
  /**
   * Get all English translations as the source for translation
   */
  async getEnglishTranslations(): Promise<TranslationMap> {
    const englishTranslations = await db
      .select()
      .from(translations)
      .where(eq(translations.language, 'en'));
    
    const translationMap: TranslationMap = {};
    englishTranslations.forEach(t => {
      translationMap[t.translationKey] = t.value;
    });
    
    return translationMap;
  }

  /**
   * Translate all English translations to a target language using OpenAI
   */
  async translateToLanguage(targetLanguage: string, languageName: string): Promise<TranslationMap> {
    const englishTranslations = await this.getEnglishTranslations();
    
    // Split into smaller batches to avoid token limits
    const batchSize = 100;
    const translationKeys = Object.keys(englishTranslations);
    const translatedMap: TranslationMap = {};
    
    for (let i = 0; i < translationKeys.length; i += batchSize) {
      const batch = translationKeys.slice(i, i + batchSize);
      const batchTranslations: TranslationMap = {};
      
      batch.forEach(key => {
        batchTranslations[key] = englishTranslations[key];
      });
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional translator specializing in church management software and spiritual applications. Translate the following JSON object containing UI interface elements from English to ${languageName}.

CRITICAL REQUIREMENTS:
1. Maintain the EXACT same JSON structure and keys
2. Only translate the VALUES, never the keys
3. Keep spiritual and religious terminology contextually appropriate
4. Preserve formatting placeholders like {0}, %s, etc.
5. Maintain consistent terminology throughout
6. Use formal/respectful tone appropriate for religious contexts
7. Keep technical terms like "API", "SMS", "QR" untranslated when appropriate
8. For navigation elements, use standard UI terminology
9. Return ONLY the translated JSON object, no additional text

Context: This is for a comprehensive church management application with features including prayer walls, donations, sermon management, community engagement, spiritual tools, and administrative functions.`
            },
            {
              role: "user",
              content: JSON.stringify(batchTranslations, null, 2)
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1 // Low temperature for consistent translations
        });

        const translatedBatch = JSON.parse(response.choices[0].message.content || '{}');
        Object.assign(translatedMap, translatedBatch);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Translation error for batch ${i}-${i+batchSize}:`, error);
        throw error;
      }
    }
    
    return translatedMap;
  }

  /**
   * Save translations to database
   */
  async saveTranslations(language: string, translatedMap: TranslationMap): Promise<void> {
    const insertData = Object.entries(translatedMap).map(([key, value]) => ({
      translationKey: key,
      language: language,
      value: value
    }));

    // Delete existing translations for this language
    await db.delete(translations).where(eq(translations.language, language));
    
    // Insert new translations in batches
    const batchSize = 500;
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      await db.insert(translations).values(batch);
    }
  }

  /**
   * Auto-translate all languages using OpenAI
   */
  async translateAllLanguages(): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [], failed: [] };
    
    console.log('Starting AI-powered translation for all languages...');
    
    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang.code === 'en') {
        results.success.push(`${lang.name} (source language)`);
        continue; // Skip English as it's the source
      }
      
      try {
        console.log(`Translating to ${lang.name} (${lang.code})...`);
        
        const translatedMap = await this.translateToLanguage(lang.code, lang.name);
        await this.saveTranslations(lang.code, translatedMap);
        
        results.success.push(`${lang.name} (${Object.keys(translatedMap).length} translations)`);
        console.log(`✓ Completed ${lang.name}: ${Object.keys(translatedMap).length} translations`);
        
      } catch (error) {
        console.error(`✗ Failed ${lang.name}:`, error);
        results.failed.push(`${lang.name}: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    for (const lang of SUPPORTED_LANGUAGES) {
      const result = await db
        .select({ count: drizzleCount() })
        .from(translations)
        .where(eq(translations.language, lang.code));
      
      stats[lang.code] = result[0]?.count || 0;
    }
    
    return stats;
  }
}

export const aiTranslationService = new AITranslationService();