/**
 * Incremental Bible Import System
 * Imports Bible translations in small batches to avoid timeouts
 */
import { DatabaseStorage } from './server/storage.js';

interface BibleAPIVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleAPIResponse {
  reference: string;
  verses: BibleAPIVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

class IncrementalBibleImporter {
  private storage: DatabaseStorage;
  private baseUrl = 'https://bible-api.com';
  private delay = 100; // 100ms between requests
  
  private readonly books = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1samuel', '2samuel', '1kings', '2kings',
    '1chronicles', '2chronicles', 'ezra', 'nehemiah', 'esther', 'job',
    'psalms', 'proverbs', 'ecclesiastes', 'song_of_songs', 'isaiah',
    'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel',
    'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah',
    'haggai', 'zechariah', 'malachi', 'matthew', 'mark', 'luke', 'john',
    'acts', 'romans', '1corinthians', '2corinthians', 'galatians',
    'ephesians', 'philippians', 'colossians', '1thessalonians',
    '2thessalonians', '1timothy', '2timothy', 'titus', 'philemon',
    'hebrews', 'james', '1peter', '2peter', '1john', '2john', '3john',
    'jude', 'revelation'
  ];

  constructor() {
    this.storage = new DatabaseStorage();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchChapter(translation: string, book: string, chapter: number): Promise<BibleAPIVerse[]> {
    const url = `${this.baseUrl}/${book}+${chapter}?translation=${translation}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: BibleAPIResponse = await response.json();
      return data.verses || [];
    } catch (error) {
      console.error(`Failed to fetch ${book} ${chapter} (${translation}):`, error);
      return [];
    }
  }

  async importSingleChapter(translation: string, book: string, chapter: number): Promise<number> {
    console.log(`Importing ${translation} ${book} chapter ${chapter}...`);
    
    const verses = await this.fetchChapter(translation, book, chapter);
    if (verses.length === 0) {
      return 0;
    }

    let imported = 0;
    for (const verse of verses) {
      try {
        await this.storage.createBibleVerse({
          book: verse.book_name,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          translation: translation.toUpperCase(),
          reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
          category: 'General'
        });
        imported++;
      } catch (error) {
        // Skip duplicates or other errors
        console.log(`Skipped ${verse.book_name} ${verse.chapter}:${verse.verse} - likely duplicate`);
      }
    }

    console.log(`✓ Imported ${imported} verses from ${book} chapter ${chapter}`);
    await this.sleep(this.delay);
    return imported;
  }

  async getBookChapterCounts(): Promise<{[key: string]: number}> {
    // Standard Bible book chapter counts
    return {
      'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
      'joshua': 24, 'judges': 21, 'ruth': 4, '1samuel': 31, '2samuel': 24, '1kings': 22, '2kings': 25,
      '1chronicles': 29, '2chronicles': 36, 'ezra': 10, 'nehemiah': 13, 'esther': 10, 'job': 42,
      'psalms': 150, 'proverbs': 31, 'ecclesiastes': 12, 'song_of_songs': 8, 'isaiah': 66,
      'jeremiah': 52, 'lamentations': 5, 'ezekiel': 48, 'daniel': 12, 'hosea': 14, 'joel': 3,
      'amos': 9, 'obadiah': 1, 'jonah': 4, 'micah': 7, 'nahum': 3, 'habakkuk': 3, 'zephaniah': 3,
      'haggai': 2, 'zechariah': 14, 'malachi': 4, 'matthew': 28, 'mark': 16, 'luke': 24, 'john': 21,
      'acts': 28, 'romans': 16, '1corinthians': 16, '2corinthians': 13, 'galatians': 6,
      'ephesians': 6, 'philippians': 4, 'colossians': 4, '1thessalonians': 5,
      '2thessalonians': 3, '1timothy': 6, '2timothy': 4, 'titus': 3, 'philemon': 1,
      'hebrews': 13, 'james': 5, '1peter': 5, '2peter': 3, '1john': 5, '2john': 1, '3john': 1,
      'jude': 1, 'revelation': 22
    };
  }

  async importTranslationIncremental(translation: string): Promise<void> {
    console.log(`\n🚀 Starting incremental import of ${translation} translation...`);
    
    const chapterCounts = await this.getBookChapterCounts();
    let totalImported = 0;
    let totalAttempted = 0;

    for (const book of this.books) {
      const maxChapter = chapterCounts[book] || 1;
      console.log(`\n📖 Importing ${book} (${maxChapter} chapters)...`);

      for (let chapter = 1; chapter <= maxChapter; chapter++) {
        const imported = await this.importSingleChapter(translation, book, chapter);
        totalImported += imported;
        totalAttempted += 1;

        // Progress update every 10 chapters
        if (totalAttempted % 10 === 0) {
          const currentCount = await this.storage.getVerseCount(translation.toUpperCase());
          console.log(`📊 Progress: ${totalAttempted} chapters processed, ${currentCount} total verses in database`);
        }
      }
    }

    const finalCount = await this.storage.getVerseCount(translation.toUpperCase());
    console.log(`\n✅ Import complete for ${translation}!`);
    console.log(`📊 Final count: ${finalCount} verses in database`);
  }

  async importMissingTranslations(): Promise<void> {
    console.log('🔍 Checking which translations need import...');
    
    const translations = ['ASV', 'WEB'];
    
    for (const translation of translations) {
      const count = await this.storage.getVerseCount(translation);
      console.log(`${translation}: ${count} verses`);
      
      if (count === 0) {
        console.log(`\n⚡ Starting import for ${translation}...`);
        await this.importTranslationIncremental(translation.toLowerCase());
      }
    }
  }
}

async function main() {
  const importer = new IncrementalBibleImporter();
  
  try {
    await importer.importMissingTranslations();
    console.log('\n🎉 All missing translations imported successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

main();