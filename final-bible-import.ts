/**
 * Final Bible Import System - ASV and WEB Translations
 * Uses bolls.life API with proper error handling and data validation
 */
import { DatabaseStorage } from './server/storage.js';

interface BollsApiVerse {
  pk: number;
  verse: number;
  text: string;
}

interface BollsApiResponse {
  verses: BollsApiVerse[];
}

class FinalBibleImporter {
  private storage: DatabaseStorage;
  private baseUrl = 'https://bolls.life/get-text';
  private delay = 1500; // 1.5 seconds between requests
  
  private readonly books = [
    { name: 'Genesis', id: 'GEN', chapters: 50 },
    { name: 'Exodus', id: 'EXO', chapters: 40 },
    { name: 'Leviticus', id: 'LEV', chapters: 27 },
    { name: 'Numbers', id: 'NUM', chapters: 36 },
    { name: 'Deuteronomy', id: 'DEU', chapters: 34 },
    { name: 'Joshua', id: 'JOS', chapters: 24 },
    { name: 'Judges', id: 'JDG', chapters: 21 },
    { name: 'Ruth', id: 'RUT', chapters: 4 },
    { name: '1 Samuel', id: '1SA', chapters: 31 },
    { name: '2 Samuel', id: '2SA', chapters: 24 },
    { name: '1 Kings', id: '1KI', chapters: 22 },
    { name: '2 Kings', id: '2KI', chapters: 25 },
    { name: '1 Chronicles', id: '1CH', chapters: 29 },
    { name: '2 Chronicles', id: '2CH', chapters: 36 },
    { name: 'Ezra', id: 'EZR', chapters: 10 },
    { name: 'Nehemiah', id: 'NEH', chapters: 13 },
    { name: 'Esther', id: 'EST', chapters: 10 },
    { name: 'Job', id: 'JOB', chapters: 42 },
    { name: 'Psalms', id: 'PSA', chapters: 150 },
    { name: 'Proverbs', id: 'PRO', chapters: 31 },
    { name: 'Ecclesiastes', id: 'ECC', chapters: 12 },
    { name: 'Song of Solomon', id: 'SNG', chapters: 8 },
    { name: 'Isaiah', id: 'ISA', chapters: 66 },
    { name: 'Jeremiah', id: 'JER', chapters: 52 },
    { name: 'Lamentations', id: 'LAM', chapters: 5 },
    { name: 'Ezekiel', id: 'EZK', chapters: 48 },
    { name: 'Daniel', id: 'DAN', chapters: 12 },
    { name: 'Hosea', id: 'HOS', chapters: 14 },
    { name: 'Joel', id: 'JOL', chapters: 3 },
    { name: 'Amos', id: 'AMO', chapters: 9 },
    { name: 'Obadiah', id: 'OBA', chapters: 1 },
    { name: 'Jonah', id: 'JON', chapters: 4 },
    { name: 'Micah', id: 'MIC', chapters: 7 },
    { name: 'Nahum', id: 'NAM', chapters: 3 },
    { name: 'Habakkuk', id: 'HAB', chapters: 3 },
    { name: 'Zephaniah', id: 'ZEP', chapters: 3 },
    { name: 'Haggai', id: 'HAG', chapters: 2 },
    { name: 'Zechariah', id: 'ZEC', chapters: 14 },
    { name: 'Malachi', id: 'MAL', chapters: 4 },
    { name: 'Matthew', id: 'MAT', chapters: 28 },
    { name: 'Mark', id: 'MRK', chapters: 16 },
    { name: 'Luke', id: 'LUK', chapters: 24 },
    { name: 'John', id: 'JHN', chapters: 21 },
    { name: 'Acts', id: 'ACT', chapters: 28 },
    { name: 'Romans', id: 'ROM', chapters: 16 },
    { name: '1 Corinthians', id: '1CO', chapters: 16 },
    { name: '2 Corinthians', id: '2CO', chapters: 13 },
    { name: 'Galatians', id: 'GAL', chapters: 6 },
    { name: 'Ephesians', id: 'EPH', chapters: 6 },
    { name: 'Philippians', id: 'PHP', chapters: 4 },
    { name: 'Colossians', id: 'COL', chapters: 4 },
    { name: '1 Thessalonians', id: '1TH', chapters: 5 },
    { name: '2 Thessalonians', id: '2TH', chapters: 3 },
    { name: '1 Timothy', id: '1TI', chapters: 6 },
    { name: '2 Timothy', id: '2TI', chapters: 4 },
    { name: 'Titus', id: 'TIT', chapters: 3 },
    { name: 'Philemon', id: 'PHM', chapters: 1 },
    { name: 'Hebrews', id: 'HEB', chapters: 13 },
    { name: 'James', id: 'JAS', chapters: 5 },
    { name: '1 Peter', id: '1PE', chapters: 5 },
    { name: '2 Peter', id: '2PE', chapters: 3 },
    { name: '1 John', id: '1JN', chapters: 5 },
    { name: '2 John', id: '2JN', chapters: 1 },
    { name: '3 John', id: '3JN', chapters: 1 },
    { name: 'Jude', id: 'JUD', chapters: 1 },
    { name: 'Revelation', id: 'REV', chapters: 22 }
  ];

  constructor() {
    this.storage = new DatabaseStorage();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchChapter(translation: string, bookId: string, chapter: number): Promise<BollsApiVerse[]> {
    try {
      const url = `${this.baseUrl}/${translation.toLowerCase()}/${bookId}/${chapter}`;
      console.log(`Fetching: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`HTTP ${response.status} for ${bookId} ${chapter}`);
        return [];
      }
      
      const data: BollsApiResponse = await response.json();
      return data.verses || [];
      
    } catch (error) {
      console.error(`Error fetching ${bookId} ${chapter}:`, error);
      return [];
    }
  }

  async importChapter(translation: string, book: any, chapter: number): Promise<number> {
    console.log(`Processing ${translation} ${book.name} chapter ${chapter}...`);
    
    const verses = await this.fetchChapter(translation, book.id, chapter);
    if (verses.length === 0) {
      console.log(`No verses found for ${book.name} chapter ${chapter}`);
      return 0;
    }

    let imported = 0;
    
    for (const verse of verses) {
      try {
        await this.storage.createBibleVerse({
          book: book.name,
          chapter: chapter,
          verse: verse.verse,
          text: verse.text.trim(),
          translation: translation.toUpperCase(),
          reference: `${book.name} ${chapter}:${verse.verse}`,
          category: this.categorizeVerse(verse.text)
        });
        imported++;
        
      } catch (error) {
        // Likely a duplicate, which is fine
        if (error instanceof Error && !error.message.includes('duplicate')) {
          console.error(`Error saving verse ${book.name} ${chapter}:${verse.verse}:`, error.message);
        }
      }
    }

    console.log(`Imported ${imported} verses for ${book.name} chapter ${chapter}`);
    await this.sleep(this.delay);
    return imported;
  }

  private categorizeVerse(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('faith') || lowerText.includes('believe')) return 'Faith';
    if (lowerText.includes('hope') || lowerText.includes('future')) return 'Hope';
    if (lowerText.includes('love') || lowerText.includes('beloved')) return 'Love';
    if (lowerText.includes('peace') || lowerText.includes('calm')) return 'Peace';
    if (lowerText.includes('strength') || lowerText.includes('strong')) return 'Strength';
    if (lowerText.includes('wisdom') || lowerText.includes('wise')) return 'Wisdom';
    if (lowerText.includes('comfort') || lowerText.includes('console')) return 'Comfort';
    if (lowerText.includes('forgiv') || lowerText.includes('mercy')) return 'Forgiveness';
    if (lowerText.includes('joy') || lowerText.includes('rejoice')) return 'Joy';
    if (lowerText.includes('purpose') || lowerText.includes('plan')) return 'Purpose';
    if (lowerText.includes('grace') || lowerText.includes('blessing')) return 'Grace';
    if (lowerText.includes('worship') || lowerText.includes('praise')) return 'Worship';
    
    return 'General';
  }

  async importTranslation(translation: string): Promise<void> {
    console.log(`\nStarting import of ${translation} translation...`);
    
    let totalImported = 0;
    let bookCount = 0;
    
    for (const book of this.books) {
      bookCount++;
      console.log(`\n[${bookCount}/${this.books.length}] Starting ${book.name} (${book.chapters} chapters)...`);
      
      let bookImported = 0;
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const imported = await this.importChapter(translation, book, chapter);
        bookImported += imported;
        totalImported += imported;
      }
      
      console.log(`Completed ${book.name}: ${bookImported} verses imported`);
      
      // Status update every 10 books
      if (bookCount % 10 === 0) {
        const currentCount = await this.storage.getVerseCount(translation.toUpperCase());
        console.log(`\nStatus Update: ${currentCount} total verses in database for ${translation}`);
      }
    }

    const finalCount = await this.storage.getVerseCount(translation.toUpperCase());
    console.log(`\nImport Complete for ${translation}!`);
    console.log(`Total verses in database: ${finalCount}`);
    console.log(`Verses imported this session: ${totalImported}`);
  }

  async importMissingTranslations(): Promise<void> {
    console.log('Checking current translation status...');
    
    const translations = [
      { name: 'ASV', expected: 31000 },
      { name: 'WEB', expected: 31000 }
    ];
    
    for (const trans of translations) {
      const count = await this.storage.getVerseCount(trans.name);
      console.log(`${trans.name}: ${count} verses (expected ~${trans.expected})`);
      
      if (count < trans.expected) {
        console.log(`\nImporting ${trans.name}...`);
        await this.importTranslation(trans.name);
      } else {
        console.log(`${trans.name} appears complete, skipping.`);
      }
    }
  }
}

async function main() {
  const importer = new FinalBibleImporter();
  
  try {
    await importer.importMissingTranslations();
    console.log('\nFinal Bible import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

main();