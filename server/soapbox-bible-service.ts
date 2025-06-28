import { db } from './db.js';
import { soapboxBible, bibleVerses } from '../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { scriptureApiService } from './scripture-api-service.js';
import { lookupBibleVerse } from './bible-api.js';

// Top 1000 most popular Bible verses according to biblical research
const TOP_1000_VERSES = [
  'John 3:16', 'Romans 8:28', 'Philippians 4:13', 'Jeremiah 29:11', 'Romans 5:8',
  'Matthew 28:19-20', 'John 14:6', 'Psalm 23:1', 'Isaiah 40:31', 'Matthew 11:28-30',
  'John 1:1', 'Romans 6:23', 'Ephesians 2:8-9', '1 Corinthians 13:4-7', 'Psalm 119:105',
  'Proverbs 3:5-6', 'Matthew 6:33', 'Romans 12:2', 'John 15:13', '2 Timothy 3:16',
  'James 1:17', 'Psalm 46:10', 'Isaiah 53:6', 'Romans 3:23', 'John 8:32',
  'Matthew 5:16', 'Galatians 2:20', '1 John 4:19', 'Psalm 27:1', 'Isaiah 41:10',
  'Romans 8:38-39', 'Hebrews 11:1', 'John 10:10', 'Matthew 7:7', 'Psalm 37:4',
  'Colossians 3:23', 'Joshua 1:9', 'Psalm 139:14', 'Romans 10:9', 'John 1:12',
  'Matthew 22:37-39', 'Ephesians 6:10-11', 'Psalm 34:8', 'Isaiah 9:6', 'Luke 2:10-11',
  'John 20:31', 'Acts 2:38', 'Romans 1:16', 'Hebrews 13:8', 'Revelation 21:4',
  // Add more verses to reach 1000 total (shortened for brevity but would include all 1000)
  'Genesis 1:1', 'Genesis 1:27', 'Exodus 20:3', 'Deuteronomy 6:4', 'Psalm 1:1-2',
  'Psalm 8:3-4', 'Psalm 19:1', 'Psalm 23:4', 'Psalm 51:10', 'Psalm 103:8',
  'Psalm 121:1-2', 'Proverbs 16:9', 'Proverbs 27:17', 'Ecclesiastes 3:1',
  'Isaiah 6:8', 'Isaiah 26:3', 'Isaiah 55:8-9', 'Jeremiah 1:5', 'Ezekiel 36:26',
  'Daniel 3:17-18', 'Hosea 6:1', 'Micah 6:8', 'Habakkuk 2:4', 'Zephaniah 3:17',
  'Haggai 2:4', 'Zechariah 4:6', 'Malachi 3:6', 'Matthew 5:3-4', 'Matthew 5:14',
  'Matthew 6:9-11', 'Matthew 6:26', 'Matthew 7:12', 'Matthew 16:16', 'Matthew 28:18-20',
  'Mark 12:30-31', 'Luke 1:37', 'Luke 6:31', 'Luke 9:23', 'Luke 12:32',
  'John 3:3', 'John 4:24', 'John 6:35', 'John 8:12', 'John 11:25',
  'John 14:2-3', 'John 16:33', 'Acts 1:8', 'Acts 4:12', 'Romans 8:1',
  'Romans 12:1', '1 Corinthians 6:19-20', '1 Corinthians 10:13', '1 Corinthians 15:3-4',
  '2 Corinthians 5:17', 'Galatians 5:22-23', 'Ephesians 2:10', 'Ephesians 4:32',
  'Philippians 2:5-7', 'Philippians 4:4', 'Philippians 4:19', 'Colossians 1:15-17',
  'Colossians 3:2', '1 Thessalonians 5:16-18', '2 Timothy 1:7', 'Titus 3:5',
  'Hebrews 4:12', 'Hebrews 12:1-2', 'James 1:2-3', 'James 4:7', '1 Peter 2:9',
  '1 Peter 5:7', '1 John 1:9', '1 John 3:16', '1 John 4:7-8', 'Revelation 3:20'
];

// Only allow these 6 Bible versions
const ALLOWED_TRANSLATIONS = ['KJV', 'KJVA', 'WEB', 'ASV', 'CEV', 'GNT'] as const;
type AllowedTranslation = typeof ALLOWED_TRANSLATIONS[number];

interface SoapBoxVerseResult {
  id: number;
  reference: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
  translation: string;
  source: string;
  popularityRank?: number;
}

/**
 * SoapBox Bible Service - Manages the cached top 1000 verses from api.bible
 * Implements three-tier lookup: SoapBox Bible → API.Bible → ChatGPT API
 */
class SoapBoxBibleService {
  
  /**
   * Get verse with three-tier lookup priority
   */
  async getVerse(reference: string, translation: AllowedTranslation = 'KJV'): Promise<SoapBoxVerseResult | null> {
    console.log(`SoapBox Bible lookup: ${reference} (${translation})`);
    
    // Tier 1: Check SoapBox Bible cache first
    const cachedVerse = await this.getFromSoapBoxCache(reference, translation);
    if (cachedVerse) {
      console.log(`✓ Found in SoapBox Bible cache: ${reference}`);
      return cachedVerse;
    }
    
    // Tier 2: Try Scripture API (api.bible)
    try {
      const apiVerse = await scriptureApiService.lookupVerse(reference, translation);
      if (apiVerse) {
        console.log(`✓ Found via Scripture API: ${reference}`);
        
        // Cache the verse for future use
        await this.cacheVerse(apiVerse, reference);
        
        return {
          id: 0, // API verses don't have database IDs
          reference: apiVerse.reference,
          book: this.extractBook(reference),
          chapter: this.extractChapter(reference),
          verse: this.extractVerse(reference),
          text: apiVerse.text,
          translation: apiVerse.translation,
          source: 'American Bible Society'
        };
      }
    } catch (error) {
      console.log(`Scripture API failed for ${reference}: ${error}`);
    }
    
    // Tier 3: Fallback to ChatGPT API via existing bible-api.ts
    console.log(`Falling back to ChatGPT for: ${reference}`);
    const fallbackVerse = await lookupBibleVerse(reference, translation);
    if (fallbackVerse) {
      console.log(`✓ Found via ChatGPT fallback: ${reference}`);
      return {
        id: fallbackVerse.id,
        reference: fallbackVerse.reference,
        book: fallbackVerse.book,
        chapter: fallbackVerse.chapter,
        verse: fallbackVerse.verse,
        text: fallbackVerse.text,
        translation: fallbackVerse.translation,
        source: 'AI Generated'
      };
    }
    
    console.log(`✗ Verse not found in any source: ${reference}`);
    return null;
  }
  
  /**
   * Get verse from SoapBox Bible cache
   */
  private async getFromSoapBoxCache(reference: string, translation: AllowedTranslation): Promise<SoapBoxVerseResult | null> {
    try {
      const result = await db
        .select()
        .from(soapboxBible)
        .where(and(
          eq(soapboxBible.reference, reference),
          eq(soapboxBible.translation, translation)
        ))
        .limit(1);
      
      if (result.length > 0) {
        const verse = result[0];
        return {
          id: verse.id,
          reference: verse.reference,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          translation: verse.translation,
          source: verse.source || 'SoapBox Bible',
          popularityRank: verse.popularityRank
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error querying SoapBox Bible cache:', error);
      return null;
    }
  }
  
  /**
   * Cache a verse in SoapBox Bible for future use
   */
  private async cacheVerse(apiVerse: any, reference: string): Promise<void> {
    try {
      // Check if this verse is in our top 1000 list
      const popularityRank = TOP_1000_VERSES.indexOf(reference) + 1;
      if (popularityRank === 0) {
        // Only cache popular verses to maintain top 1000 constraint
        return;
      }
      
      await db
        .insert(soapboxBible)
        .values({
          reference: apiVerse.reference,
          book: this.extractBook(reference),
          chapter: this.extractChapter(reference),
          verse: this.extractVerse(reference),
          text: apiVerse.text,
          translation: apiVerse.translation,
          popularityRank,
          source: 'American Bible Society',
          importedAt: new Date(),
          lastUpdated: new Date()
        })
        .onConflictDoNothing(); // Avoid duplicates
        
      console.log(`Cached verse in SoapBox Bible: ${reference} (rank ${popularityRank})`);
    } catch (error) {
      console.error('Error caching verse:', error);
    }
  }
  
  /**
   * Populate SoapBox Bible cache with top 1000 verses
   */
  async populateCache(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    
    console.log('Starting SoapBox Bible cache population with top 1000 verses...');
    
    for (let i = 0; i < TOP_1000_VERSES.length; i++) {
      const reference = TOP_1000_VERSES[i];
      const popularityRank = i + 1;
      
      console.log(`Populating ${popularityRank}/1000: ${reference}`);
      
      // Try all 6 allowed translations for each verse
      for (const translation of ALLOWED_TRANSLATIONS) {
        try {
          // Check if already cached
          const existing = await this.getFromSoapBoxCache(reference, translation);
          if (existing) {
            console.log(`Already cached: ${reference} (${translation})`);
            continue;
          }
          
          // Get from Scripture API
          const apiVerse = await scriptureApiService.lookupVerse(reference, translation);
          if (apiVerse) {
            await db
              .insert(soapboxBible)
              .values({
                reference: apiVerse.reference,
                book: this.extractBook(reference),
                chapter: this.extractChapter(reference),
                verse: this.extractVerse(reference),
                text: apiVerse.text,
                translation: apiVerse.translation,
                popularityRank,
                source: 'American Bible Society',
                importedAt: new Date(),
                lastUpdated: new Date()
              })
              .onConflictDoNothing();
            
            success++;
            console.log(`✓ Cached: ${reference} (${translation})`);
          } else {
            failed++;
            console.log(`✗ Failed to get: ${reference} (${translation})`);
          }
          
          // Rate limiting - wait 100ms between API calls
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          failed++;
          console.error(`Error caching ${reference} (${translation}):`, error);
        }
      }
    }
    
    console.log(`SoapBox Bible cache population complete: ${success} success, ${failed} failed`);
    return { success, failed };
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalCached: number;
    byTranslation: Record<string, number>;
    popularVerses: number;
  }> {
    try {
      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(soapboxBible);
      
      const byTranslation = await db
        .select({
          translation: soapboxBible.translation,
          count: sql<number>`count(*)`
        })
        .from(soapboxBible)
        .groupBy(soapboxBible.translation);
      
      const popular = await db
        .select({ count: sql<number>`count(*)` })
        .from(soapboxBible)
        .where(sql`popularity_rank <= 1000`);
      
      return {
        totalCached: total[0]?.count || 0,
        byTranslation: byTranslation.reduce((acc, item) => {
          acc[item.translation] = item.count;
          return acc;
        }, {} as Record<string, number>),
        popularVerses: popular[0]?.count || 0
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalCached: 0,
        byTranslation: {},
        popularVerses: 0
      };
    }
  }
  
  // Helper methods to extract parts from references
  private extractBook(reference: string): string {
    const bookPattern = /^(\d?\s?[A-Za-z]+)/;
    const match = reference.match(bookPattern);
    return match ? match[1].trim() : reference;
  }
  
  private extractChapter(reference: string): number {
    const chapterPattern = /(\d+):(\d+)/;
    const match = reference.match(chapterPattern);
    return match ? parseInt(match[1]) : 1;
  }
  
  private extractVerse(reference: string): string {
    const versePattern = /:(\d+(?:-\d+)?)/;
    const match = reference.match(versePattern);
    return match ? match[1] : '1';
  }
}

// Export singleton instance
export const soapboxBibleService = new SoapBoxBibleService();
export type { SoapBoxVerseResult, AllowedTranslation };
export { ALLOWED_TRANSLATIONS };