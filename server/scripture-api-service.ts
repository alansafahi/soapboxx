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

  // Bible translation IDs for Scripture API - Limited to 6 public domain/freely available versions
  private translationMap: Record<string, string> = {
    'KJV': 'de4e12af7f28f599-01', // King James Version (public domain)
    'KJVA': 'de4e12af7f28f599-01', // King James Version with Strong's numbering (same as KJV for API)
    'WEB': '9879dbb7cfe39e4d-01', // World English Bible (public domain)
    'ASV': '7142879509583d59-01', // American Standard Version (public domain)
    'CEV': '392a2f6c-9fa4-4f43-9a37-8e5a4c56e1c7', // Contemporary English Version (freely supported)
    'GNT': 'c315fa9f-f842-4a87-9a8e-5d5c2a3e8b2a', // Good News Translation (freely supported)
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
      // Remove explanatory prefixes like "Hebrews 11:2 in the Good News Translation (GNT) is: "
      .replace(/^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?\s+in\s+the\s+[^:]+:\s*/i, '')
      // Remove other common prefixes like "Matthew 5:16 (KJV): " or "John 3:16 - NIV: "
      .replace(/^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?\s*(?:\([^)]+\))?\s*[-:]\s*/i, '')
      // Remove remaining translation prefixes like "NIV: " or "KJV - "
      .replace(/^[A-Z]{2,5}\s*[-:]\s*/i, '')
      // Remove verse numbers with pilcrow (¶) - e.g. "29¶Come unto me"
      .replace(/^\d+[A-Za-z]?¶/, '')
      // Remove verse numbers at start with space (1 By faith, 2 Now faith, etc.)
      .replace(/^\d+[A-Za-z]?\s+/, '')
      // Remove verse numbers at start without space (1By faith, 4By faith, etc.)
      .replace(/^\d+[A-Za-z]?(?=[A-Z])/, '')
      // Remove verse numbers in brackets [1], [2], [2A], etc.
      .replace(/\[\d+[A-Za-z]?\]/g, '')
      // Remove verse numbers in parentheses (1), (2), (2A), etc.
      .replace(/\(\d+[A-Za-z]?\)/g, '')
      // Remove verse numbers with periods 1., 2., 2A., etc.
      .replace(/^\d+[A-Za-z]?\.\s*/, '')
      // Remove standalone pilcrow symbols
      .replace(/¶/g, '')
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

      return null;
    }

    try {
      const parsed = this.parseReference(reference);
      if (!parsed) {

        return null;
      }

      const bibleId = this.translationMap[translation.toUpperCase()] || this.translationMap['NIV'];
      const bookId = this.getBookId(parsed.book);
      

      
      // Construct verse ID for Scripture API
      const verseId = `${bookId}.${parsed.chapter}.${parsed.verse}`;
      const url = `${this.baseUrl}/bibles/${bibleId}/verses/${verseId}`;



      const response = await fetch(url, {
        headers: {
          'api-key': this.apiKey,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {

        return null;
      }

      const data: ScriptureAPIResponse = await response.json();
      
      if (!data.data || !data.data.content) {

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
      return null;
    }
  }

  /**
   * Search verses using Scripture API
   */
  async searchVerses(query: string, translation: string = 'NIV', limit: number = 20): Promise<BibleVerseResult[]> {
    if (!this.apiKey) {

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