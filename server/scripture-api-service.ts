/**
 * American Bible Society Scripture API Integration
 * Provides authentic Bible verses from official sources
 */

interface ScriptureVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  content: string;
  reference: string;
}

interface ScriptureChapter {
  id: string;
  bibleId: string;
  number: string;
  content: string;
  reference: string;
  verseCount: number;
}

interface ScriptureBook {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
}

interface ScriptureBible {
  id: string;
  dblId: string;
  abbreviation: string;
  abbreviationLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  countries: Array<{
    id: string;
    name: string;
    nameLocal: string;
  }>;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  info: string;
  type: string;
  updatedAt: string;
  relatedDbl: string | null;
  audioBibles: any[];
}

interface SearchResult {
  query: string;
  limit: number;
  offset: number;
  total: number;
  verseCount: number;
  verses: ScriptureVerse[];
}

export class ScriptureApiService {
  private readonly baseUrl = 'https://api.scripture.api.bible/v1';
  private readonly apiKey: string;

  // Popular Bible translation mappings to scripture.api.bible IDs
  private readonly translationMap: Record<string, string> = {
    'NIV': 'de4e12af7f28f599-02', // New International Version
    'ESV': 'f421fe250da547b3-01', // English Standard Version
    'NLT': 'de4e12af7f28f599-01', // New Living Translation
    'NASB': 'f421fe250da547b3-02', // New American Standard Bible
    'MSG': 'f421fe250da547b3-03', // The Message
    'AMP': 'f421fe250da547b3-04', // Amplified Bible
    'CSB': 'f421fe250da547b3-05', // Christian Standard Bible
    'HCSB': 'f421fe250da547b3-06', // Holman Christian Standard Bible
    'NKJV': 'f421fe250da547b3-07', // New King James Version
    'NCV': 'f421fe250da547b3-08', // New Century Version
    'NIRV': 'f421fe250da547b3-09', // New International Reader's Version
    'CEV': 'f421fe250da547b3-10', // Contemporary English Version
    'GNT': 'f421fe250da547b3-11', // Good News Translation
    'ICB': 'f421fe250da547b3-12', // International Children's Bible
    'NRSV': 'f421fe250da547b3-13', // New Revised Standard Version
    'RSV': 'f421fe250da547b3-14', // Revised Standard Version
    'KJV': '06125adad2d5898a-01' // King James Version
  };

  constructor() {
    this.apiKey = process.env.SCRIPTURE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[Scripture API] No API key provided - service will not function');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Scripture API key not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Scripture API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  private cleanVerseText(text: string): string {
    if (!text) return text;
    
    // Remove verse numbers at the beginning of the text
    // Pattern matches: digit(s) followed by optional non-letter characters, then a letter
    // Examples: "14Therefore" -> "Therefore", "1 In" -> "In", "2:1 And" -> "And"
    return text.replace(/^\d+[^a-zA-Z]*(?=[a-zA-Z])/, '').trim();
  }

  /**
   * Get available Bible translations
   */
  async getBibles(): Promise<ScriptureBible[]> {
    try {
      return await this.makeRequest('/bibles');
    } catch (error) {
      console.error('[Scripture API] Error fetching Bibles:', error);
      return [];
    }
  }

  /**
   * Get books for a specific Bible translation
   */
  async getBooks(bibleId: string): Promise<ScriptureBook[]> {
    try {
      return await this.makeRequest(`/bibles/${bibleId}/books`);
    } catch (error) {
      console.error('[Scripture API] Error fetching books:', error);
      return [];
    }
  }

  /**
   * Get a specific verse
   */
  async getVerse(bibleId: string, verseId: string): Promise<ScriptureVerse | null> {
    try {
      const verse = await this.makeRequest(`/bibles/${bibleId}/verses/${verseId}`);
      return verse;
    } catch (error) {
      console.error('[Scripture API] Error fetching verse:', error);
      return null;
    }
  }

  /**
   * Get a chapter with all verses
   */
  async getChapter(bibleId: string, chapterId: string): Promise<ScriptureChapter | null> {
    try {
      const chapter = await this.makeRequest(`/bibles/${bibleId}/chapters/${chapterId}`);
      return chapter;
    } catch (error) {
      console.error('[Scripture API] Error fetching chapter:', error);
      return null;
    }
  }

  /**
   * Search for verses containing specific text
   */
  async searchVerses(
    bibleId: string, 
    query: string, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<SearchResult | null> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const searchResult = await this.makeRequest(
        `/bibles/${bibleId}/search?query=${encodedQuery}&limit=${limit}&offset=${offset}`
      );
      return searchResult;
    } catch (error) {
      console.error('[Scripture API] Error searching verses:', error);
      return null;
    }
  }

  /**
   * Parse Bible reference and get Bible ID for translation
   */
  private parseReference(reference: string): { book: string; chapter: number; verse: number } | null {
    // Enhanced regex to handle various reference formats
    const patterns = [
      /^(\d*\s*[A-Za-z]+)\s+(\d+):(\d+)$/,  // "John 3:16" or "1 Kings 8:9"
      /^(\d*\s*[A-Za-z]+)\s+(\d+)\.(\d+)$/,  // "John 3.16"
      /^(\d*[A-Za-z]+)\s*(\d+):(\d+)$/,      // "John3:16"
    ];

    for (const pattern of patterns) {
      const match = reference.trim().match(pattern);
      if (match) {
        const [, book, chapter, verse] = match;
        return {
          book: book.trim(),
          chapter: parseInt(chapter),
          verse: parseInt(verse)
        };
      }
    }

    return null;
  }

  /**
   * Convert book name to scripture.api.bible book ID
   */
  private getBookId(bookName: string): string {
    const bookMappings: Record<string, string> = {
      // Old Testament
      'genesis': 'GEN', 'gen': 'GEN',
      'exodus': 'EXO', 'exo': 'EXO', 'ex': 'EXO',
      'leviticus': 'LEV', 'lev': 'LEV',
      'numbers': 'NUM', 'num': 'NUM',
      'deuteronomy': 'DEU', 'deu': 'DEU', 'deut': 'DEU',
      'joshua': 'JOS', 'jos': 'JOS', 'josh': 'JOS',
      'judges': 'JDG', 'jdg': 'JDG', 'judg': 'JDG',
      'ruth': 'RUT', 'rut': 'RUT',
      '1 samuel': '1SA', '1sa': '1SA', '1 sam': '1SA',
      '2 samuel': '2SA', '2sa': '2SA', '2 sam': '2SA',
      '1 kings': '1KI', '1ki': '1KI', '1 kin': '1KI',
      '2 kings': '2KI', '2ki': '2KI', '2 kin': '2KI',
      '1 chronicles': '1CH', '1ch': '1CH', '1 chr': '1CH',
      '2 chronicles': '2CH', '2ch': '2CH', '2 chr': '2CH',
      'ezra': 'EZR', 'ezr': 'EZR',
      'nehemiah': 'NEH', 'neh': 'NEH',
      'esther': 'EST', 'est': 'EST',
      'job': 'JOB',
      'psalms': 'PSA', 'psa': 'PSA', 'ps': 'PSA', 'psalm': 'PSA',
      'proverbs': 'PRO', 'pro': 'PRO', 'prov': 'PRO',
      'ecclesiastes': 'ECC', 'ecc': 'ECC', 'eccl': 'ECC',
      'song of solomon': 'SNG', 'sng': 'SNG', 'song': 'SNG',
      'isaiah': 'ISA', 'isa': 'ISA',
      'jeremiah': 'JER', 'jer': 'JER',
      'lamentations': 'LAM', 'lam': 'LAM',
      'ezekiel': 'EZK', 'ezk': 'EZK', 'eze': 'EZK',
      'daniel': 'DAN', 'dan': 'DAN',
      'hosea': 'HOS', 'hos': 'HOS',
      'joel': 'JOL', 'jol': 'JOL',
      'amos': 'AMO', 'amo': 'AMO',
      'obadiah': 'OBA', 'oba': 'OBA', 'obad': 'OBA',
      'jonah': 'JON', 'jon': 'JON',
      'micah': 'MIC', 'mic': 'MIC',
      'nahum': 'NAM', 'nam': 'NAM', 'nah': 'NAM',
      'habakkuk': 'HAB', 'hab': 'HAB',
      'zephaniah': 'ZEP', 'zep': 'ZEP', 'zeph': 'ZEP',
      'haggai': 'HAG', 'hag': 'HAG',
      'zechariah': 'ZEC', 'zec': 'ZEC', 'zech': 'ZEC',
      'malachi': 'MAL', 'mal': 'MAL',

      // New Testament
      'matthew': 'MAT', 'mat': 'MAT', 'matt': 'MAT', 'mt': 'MAT',
      'mark': 'MRK', 'mrk': 'MRK', 'mk': 'MRK',
      'luke': 'LUK', 'luk': 'LUK', 'lk': 'LUK',
      'john': 'JHN', 'jhn': 'JHN', 'jn': 'JHN',
      'acts': 'ACT', 'act': 'ACT',
      'romans': 'ROM', 'rom': 'ROM',
      '1 corinthians': '1CO', '1co': '1CO', '1 cor': '1CO',
      '2 corinthians': '2CO', '2co': '2CO', '2 cor': '2CO',
      'galatians': 'GAL', 'gal': 'GAL',
      'ephesians': 'EPH', 'eph': 'EPH',
      'philippians': 'PHP', 'php': 'PHP', 'phil': 'PHP',
      'colossians': 'COL', 'col': 'COL',
      '1 thessalonians': '1TH', '1th': '1TH', '1 thess': '1TH',
      '2 thessalonians': '2TH', '2th': '2TH', '2 thess': '2TH',
      '1 timothy': '1TI', '1ti': '1TI', '1 tim': '1TI',
      '2 timothy': '2TI', '2ti': '2TI', '2 tim': '2TI',
      'titus': 'TIT', 'tit': 'TIT',
      'philemon': 'PHM', 'phm': 'PHM', 'phlm': 'PHM',
      'hebrews': 'HEB', 'heb': 'HEB',
      'james': 'JAS', 'jas': 'JAS',
      '1 peter': '1PE', '1pe': '1PE', '1 pet': '1PE',
      '2 peter': '2PE', '2pe': '2PE', '2 pet': '2PE',
      '1 john': '1JN', '1jn': '1JN', '1 jn': '1JN',
      '2 john': '2JN', '2jn': '2JN', '2 jn': '2JN',
      '3 john': '3JN', '3jn': '3JN', '3 jn': '3JN',
      'jude': 'JUD', 'jud': 'JUD',
      'revelation': 'REV', 'rev': 'REV', 'revelations': 'REV'
    };

    const normalized = bookName.toLowerCase().trim();
    return bookMappings[normalized] || bookName.toUpperCase();
  }

  /**
   * Look up a specific Bible verse by reference
   */
  async lookupVerse(reference: string, translation: string = 'NIV'): Promise<{
    reference: string;
    text: string;
    version: string;
    source: string;
  } | null> {
    try {
      // Get Bible ID for translation
      const bibleId = this.translationMap[translation.toUpperCase()] || this.translationMap['NIV'];
      
      // Parse the reference
      const parsed = this.parseReference(reference);
      if (!parsed) {
        console.error('[Scripture API] Invalid reference format:', reference);
        return null;
      }

      // Get book ID
      const bookId = this.getBookId(parsed.book);
      
      // Construct verse ID (format: BOOK.CHAPTER.VERSE)
      const verseId = `${bookId}.${parsed.chapter}.${parsed.verse}`;
      
      console.log(`[Scripture API] Looking up ${reference} -> ${verseId} in ${translation} (${bibleId})`);
      
      const verse = await this.getVerse(bibleId, verseId);
      
      if (verse) {
        // Clean up the content (remove HTML tags, verse numbers, and extra whitespace)
        let cleanText = verse.content
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ')    // Normalize whitespace
          .trim();
        
        // Remove verse numbers from the beginning of the text
        cleanText = this.cleanVerseText(cleanText);

        return {
          reference: verse.reference,
          text: cleanText,
          version: translation,
          source: 'American Bible Society'
        };
      }

      return null;
    } catch (error) {
      console.error('[Scripture API] Error looking up verse:', error);
      return null;
    }
  }

  /**
   * Search verses by query text
   */
  async searchVersesByText(
    query: string, 
    translation: string = 'NIV', 
    limit: number = 20
  ): Promise<Array<{
    reference: string;
    text: string;
    version: string;
    source: string;
  }>> {
    try {
      const bibleId = this.translationMap[translation.toUpperCase()] || this.translationMap['NIV'];
      
      console.log(`[Scripture API] Searching for "${query}" in ${translation} (${bibleId})`);
      
      const searchResult = await this.searchVerses(bibleId, query, limit);
      
      if (searchResult && searchResult.verses) {
        return searchResult.verses.map(verse => {
          // Clean up the content (remove HTML tags, verse numbers, and extra whitespace)
          let cleanText = verse.content
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ')    // Normalize whitespace
            .trim();
          
          // Remove verse numbers from the beginning of the text
          cleanText = this.cleanVerseText(cleanText);

          return {
            reference: verse.reference,
            text: cleanText,
            version: translation,
            source: 'American Bible Society'
          };
        });
      }

      return [];
    } catch (error) {
      console.error('[Scripture API] Error searching verses:', error);
      return [];
    }
  }

  /**
   * Get available translations
   */
  getAvailableTranslations(): Array<{ code: string; name: string }> {
    return [
      { code: 'NIV', name: 'New International Version' },
      { code: 'ESV', name: 'English Standard Version' },
      { code: 'NLT', name: 'New Living Translation' },
      { code: 'NASB', name: 'New American Standard Bible' },
      { code: 'MSG', name: 'The Message' },
      { code: 'AMP', name: 'Amplified Bible' },
      { code: 'CSB', name: 'Christian Standard Bible' },
      { code: 'HCSB', name: 'Holman Christian Standard Bible' },
      { code: 'NKJV', name: 'New King James Version' },
      { code: 'KJV', name: 'King James Version' },
      { code: 'NCV', name: 'New Century Version' },
      { code: 'NIRV', name: 'New International Reader\'s Version' },
      { code: 'CEV', name: 'Contemporary English Version' },
      { code: 'GNT', name: 'Good News Translation' },
      { code: 'ICB', name: 'International Children\'s Bible' },
      { code: 'NRSV', name: 'New Revised Standard Version' },
      { code: 'RSV', name: 'Revised Standard Version' }
    ];
  }
}

export const scriptureApiService = new ScriptureApiService();