/**
 * Rate-Limited Bible Import with Exponential Backoff
 * Handles API rate limits and properly checks for existing verses
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

class RateLimitedBibleImporter {
  private storage: DatabaseStorage;
  private baseUrl = 'https://bible-api.com';
  private baseDelay = 2000; // Start with 2 seconds between requests
  private maxRetries = 3;
  
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

  async fetchChapterWithRetry(translation: string, book: string, chapter: number): Promise<BibleAPIVerse[]> {
    let delay = this.baseDelay;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const url = `${this.baseUrl}/${book}+${chapter}?translation=${translation}`;
        console.log(`Fetching ${translation} ${book} ${chapter} (attempt ${attempt + 1})`);
        
        const response = await fetch(url);
        
        if (response.status === 429) {
          console.log(`Rate limited, waiting ${delay}ms before retry...`);
          await this.sleep(delay);
          delay *= 2; // Exponential backoff
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data: BibleAPIResponse = await response.json();
        
        // Wait base delay between successful requests
        await this.sleep(this.baseDelay);
        return data.verses || [];
        
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed for ${book} ${chapter}:`, error);
        if (attempt === this.maxRetries - 1) {
          return [];
        }
        await this.sleep(delay);
        delay *= 2;
      }
    }
    
    return [];
  }

  async checkVerseExists(translation: string, book: string, chapter: number, verse: number): Promise<boolean> {
    try {
      // Check if this specific verse already exists in the database
      const existingVerse = await this.storage.getBibleVerse(
        `${book} ${chapter}:${verse}`,
        translation.toUpperCase()
      );
      return existingVerse !== null;
    } catch (error) {
      // If getBibleVerse method doesn't exist or fails, assume verse doesn't exist
      return false;
    }
  }

  async importChapterSafely(translation: string, book: string, chapter: number): Promise<number> {
    console.log(`Processing ${translation} ${book} chapter ${chapter}...`);
    
    const verses = await this.fetchChapterWithRetry(translation, book, chapter);
    if (verses.length === 0) {
      console.log(`No verses retrieved for ${book} chapter ${chapter}`);
      return 0;
    }

    let imported = 0;
    let skipped = 0;
    
    for (const verse of verses) {
      try {
        // Check if verse already exists before attempting to insert
        const exists = await this.checkVerseExists(
          translation.toUpperCase(), 
          verse.book_name, 
          verse.chapter, 
          verse.verse
        );
        
        if (exists) {
          skipped++;
          continue;
        }

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
        // This might be a true duplicate or other database error
        skipped++;
      }
    }

    console.log(`✓ Chapter ${chapter}: ${imported} imported, ${skipped} skipped`);
    return imported;
  }

  async importTranslationIncremental(translation: string): Promise<void> {
    console.log(`\n🚀 Starting rate-limited import of ${translation} translation...`);
    
    const chapterCounts: {[key: string]: number} = {
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
    
    let totalImported = 0;
    
    for (const book of this.books) {
      const maxChapter = chapterCounts[book] || 1;
      console.log(`\n📖 Starting ${book} (${maxChapter} chapters)...`);

      for (let chapter = 1; chapter <= maxChapter; chapter++) {
        const imported = await this.importChapterSafely(translation, book, chapter);
        totalImported += imported;

        // Progress update every 5 chapters
        if (chapter % 5 === 0) {
          const currentCount = await this.storage.getVerseCount(translation.toUpperCase());
          console.log(`📊 Progress: ${currentCount} verses total for ${translation}`);
        }
      }
      
      // Longer pause between books to be respectful to API
      console.log(`Completed ${book}, pausing before next book...`);
      await this.sleep(5000);
    }

    const finalCount = await this.storage.getVerseCount(translation.toUpperCase());
    console.log(`\n✅ Import complete for ${translation}!`);
    console.log(`📊 Final count: ${finalCount} verses in database`);
  }

  async importMissingTranslations(): Promise<void> {
    console.log('🔍 Checking translation status...');
    
    const translations = ['ASV', 'WEB'];
    
    for (const translation of translations) {
      const count = await this.storage.getVerseCount(translation);
      console.log(`${translation}: ${count} verses`);
      
      if (count < 30000) { // Expected ~31,000 verses per complete Bible
        console.log(`\n⚡ Starting import for ${translation}...`);
        await this.importTranslationIncremental(translation.toLowerCase());
      } else {
        console.log(`${translation} appears complete, skipping.`);
      }
    }
  }
}

async function main() {
  const importer = new RateLimitedBibleImporter();
  
  try {
    await importer.importMissingTranslations();
    console.log('\n🎉 Import process completed!');
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

main();