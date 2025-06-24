/**
 * Bible API Importer
 * Imports ASV and WEB translations using the verified Bible API source
 */

import fetch from 'node-fetch';
import { DatabaseStorage } from './storage.js';

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

class BibleAPIImporter {
  private storage: DatabaseStorage;
  private baseUrl = 'https://bible-api.com';
  
  // All 66 Bible books in correct order
  private readonly books = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1Samuel', '2Samuel', '1Kings', '2Kings',
    '1Chronicles', '2Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'SongofSongs',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
    'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1Corinthians', '2Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1Thessalonians', '2Thessalonians',
    '1Timothy', '2Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1Peter', '2Peter', '1John', '2John', '3John',
    'Jude', 'Revelation'
  ];

  constructor() {
    this.storage = new DatabaseStorage();
  }

  async fetchChapter(translation: string, book: string, chapter: number): Promise<BibleAPIVerse[]> {
    const url = `${this.baseUrl}/${book}+${chapter}?translation=${translation}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SoapBox Bible Import System 1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as BibleAPIResponse;
      return data.verses || [];
      
    } catch (error) {
      console.error(`Failed to fetch ${book} ${chapter} (${translation}):`, error);
      return [];
    }
  }

  async importBook(translation: string, book: string): Promise<{
    book: string;
    chapters: number;
    verses: number;
    errors: string[];
  }> {
    console.log(`📖 Importing ${book} (${translation})...`);
    
    let totalVerses = 0;
    let totalChapters = 0;
    const errors: string[] = [];
    
    // Start with chapter 1 and continue until no verses found
    let chapter = 1;
    let consecutiveFailures = 0;
    
    while (consecutiveFailures < 3) { // Stop after 3 consecutive empty chapters
      const verses = await this.fetchChapter(translation, book, chapter);
      
      if (verses.length === 0) {
        consecutiveFailures++;
        chapter++;
        continue;
      }
      
      consecutiveFailures = 0;
      totalChapters++;
      
      // Import verses to database
      for (const verse of verses) {
        try {
          await this.storage.insertBibleVerse({
            book: verse.book_name,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text.trim(),
            translation: translation.toUpperCase(),
            reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
          });
          totalVerses++;
        } catch (error) {
          errors.push(`${verse.book_name} ${verse.chapter}:${verse.verse} - ${error}`);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      chapter++;
    }
    
    return {
      book,
      chapters: totalChapters,
      verses: totalVerses,
      errors
    };
  }

  async importTranslation(translation: string): Promise<{
    translation: string;
    totalBooks: number;
    totalChapters: number;
    totalVerses: number;
    errors: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    console.log(`🚀 Starting ${translation} translation import...`);
    
    let totalBooks = 0;
    let totalChapters = 0;
    let totalVerses = 0;
    const allErrors: string[] = [];
    
    for (const book of this.books) {
      const result = await this.importBook(translation, book);
      
      if (result.verses > 0) {
        totalBooks++;
        totalChapters += result.chapters;
        totalVerses += result.verses;
      } else {
      }
      
      allErrors.push(...result.errors);
      
      // Progress update every 10 books
      if ((totalBooks % 10) === 0) {
        console.log(`📊 Progress: ${totalBooks}/66 books, ${totalVerses} verses imported`);
      }
    }
    
    const duration = Date.now() - startTime;
    
    return {
      translation: translation.toUpperCase(),
      totalBooks,
      totalChapters,
      totalVerses,
      errors: allErrors,
      duration
    };
  }

  async getTranslationStatus(translation: string): Promise<{
    translation: string;
    verseCount: number;
    isComplete: boolean;
  }> {
    const count = await this.storage.getVerseCount(translation.toUpperCase());
    return {
      translation: translation.toUpperCase(),
      verseCount: count,
      isComplete: count >= 31000 // Minimum expected verses for complete Bible
    };
  }

  async importMissingTranslations(): Promise<void> {
    console.log('🎯 Starting import of missing ASV and WEB translations...\n');
    
    // Check current status
    const asvStatus = await this.getTranslationStatus('ASV');
    const webStatus = await this.getTranslationStatus('WEB');
    
    console.log(`📊 Current Status:`);
    console.log(`   ASV: ${asvStatus.verseCount} verses (${asvStatus.isComplete ? 'Complete' : 'Incomplete'})`);
    console.log(`   WEB: ${webStatus.verseCount} verses (${webStatus.isComplete ? 'Complete' : 'Incomplete'})\n`);
    
    const results = [];
    
    // Import ASV if incomplete
    if (!asvStatus.isComplete) {
      console.log('📖 Importing ASV (American Standard Version)...');
      const asvResult = await this.importTranslation('ASV');
      results.push(asvResult);
    }
    
    // Import WEB if incomplete  
    if (!webStatus.isComplete) {
      console.log('📖 Importing WEB (World English Bible)...');
      const webResult = await this.importTranslation('WEB');
      results.push(webResult);
    }
    
    // Final report
    console.log('\n🎉 Import Summary:');
    for (const result of results) {
      console.log(`\n${result.translation}:`);
      console.log(`  📚 Books: ${result.totalBooks}/66`);
      console.log(`  📄 Chapters: ${result.totalChapters}`);
      console.log(`  📝 Verses: ${result.totalVerses}`);
      console.log(`  ⏱️ Duration: ${Math.round(result.duration / 1000)}s`);
      
      if (result.errors.length > 0 && result.errors.length < 10) {
        console.log(`  First few errors:`);
        result.errors.slice(0, 5).forEach(error => console.log(`    - ${error}`));
      }
    }
    
    // Final verification
    const finalAsvStatus = await this.getTranslationStatus('ASV');
    const finalWebStatus = await this.getTranslationStatus('WEB');
    
    console.log(`\n📊 Final Status:`);
    
    if (finalAsvStatus.isComplete && finalWebStatus.isComplete) {
      console.log('\n🎯 SUCCESS: Both ASV and WEB translations are now complete!');
    }
  }
}

export { BibleAPIImporter };

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new BibleAPIImporter();
  importer.importMissingTranslations()
    .then(() => {
      console.log('\n✨ Bible import completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Bible import failed:', error);
      process.exit(1);
    });
}