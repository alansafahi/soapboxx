/**
 * Complete Bible Import System
 * Downloads and imports missing ASV and WEB Bible translations
 * Uses legitimate public domain sources with proper attribution
 */

import { db } from './db.js';
import { bibleVerses } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

export interface BibleImportResult {
  success: boolean;
  translation: string;
  imported: number;
  skipped: number;
  errors: string[];
  source: string;
}

export class CompleteBibleImporter {
  private async deleteIncompleteTranslation(translation: string): Promise<void> {
    console.log(`🗑️ Removing incomplete ${translation} translation...`);
    await db.delete(bibleVerses).where(eq(bibleVerses.translation, translation));
    console.log(`✅ Cleared incomplete ${translation} data`);
  }

  private async importFromBolls(translation: string): Promise<BibleImportResult> {
    const result: BibleImportResult = {
      success: false,
      translation,
      imported: 0,
      skipped: 0,
      errors: [],
      source: 'bolls.life API'
    };

    try {
      console.log(`📖 Importing ${translation} from bolls.life...`);
      
      // Bible books in order
      const books = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
        '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
        'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
        'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
        'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
        'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
        'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
        '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
        '1 John', '2 John', '3 John', 'Jude', 'Revelation'
      ];

      for (const book of books) {
        try {
          console.log(`📚 Fetching ${book} from ${translation}...`);
          
          // Format book name for API (replace spaces with %20)
          const bookParam = encodeURIComponent(book);
          const apiUrl = `https://bolls.life/get-text/${translation}/${bookParam}/`;
          
          const response = await fetch(apiUrl, {
            headers: {
              'User-Agent': 'SoapBox-Bible-Import/1.0'
            }
          });

          if (!response.ok) {
            result.errors.push(`Failed to fetch ${book}: ${response.status}`);
            continue;
          }

          const data = await response.json();
          
          if (!data || !Array.isArray(data)) {
            result.errors.push(`Invalid data format for ${book}`);
            continue;
          }

          // Process verses in batches
          const batchSize = 100;
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const verseInserts = batch.map((verse: any) => ({
              book: book,
              chapter: parseInt(verse.chapter) || 1,
              verse: verse.verse || '1',
              text: verse.text || '',
              translation: translation,
              reference: `${book} ${verse.chapter}:${verse.verse}`,
              category: this.categorizeVerse(verse.text || ''),
              createdAt: new Date(),
              updatedAt: new Date()
            }));

            await db.insert(bibleVerses).values(verseInserts);
            result.imported += verseInserts.length;
          }

          console.log(`✅ Imported ${book} (${data.length} verses)`);
          
          // Small delay to be respectful to the API
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          result.errors.push(`Error importing ${book}: ${error}`);
          console.error(`❌ Error importing ${book}:`, error);
        }
      }

      result.success = result.imported > 0;
      console.log(`🎉 ${translation} import complete: ${result.imported} verses imported`);
      
    } catch (error) {
      result.errors.push(`General import error: ${error}`);
      console.error(`❌ ${translation} import failed:`, error);
    }

    return result;
  }

  private async importFromGitHub(translation: string): Promise<BibleImportResult> {
    const result: BibleImportResult = {
      success: false,
      translation,
      imported: 0,
      skipped: 0,
      errors: [],
      source: 'GitHub JSON'
    };

    try {
      console.log(`📖 Importing ${translation} from GitHub...`);
      
      let githubUrl = '';
      if (translation === 'WEB') {
        githubUrl = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/web_bible.json';
      } else if (translation === 'ASV') {
        githubUrl = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json/asv_bible.json';
      }

      if (!githubUrl) {
        result.errors.push(`No GitHub source available for ${translation}`);
        return result;
      }

      const response = await fetch(githubUrl, {
        headers: {
          'User-Agent': 'SoapBox-Bible-Import/1.0'
        }
      });

      if (!response.ok) {
        result.errors.push(`Failed to fetch from GitHub: ${response.status}`);
        return result;
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        result.errors.push('Invalid JSON format from GitHub');
        return result;
      }

      console.log(`📊 Processing ${data.length} verses from GitHub...`);

      // Process verses in batches
      const batchSize = 500;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const verseInserts = batch.map((verse: any) => ({
          book: verse.book_name || verse.book || 'Unknown',
          chapter: parseInt(verse.chapter) || 1,
          verse: verse.verse || '1',
          text: verse.text || '',
          translation: translation,
          reference: `${verse.book_name || verse.book} ${verse.chapter}:${verse.verse}`,
          category: this.categorizeVerse(verse.text || ''),
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await db.insert(bibleVerses).values(verseInserts);
        result.imported += verseInserts.length;
        
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${verseInserts.length} verses imported`);
      }

      result.success = result.imported > 0;
      console.log(`🎉 ${translation} GitHub import complete: ${result.imported} verses imported`);
      
    } catch (error) {
      result.errors.push(`GitHub import error: ${error}`);
      console.error(`❌ ${translation} GitHub import failed:`, error);
    }

    return result;
  }

  private categorizeVerse(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('love') || lowerText.includes('beloved')) return 'Love';
    if (lowerText.includes('faith') || lowerText.includes('believe')) return 'Faith';
    if (lowerText.includes('hope') || lowerText.includes('eternal')) return 'Hope';
    if (lowerText.includes('peace') || lowerText.includes('rest')) return 'Peace';
    if (lowerText.includes('strength') || lowerText.includes('strong')) return 'Strength';
    if (lowerText.includes('wisdom') || lowerText.includes('wise')) return 'Wisdom';
    if (lowerText.includes('comfort') || lowerText.includes('comfort')) return 'Comfort';
    if (lowerText.includes('forgive') || lowerText.includes('mercy')) return 'Forgiveness';
    if (lowerText.includes('joy') || lowerText.includes('rejoice')) return 'Joy';
    if (lowerText.includes('purpose') || lowerText.includes('calling')) return 'Purpose';
    if (lowerText.includes('grace') || lowerText.includes('blessed')) return 'Grace';
    if (lowerText.includes('worship') || lowerText.includes('praise')) return 'Worship';
    
    return 'Core';
  }

  async importMissingTranslations(): Promise<BibleImportResult[]> {
    const results: BibleImportResult[] = [];
    
    console.log('🚀 Starting complete Bible import for missing translations...');
    
    // Remove incomplete ASV data first
    await this.deleteIncompleteTranslation('ASV');
    
    // Import ASV from multiple sources
    console.log('📖 Importing ASV (American Standard Version)...');
    let asvResult = await this.importFromGitHub('ASV');
    if (!asvResult.success || asvResult.imported < 30000) {
      console.log('🔄 GitHub ASV failed, trying bolls.life...');
      asvResult = await this.importFromBolls('ASV');
    }
    results.push(asvResult);
    
    // Import WEB
    console.log('📖 Importing WEB (World English Bible)...');
    let webResult = await this.importFromGitHub('WEB');
    if (!webResult.success || webResult.imported < 30000) {
      console.log('🔄 GitHub WEB failed, trying bolls.life...');
      webResult = await this.importFromBolls('WEB');
    }
    results.push(webResult);
    
    return results;
  }
}

// Export singleton instance
export const completeBibleImporter = new CompleteBibleImporter();