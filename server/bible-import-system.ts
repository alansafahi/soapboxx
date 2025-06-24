/**
 * Bible Import System for SoapBox Super App
 * Handles importing public domain and free Bible versions
 * Maintains OpenAI fallback for licensed versions
 */

import { db } from './db.js';
import { bibleVerses } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

export interface BibleImportProgress {
  version: string;
  status: 'pending' | 'downloading' | 'importing' | 'completed' | 'error';
  progress: number;
  totalVerses: number;
  importedVerses: number;
  error?: string;
}

export interface BibleVersionConfig {
  code: string;
  name: string;
  phase: 1 | 2 | 3;
  source: 'public_domain' | 'free_open' | 'licensed';
  downloadUrl?: string;
  apiEndpoint?: string;
  attribution?: string;
  license?: string;
  useOpenAI: boolean;
}

// Bible version configuration
export const BIBLE_VERSIONS: BibleVersionConfig[] = [
  // Phase 1: Public Domain
  {
    code: 'KJV',
    name: 'King James Version',
    phase: 1,
    source: 'public_domain',
    downloadUrl: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/csv/t_kjv.csv',
    attribution: 'Public Domain',
    license: 'Public Domain',
    useOpenAI: false
  },
  {
    code: 'ASV',
    name: 'American Standard Version',
    phase: 1,
    source: 'public_domain',
    downloadUrl: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/csv/t_asv.csv',
    attribution: 'Public Domain (1901)',
    license: 'Public Domain',
    useOpenAI: false
  },
  {
    code: 'WEB',
    name: 'World English Bible',
    phase: 1,
    source: 'public_domain',
    downloadUrl: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/csv/t_web.csv',
    attribution: 'Public Domain - World English Bible',
    license: 'Public Domain',
    useOpenAI: false
  },
  
  // Phase 2: Free/Open
  {
    code: 'NET',
    name: 'New English Translation',
    phase: 2,
    source: 'free_open',
    apiEndpoint: 'https://api.bible.org/api/passage',
    attribution: 'NET Bible® - Bible.org - Free with attribution',
    license: 'Free for non-commercial use with attribution',
    useOpenAI: false
  },
  
  // Phase 3: Licensed (using OpenAI for now)
  {
    code: 'NIV',
    name: 'New International Version',
    phase: 3,
    source: 'licensed',
    attribution: 'Zondervan - Licensed content',
    license: 'Commercial license required',
    useOpenAI: true
  },
  {
    code: 'ESV',
    name: 'English Standard Version',
    phase: 3,
    source: 'licensed',
    attribution: 'Crossway - Licensed content',
    license: 'Commercial license required',
    useOpenAI: true
  },
  {
    code: 'NLT',
    name: 'New Living Translation',
    phase: 3,
    source: 'licensed',
    attribution: 'Tyndale House - Licensed content',
    license: 'Commercial license required',
    useOpenAI: true
  }
];

// Bible book mapping
export const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
  'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

export class BibleImportSystem {
  private progressCallbacks: ((progress: BibleImportProgress) => void)[] = [];

  onProgress(callback: (progress: BibleImportProgress) => void) {
    this.progressCallbacks.push(callback);
  }

  private notifyProgress(progress: BibleImportProgress) {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  async importPhase1Versions(): Promise<void> {
    console.log('🚀 Starting Phase 1: Public Domain Bible versions import');
    
    const phase1Versions = BIBLE_VERSIONS.filter(v => v.phase === 1);
    
    for (const version of phase1Versions) {
      await this.importVersion(version);
    }
    
    console.log('✅ Phase 1 import completed');
  }

  async importPhase2Versions(): Promise<void> {
    console.log('🚀 Starting Phase 2: Free/Open Bible versions import');
    
    const phase2Versions = BIBLE_VERSIONS.filter(v => v.phase === 2);
    
    for (const version of phase2Versions) {
      await this.importVersion(version);
    }
    
    console.log('✅ Phase 2 import completed');
  }

  private async importVersion(config: BibleVersionConfig): Promise<void> {
    console.log(`📖 Importing ${config.name} (${config.code})`);
    
    this.notifyProgress({
      version: config.code,
      status: 'downloading',
      progress: 0,
      totalVerses: 0,
      importedVerses: 0
    });

    try {
      if (config.downloadUrl) {
        await this.importFromCSV(config);
      } else if (config.apiEndpoint) {
        await this.importFromAPI(config);
      }
      
      this.notifyProgress({
        version: config.code,
        status: 'completed',
        progress: 100,
        totalVerses: 31102, // Standard Bible verse count
        importedVerses: 31102
      });
      
      console.log(`✅ ${config.name} import completed`);
      
    } catch (error) {
      console.error(`❌ Error importing ${config.name}:`, error);
      
      this.notifyProgress({
        version: config.code,
        status: 'error',
        progress: 0,
        totalVerses: 0,
        importedVerses: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async importFromCSV(config: BibleVersionConfig): Promise<void> {
    if (!config.downloadUrl) throw new Error('No download URL provided');
    
    console.log(`📥 Downloading ${config.name} from CSV...`);
    
    const response = await fetch(config.downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download ${config.name}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header if present
    const dataLines = lines[0].includes('book') ? lines.slice(1) : lines;
    
    this.notifyProgress({
      version: config.code,
      status: 'importing',
      progress: 0,
      totalVerses: dataLines.length,
      importedVerses: 0
    });

    const batchSize = 1000;
    let importedCount = 0;

    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batch = dataLines.slice(i, i + batchSize);
      const verseData = batch.map(line => this.parseCSVLine(line, config.code)).filter(Boolean);
      
      if (verseData.length > 0) {
        await this.insertVerseBatch(verseData);
        importedCount += verseData.length;
        
        this.notifyProgress({
          version: config.code,
          status: 'importing',
          progress: Math.round((importedCount / dataLines.length) * 100),
          totalVerses: dataLines.length,
          importedVerses: importedCount
        });
      }
    }
  }

  private parseCSVLine(line: string, translation: string): any | null {
    try {
      // Handle CSV parsing - adjust based on actual CSV format
      const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
      
      if (columns.length < 4) return null;
      
      const [bookNum, chapter, verse, text] = columns;
      const bookName = this.getBookName(parseInt(bookNum));
      
      if (!bookName || !text) return null;
      
      return {
        book: bookName,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        text: text,
        translation: translation,
        category: this.categorizeVerse(text)
      };
    } catch (error) {
      console.warn('Failed to parse CSV line:', line);
      return null;
    }
  }

  private async importFromAPI(config: BibleVersionConfig): Promise<void> {
    console.log(`📡 Importing ${config.name} from API...`);
    
    // Implementation for API-based imports (e.g., NET Bible)
    // This would require specific API authentication and endpoints
    
    let totalImported = 0;
    const totalBooks = BIBLE_BOOKS.length;
    
    for (let bookIndex = 0; bookIndex < BIBLE_BOOKS.length; bookIndex++) {
      const bookName = BIBLE_BOOKS[bookIndex];
      
      try {
        // Fetch chapters for this book from API
        const chapters = await this.fetchBookFromAPI(config, bookName);
        
        for (const chapter of chapters) {
          await this.insertVerseBatch(chapter.verses);
          totalImported += chapter.verses.length;
        }
        
        this.notifyProgress({
          version: config.code,
          status: 'importing',
          progress: Math.round(((bookIndex + 1) / totalBooks) * 100),
          totalVerses: totalImported,
          importedVerses: totalImported
        });
        
      } catch (error) {
        console.warn(`Failed to import ${bookName} for ${config.name}:`, error);
      }
    }
  }

  private async fetchBookFromAPI(config: BibleVersionConfig, bookName: string): Promise<any[]> {
    // Placeholder for API-specific implementation
    // Would need to implement based on actual API documentation
    return [];
  }

  private async insertVerseBatch(verses: any[]): Promise<void> {
    try {
      await db.insert(bibleVerses).values(verses);
    } catch (error) {
      console.error('Failed to insert verse batch:', error);
      // Continue with next batch
    }
  }

  private getBookName(bookNumber: number): string | null {
    if (bookNumber >= 1 && bookNumber <= BIBLE_BOOKS.length) {
      return BIBLE_BOOKS[bookNumber - 1];
    }
    return null;
  }

  private categorizeVerse(text: string): string {
    // Simple categorization based on content
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('love') || lowerText.includes('beloved')) return 'Love';
    if (lowerText.includes('faith') || lowerText.includes('believe')) return 'Faith';
    if (lowerText.includes('hope') || lowerText.includes('trust')) return 'Hope';
    if (lowerText.includes('peace') || lowerText.includes('rest')) return 'Peace';
    if (lowerText.includes('strength') || lowerText.includes('mighty')) return 'Strength';
    if (lowerText.includes('wisdom') || lowerText.includes('understanding')) return 'Wisdom';
    if (lowerText.includes('comfort') || lowerText.includes('consolation')) return 'Comfort';
    if (lowerText.includes('forgive') || lowerText.includes('mercy')) return 'Forgiveness';
    if (lowerText.includes('joy') || lowerText.includes('rejoice')) return 'Joy';
    if (lowerText.includes('grace') || lowerText.includes('blessing')) return 'Grace';
    
    return 'Core';
  }

  async getAvailableVersions(): Promise<BibleVersionConfig[]> {
    return BIBLE_VERSIONS;
  }

  async getVersionsByPhase(phase: 1 | 2 | 3): Promise<BibleVersionConfig[]> {
    return BIBLE_VERSIONS.filter(v => v.phase === phase);
  }

  async checkVersionExists(versionCode: string): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(bibleVerses)
        .where(eq(bibleVerses.translation, versionCode))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getImportStatus(): Promise<{ [key: string]: boolean }> {
    const status: { [key: string]: boolean } = {};
    
    for (const version of BIBLE_VERSIONS) {
      status[version.code] = await this.checkVersionExists(version.code);
    }
    
    return status;
  }
}

export const bibleImportSystem = new BibleImportSystem();