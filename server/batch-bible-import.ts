/**
 * Batch Bible Import System
 * Efficiently imports missing ASV and WEB translations in manageable chunks
 * Designed to handle timeout constraints and resume interrupted imports
 */

import { CompleteBibleImporter, type BibleImportResult } from './complete-bible-import.js';
import { DatabaseStorage } from './storage.js';

export class BatchBibleImporter {
  private storage = new DatabaseStorage();
  private importer = new CompleteBibleImporter();

  /**
   * Import verses in smaller batches to avoid timeouts
   */
  async importInBatches(translation: string, booksPerBatch: number = 10): Promise<BibleImportResult> {
    console.log(`📋 Starting batch import for ${translation}...`);
    
    const booksToImport = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
      'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
      'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
      'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
      'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
      'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew',
      'Mark', 'Luke', 'John', 'Acts', 'Romans',
      '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
      'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
      'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter',
      '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
    ];

    let totalImported = 0;
    let totalErrors: string[] = [];
    const startTime = Date.now();

    // Process books in batches
    for (let i = 0; i < booksToImport.length; i += booksPerBatch) {
      const batch = booksToImport.slice(i, i + booksPerBatch);
      const batchNum = Math.floor(i / booksPerBatch) + 1;
      const totalBatches = Math.ceil(booksToImport.length / booksPerBatch);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches}: ${batch.join(', ')}`);
      
      try {
        const batchResult = await this.importBookBatch(translation, batch);
        totalImported += batchResult.imported;
        totalErrors.push(...batchResult.errors);
        
        console.log(`✅ Batch ${batchNum} completed: ${batchResult.imported} verses imported`);
        
        // Brief pause between batches to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Batch ${batchNum} failed:`, error);
        totalErrors.push(`Batch ${batchNum} failed: ${error}`);
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`🎉 ${translation} batch import completed in ${duration}s: ${totalImported} total verses`);

    return {
      success: totalImported > 0,
      translation,
      imported: totalImported,
      skipped: 0,
      errors: totalErrors,
      source: 'batch-import'
    };
  }

  /**
   * Import a specific batch of books
   */
  private async importBookBatch(translation: string, books: string[]): Promise<BibleImportResult> {
    let imported = 0;
    const errors: string[] = [];

    for (const book of books) {
      try {
        const verses = await this.fetchBookVerses(translation, book);
        if (verses.length > 0) {
          await this.saveVerses(translation, book, verses);
          imported += verses.length;
          console.log(`  📖 ${book}: ${verses.length} verses`);
        }
      } catch (error) {
        console.error(`  ❌ ${book} failed:`, error);
        errors.push(`${book}: ${error}`);
      }
    }

    return {
      success: imported > 0,
      translation,
      imported,
      skipped: 0,
      errors,
      source: 'batch'
    };
  }

  /**
   * Fetch verses for a specific book from bolls.life API
   */
  private async fetchBookVerses(translation: string, book: string): Promise<any[]> {
    const apiTranslation = translation === 'ASV' ? 'asv' : 'web';
    const url = `https://bolls.life/get-text/${apiTranslation}/${encodeURIComponent(book)}/`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Failed to fetch ${book} from ${url}:`, error);
      return [];
    }
  }

  /**
   * Save verses to database
   */
  private async saveVerses(translation: string, book: string, verses: any[]): Promise<void> {
    const versesToInsert = verses.map(verse => ({
      book,
      chapter: verse.chapter || 1,
      verse: verse.verse || 1,
      text: verse.text?.trim() || '',
      translation,
      category: this.categorizeVerse(verse.text || ''),
      reference: `${book} ${verse.chapter || 1}:${verse.verse || 1}`
    })).filter(v => v.text.length > 0 && v.text.length < 2000);

    if (versesToInsert.length > 0) {
      await this.storage.createBibleVerses(versesToInsert);
    }
  }

  /**
   * Categorize verse content
   */
  private categorizeVerse(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('love') || lowerText.includes('beloved')) return 'Love';
    if (lowerText.includes('faith') || lowerText.includes('believe')) return 'Faith';
    if (lowerText.includes('hope') || lowerText.includes('trust')) return 'Hope';
    if (lowerText.includes('peace') || lowerText.includes('calm')) return 'Peace';
    if (lowerText.includes('strength') || lowerText.includes('strong')) return 'Strength';
    if (lowerText.includes('wisdom') || lowerText.includes('wise')) return 'Wisdom';
    if (lowerText.includes('comfort') || lowerText.includes('comforted')) return 'Comfort';
    if (lowerText.includes('forgive') || lowerText.includes('forgiveness')) return 'Forgiveness';
    if (lowerText.includes('joy') || lowerText.includes('rejoice')) return 'Joy';
    if (lowerText.includes('grace') || lowerText.includes('mercy')) return 'Grace';
    
    return 'Core';
  }

  /**
   * Get current verse count for a translation
   */
  async getVerseCount(translation: string): Promise<number> {
    try {
      const verses = await this.storage.getBibleVersesByTranslation(translation);
      return verses.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if translation is complete (should have ~31,000+ verses)
   */
  async isTranslationComplete(translation: string): Promise<boolean> {
    const count = await this.getVerseCount(translation);
    return count >= 31000; // Complete Bible should have 31,000+ verses
  }
}

export const batchBibleImporter = new BatchBibleImporter();