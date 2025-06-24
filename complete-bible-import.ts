/**
 * Complete Bible Import System - ASV and WEB Translations
 * Uses bible-api.com API which successfully returns verse data for missing translations
 * Based on successful testing of alternative Bible sources
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

class CompleteBibleImporter {
  private storage = new DatabaseStorage();
  private baseUrl = 'https://bible-api.com';
  private delay = 1500; // 1.5 seconds between requests
  private maxRetries = 3;

  // All 66 Bible books in order
  private readonly books = [
    // Old Testament
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    // New Testament
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
    '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ];

  // Chapter counts for each book
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

  async fetchChapterWithRetry(translation: string, book: string, chapter: number): Promise<BibleAPIVerse[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Fetching ${book} ${chapter} (attempt ${attempt}/${this.maxRetries})`);
        
        const encodedBook = encodeURIComponent(book.replace(' ', '+'));
        const url = `${this.baseUrl}/${encodedBook}+${chapter}?translation=${translation}`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'SoapBox-Bible-Importer/1.0'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: BibleAPIResponse = await response.json();
        
        if (!data.verses || !Array.isArray(data.verses)) {
          throw new Error('Invalid response format - no verses array');
        }

        console.log(`✅ Successfully fetched ${data.verses.length} verses from ${book} ${chapter}`);
        return data.verses;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`❌ Attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < this.maxRetries) {
          const backoffDelay = this.delay * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
          await this.sleep(backoffDelay);
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  async checkVerseExists(translation: string, book: string, chapter: number, verse: number): Promise<boolean> {
    try {
      const existing = await this.storage.getBibleVerses({
        translation,
        book,
        chapter,
        verse
      });
      return existing.length > 0;
    } catch (error) {
      console.log(`Warning: Could not check existing verse: ${error}`);
      return false;
    }
  }

  async importChapterSafely(translation: string, book: string, chapter: number): Promise<number> {
    try {
      const verses = await this.fetchChapterWithRetry(translation, book, chapter);
      let importedCount = 0;

      for (const verse of verses) {
        try {
          // Check if verse already exists
          const exists = await this.checkVerseExists(translation, book, chapter, verse.verse);
          if (exists) {
            console.log(`Skipping existing verse: ${book} ${chapter}:${verse.verse}`);
            continue;
          }

          // Clean up text
          const cleanText = verse.text.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
          if (!cleanText) {
            console.log(`Skipping empty verse: ${book} ${chapter}:${verse.verse}`);
            continue;
          }

          // Categorize verse content
          const category = this.categorizeVerse(cleanText);

          // Import verse
          await this.storage.importBibleVerse({
            translation: translation.toUpperCase(),
            book: book,
            chapter: chapter,
            verse: verse.verse,
            text: cleanText,
            category: category
          });

          importedCount++;
          console.log(`✅ Imported: ${book} ${chapter}:${verse.verse}`);

        } catch (error) {
          console.error(`❌ Failed to import verse ${book} ${chapter}:${verse.verse}:`, error);
        }
      }

      return importedCount;
    } catch (error) {
      console.error(`❌ Failed to import chapter ${book} ${chapter}:`, error);
      return 0;
    }
  }

  private categorizeVerse(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Define keywords for categorization
    const categories = {
      'Faith': ['faith', 'believe', 'trust', 'faithful'],
      'Hope': ['hope', 'future', 'promise', 'expectation'],
      'Love': ['love', 'beloved', 'charity', 'affection'],
      'Peace': ['peace', 'peaceful', 'rest', 'calm'],
      'Strength': ['strength', 'strong', 'power', 'mighty'],
      'Wisdom': ['wisdom', 'wise', 'understanding', 'knowledge'],
      'Comfort': ['comfort', 'comforter', 'consolation', 'solace'],
      'Forgiveness': ['forgive', 'forgiveness', 'mercy', 'pardon'],
      'Joy': ['joy', 'joyful', 'rejoice', 'glad', 'happiness'],
      'Purpose': ['purpose', 'calling', 'destiny', 'plan'],
      'Grace': ['grace', 'gracious', 'favor', 'blessing'],
      'Worship': ['worship', 'praise', 'glory', 'honor'],
    };

    // Check for category keywords
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return 'Core';
  }

  async importTranslation(translation: string): Promise<void> {
    console.log(`\n🚀 Starting import of ${translation.toUpperCase()} translation`);
    
    let totalImported = 0;
    let totalChapters = 0;

    for (const book of this.books) {
      const chapterCount = this.chapterCounts[book];
      console.log(`\n📖 Processing ${book} (${chapterCount} chapters)`);

      for (let chapter = 1; chapter <= chapterCount; chapter++) {
        try {
          const imported = await this.importChapterSafely(translation, book, chapter);
          totalImported += imported;
          totalChapters++;

          // Progress update
          if (totalChapters % 10 === 0) {
            console.log(`\n📊 Progress: ${totalChapters} chapters processed, ${totalImported} verses imported`);
          }

          // Rate limiting
          await this.sleep(this.delay);

        } catch (error) {
          console.error(`❌ Failed to process ${book} ${chapter}:`, error);
        }
      }
    }

    console.log(`\n✅ ${translation.toUpperCase()} import completed!`);
    console.log(`📊 Final stats: ${totalImported} verses imported from ${totalChapters} chapters`);
  }

  async importMissingTranslations(): Promise<void> {
    console.log('🎯 Starting import of missing ASV and WEB translations');
    
    try {
      // Import ASV (American Standard Version)
      await this.importTranslation('asv');
      
      // Import WEB (World English Bible)
      await this.importTranslation('web');
      
      console.log('\n🎉 All missing translations imported successfully!');
      
      // Check final status
      await this.checkImportStatus();
      
    } catch (error) {
      console.error('❌ Error during import:', error);
      throw error;
    }
  }

  async checkImportStatus(): Promise<void> {
    console.log('\n📊 Checking final import status...');
    
    const translations = ['ASV', 'WEB'];
    
    for (const translation of translations) {
      try {
        const verses = await this.storage.getBibleVerses({ translation });
        console.log(`${translation}: ${verses.length} verses`);
        
        if (verses.length >= 31000) {
          console.log(`✅ ${translation} appears complete (${verses.length} verses)`);
        } else {
          console.log(`⚠️ ${translation} may be incomplete (${verses.length} verses)`);
        }
      } catch (error) {
        console.error(`❌ Could not check ${translation}:`, error);
      }
    }
  }
}

async function main() {
  const importer = new CompleteBibleImporter();
  
  try {
    await importer.importMissingTranslations();
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}