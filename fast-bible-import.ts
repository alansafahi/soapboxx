/**
 * Fast Bible Import System - ASV and WEB Translations
 * Optimized for speed with minimal delays and batch processing
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

class FastBibleImporter {
  private storage = new DatabaseStorage();
  private baseUrl = 'https://bible-api.com';
  private delay = 50; // Very fast - 50ms between requests
  private maxRetries = 2;

  private readonly books = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
    '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];

  private readonly chapterCounts: { [key: string]: number } = {
    'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
    'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
    '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
    'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
    'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
    'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
    'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
    'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
    'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
    'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
    'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
    '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
    '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
    'Jude': 1, 'Revelation': 22
  };

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchChapter(translation: string, book: string, chapter: number): Promise<BibleAPIVerse[]> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const url = `${this.baseUrl}/${book}%20${chapter}?translation=${translation}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.log(`❌ HTTP ${response.status} for ${book} ${chapter} (attempt ${attempt})`);
          continue;
        }

        const data: BibleAPIResponse = await response.json();
        
        if (!data.verses || data.verses.length === 0) {
          console.log(`⚠️ No verses found for ${book} ${chapter} (attempt ${attempt})`);
          continue;
        }

        return data.verses;
      } catch (error) {
        console.log(`❌ Error fetching ${book} ${chapter} (attempt ${attempt}):`, error);
        if (attempt === this.maxRetries) {
          return [];
        }
        await this.sleep(100);
      }
    }
    return [];
  }

  async importChapter(translation: string, book: string, chapter: number): Promise<number> {
    const verses = await this.fetchChapter(translation, book, chapter);
    
    if (verses.length === 0) {
      return 0;
    }

    let imported = 0;
    for (const verse of verses) {
      try {
        await this.storage.importBibleVerse({
          translation,
          book: verse.book_name,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text.trim(),
          category: this.categorizeVerse(verse.text)
        });
        imported++;
      } catch (error) {
        console.log(`⚠️ Failed to import ${book} ${chapter}:${verse.verse}`);
      }
    }

    return imported;
  }

  private categorizeVerse(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('love') || lowerText.includes('beloved')) return 'Love';
    if (lowerText.includes('hope') || lowerText.includes('trust')) return 'Hope';
    if (lowerText.includes('faith') || lowerText.includes('believe')) return 'Faith';
    if (lowerText.includes('peace') || lowerText.includes('calm')) return 'Peace';
    if (lowerText.includes('strength') || lowerText.includes('strong')) return 'Strength';
    if (lowerText.includes('wisdom') || lowerText.includes('wise')) return 'Wisdom';
    if (lowerText.includes('comfort') || lowerText.includes('compassion')) return 'Comfort';
    if (lowerText.includes('forgive') || lowerText.includes('mercy')) return 'Forgiveness';
    if (lowerText.includes('joy') || lowerText.includes('rejoice')) return 'Joy';
    if (lowerText.includes('grace') || lowerText.includes('blessing')) return 'Grace';
    if (lowerText.includes('worship') || lowerText.includes('praise')) return 'Worship';
    
    return 'Core';
  }

  async importTranslationFast(translation: string): Promise<void> {
    console.log(`\n🚀 Starting fast import of ${translation} translation`);
    let totalImported = 0;
    
    for (let bookIndex = 0; bookIndex < this.books.length; bookIndex++) {
      const book = this.books[bookIndex];
      const chapterCount = this.chapterCounts[book];
      
      console.log(`\n📖 Processing ${book} (${chapterCount} chapters) - Book ${bookIndex + 1}/${this.books.length}`);
      
      // Process multiple chapters in parallel for speed
      const chapterPromises = [];
      const batchSize = 5; // Process 5 chapters at once
      
      for (let chapter = 1; chapter <= chapterCount; chapter += batchSize) {
        const batch = [];
        for (let i = 0; i < batchSize && chapter + i <= chapterCount; i++) {
          batch.push(this.importChapter(translation, book, chapter + i));
        }
        
        try {
          const results = await Promise.all(batch);
          const batchTotal = results.reduce((sum, count) => sum + count, 0);
          totalImported += batchTotal;
          
          if (batchTotal > 0) {
            console.log(`✅ Chapters ${chapter}-${Math.min(chapter + batchSize - 1, chapterCount)}: ${batchTotal} verses`);
          }
        } catch (error) {
          console.log(`⚠️ Batch error for ${book} chapters ${chapter}-${chapter + batchSize - 1}`);
        }
        
        // Very short delay between batches
        await this.sleep(this.delay);
      }
    }
    
    console.log(`\n🎉 Completed ${translation} import: ${totalImported} verses imported`);
  }

  async importMissingTranslations(): Promise<void> {
    console.log('🎯 Starting fast import of missing ASV and WEB translations\n');
    
    try {
      // Import ASV first
      await this.importTranslationFast('ASV');
      
      // Short break between translations
      await this.sleep(1000);
      
      // Import WEB
      await this.importTranslationFast('WEB');
      
      console.log('\n✅ Both ASV and WEB translations imported successfully');
    } catch (error) {
      console.error('❌ Import failed:', error);
    }
  }
}

async function main() {
  const importer = new FastBibleImporter();
  await importer.importMissingTranslations();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}