/**
 * American Bible Society Scripture API Integration Service
 * Provides authentic Bible verses from official sources with clean text formatting
 */

import { DatabaseStorage } from './storage.js';

export interface ScriptureAPIVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  verseStart: number;
  verseEnd?: number;
  content: string;
  reference: string;
}

export interface ScriptureAPIResponse {
  data: {
    id: string;
    orgId: string;
    content: string;
    reference: string;
    verseCount: number;
    copyright: string;
  };
}

export interface BibleVerseResult {
  reference: string;
  text: string;
  version: string;
  source: string;
}

export class ScriptureAPIService {
  private apiKey: string;
  private baseUrl = 'https://api.scripture.api.bible/v1';
  private storage: DatabaseStorage;

  // Bible translation IDs for Scripture API
  private translationMap: Record<string, string> = {
    'NIV': 'de4e12af7f28f599-02', // New International Version
    'ESV': '59dcc7335de4b402-01', // English Standard Version  
    'NLT': '13c3066b-53c1-4ec5-8b28-3634e2f3a164', // New Living Translation
    'NASB': '68e8b8273301c819-01', // New American Standard Bible
    'KJV': 'de4e12af7f28f599-01', // King James Version
    'CSB': '93b0cfce-70a3-4ba3-85b8-e8d5ff1d7c4d', // Christian Standard Bible
    'NET': '06125adad2d5898a-01', // New English Translation
    'AMP': '65eec8e0b60e656b-01', // Amplified Bible
    'MSG': '13c3066b-53c1-4ec5-8b28-3634e2f3a164', // The Message (fallback to NLT)
    'RSV': 'dc84fb8a-8fd9-411c-b5e5-b6859ce36ae5', // Revised Standard Version
    'NRSV': '81b5726c-8b7e-4de6-9ca9-eb3e7b0a1de7', // New Revised Standard Version
    'ASV': '7142879509583d59-01', // American Standard Version
    'WEB': '9879dbb7cfe39e4d-01', // World English Bible
  };

  constructor() {
    this.apiKey = process.env.SCRIPTURE_API_KEY || '';
    this.storage = new DatabaseStorage();
  }

  /**
   * Clean verse text by removing HTML tags, embedded verse numbers and formatting
   */
  private cleanVerseText(text: string): string {
    if (!text) return '';
    
    return text
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Remove verse numbers at start (1, 2, 3, 2A, 2B etc.)
      .replace(/^\d+[A-Za-z]?\s+/, '')
      // Remove verse numbers in brackets [1], [2], [2A], etc.
      .replace(/\[\d+[A-Za-z]?\]/g, '')
      // Remove verse numbers in parentheses (1), (2), (2A), etc.
      .replace(/\(\d+[A-Za-z]?\)/g, '')
      // Remove verse numbers with periods 1., 2., 2A., etc.
      .replace(/^\d+[A-Za-z]?\.\s+/, '')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Parse Bible reference into components
   */
  private parseReference(reference: string): { book: string; chapter: number; verse: number; endVerse?: number } | null {
    // Handle references like "John 3:16", "Romans 12:1-2", "1 Corinthians 13:4"
    const match = reference.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/);
    if (!match) return null;

    return {
      book: match[1].trim(),
      chapter: parseInt(match[2]),
      verse: parseInt(match[3]),
      endVerse: match[4] ? parseInt(match[4]) : undefined
    };
  }

  /**
   * Convert book name to Scripture API book ID
   */
  private getBookId(bookName: string): string {
    const bookMap: Record<string, string> = {
      // Old Testament
      'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
      'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
      '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
      'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA',
      'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
      'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS',
      'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC',
      'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC',
      'Malachi': 'MAL',
      
      // New Testament  
      'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
      'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
      'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH',
      '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT',
      'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
      '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
    };

    return bookMap[bookName] || bookName.toUpperCase();
  }

  /**
   * Fetch verse from Scripture API
   */
  async fetchVerseFromAPI(reference: string, translation: string = 'NIV'): Promise<BibleVerseResult | null> {
    if (!this.apiKey) {
      console.log('Scripture API key not available, falling back to local database');
      return null;
    }

    try {
      const parsed = this.parseReference(reference);
      if (!parsed) {
        console.log(`Invalid reference format: ${reference}`);
        return null;
      }

      const bibleId = this.translationMap[translation.toUpperCase()] || this.translationMap['NIV'];
      const bookId = this.getBookId(parsed.book);
      
      console.log(`Version selection debug: translation='${translation}', mapped to bibleId='${bibleId}'`);
      
      // Construct verse ID for Scripture API
      const verseId = `${bookId}.${parsed.chapter}.${parsed.verse}`;
      const url = `${this.baseUrl}/bibles/${bibleId}/verses/${verseId}`;

      console.log(`Fetching from Scripture API: ${url}`);

      const response = await fetch(url, {
        headers: {
          'api-key': this.apiKey,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`Scripture API error: ${response.status} - ${response.statusText}`);
        return null;
      }

      const data: ScriptureAPIResponse = await response.json();
      
      if (!data.data || !data.data.content) {
        console.log('No content received from Scripture API');
        return null;
      }

      const cleanText = this.cleanVerseText(data.data.content);

      return {
        reference: data.data.reference || reference,
        text: cleanText,
        version: translation.toUpperCase(),
        source: 'American Bible Society'
      };

    } catch (error) {
      console.error('Scripture API error:', error);
      return null;
    }
  }

  /**
   * Search verses using Scripture API
   */
  async searchVerses(query: string, translation: string = 'NIV', limit: number = 20): Promise<BibleVerseResult[]> {
    if (!this.apiKey) {
      console.log('Scripture API key not available for search');
      return [];
    }

    try {
      const bibleId = this.translationMap[translation.toUpperCase()] || this.translationMap['NIV'];
      const url = `${this.baseUrl}/bibles/${bibleId}/search`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
          'accept': 'application/json'
        },
        // Add query parameters
      });

      if (!response.ok) {
        console.log(`Scripture API search error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.data || !data.data.verses) {
        return [];
      }

      return data.data.verses.slice(0, limit).map((verse: any) => ({
        reference: verse.reference,
        text: this.cleanVerseText(verse.content),
        version: translation.toUpperCase(),
        source: 'American Bible Society'
      }));

    } catch (error) {
      console.error('Scripture API search error:', error);
      return [];
    }
  }

  /**
   * Get random verse from Scripture API
   */
  async getRandomVerse(translation: string = 'NIV'): Promise<BibleVerseResult | null> {
    // For now, return a popular verse since Scripture API doesn't have random endpoint
    const popularVerses = [
      'John 3:16', 'Romans 8:28', 'Philippians 4:13', 'Jeremiah 29:11', 
      'Psalm 23:1', 'Isaiah 41:10', 'Matthew 11:28', 'Romans 10:9'
    ];
    
    const randomReference = popularVerses[Math.floor(Math.random() * popularVerses.length)];
    return this.fetchVerseFromAPI(randomReference, translation);
  }

  /**
   * Legacy method name for compatibility with existing routes
   */
  async lookupVerse(reference: string, translation: string = 'NIV'): Promise<BibleVerseResult | null> {
    return this.fetchVerseFromAPI(reference, translation);
  }

  /**
   * Legacy method name for compatibility with existing routes
   */
  async searchVersesByText(query: string, translation: string = 'NIV', limit: number = 20): Promise<BibleVerseResult[]> {
    return this.searchVerses(query, translation, limit);
  }

  /**
   * Get available translations from Scripture API
   */
  getAvailableTranslations(): string[] {
    return Object.keys(this.translationMap);
  }
}

export const scriptureApiService = new ScriptureAPIService();