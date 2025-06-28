import { db } from './db';
import { bibleVerses } from '@shared/schema';
import { eq, and, like, ilike, or, sql } from 'drizzle-orm';
import OpenAI from "openai";
import { scriptureApiService } from "./scripture-api-service.js";

// Basic Bible versions configuration for OpenAI fallback
const BIBLE_VERSIONS = [
  { code: 'NIV', name: 'New International Version', phase: 3, useOpenAI: true },
  { code: 'ESV', name: 'English Standard Version', phase: 3, useOpenAI: true },
  { code: 'NLT', name: 'New Living Translation', phase: 3, useOpenAI: true },
  { code: 'NASB', name: 'New American Standard Bible', phase: 3, useOpenAI: true },
  { code: 'KJV', name: 'King James Version', phase: 1, useOpenAI: false },
  { code: 'ASV', name: 'American Standard Version', phase: 1, useOpenAI: false },
  { code: 'WEB', name: 'World English Bible', phase: 1, useOpenAI: false }
];

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Clean verse text by removing HTML tags, embedded verse numbers and formatting
 */
function cleanVerseText(text: string): string {
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
    // Remove verse numbers at start (1, 2, 3, etc.)
    .replace(/^\d+\s+/, '')
    // Remove verse numbers in brackets [1], [2], etc.
    .replace(/\[\d+\]/g, '')
    // Remove verse numbers in parentheses (1), (2), etc.
    .replace(/\(\d+\)/g, '')
    // Remove verse numbers with periods 1., 2., etc.
    .replace(/^\d+\.\s+/, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
}

// OpenAI fallback for missing verses
async function fetchVerseFromOpenAI(reference: string, version: string = 'NIV'): Promise<BibleVerseResponse | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('[Bible AI] OpenAI API key not available, skipping fallback');
      return null;
    }

    console.log(`[Bible AI] Fetching ${reference} (${version}) from OpenAI as fallback`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a Biblical scholar. Provide the exact, authentic Bible verse text for the requested reference and translation. Return only the verse text without commentary or additional information. Be precise and accurate.`
        },
        {
          role: "user", 
          content: `Please provide the exact text of ${reference} from the ${version} translation of the Bible.`
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    });

    const verseText = response.choices[0]?.message?.content?.trim();
    
    if (verseText && verseText.length > 10) {
      console.log(`[Bible AI] Successfully retrieved ${reference} from OpenAI`);
      return {
        reference: reference,
        text: cleanVerseText(verseText),
        version: version
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Bible AI] Error fetching verse from OpenAI:', error);
    return null;
  }
}

interface BibleVerseResponse {
  reference: string;
  text: string;
  version: string;
  source?: string;
}



// Database-first Bible verse lookup with zero external dependencies
async function lookupVerseFromDatabase(reference: string, version: string = 'NIV'): Promise<BibleVerseResponse | null> {
  try {
    console.log(`[Bible DB] Looking up "${reference}" in ${version} translation`);
    
    // Clean and normalize the reference
    const cleanRef = reference.trim();
    const upperVersion = version.toUpperCase();
    
    // First try exact reference match
    const exactMatch = await db
      .select()
      .from(bibleVerses)
      .where(
        and(
          eq(bibleVerses.reference, cleanRef),
          eq(bibleVerses.translation, upperVersion),
          eq(bibleVerses.isActive, true)
        )
      )
      .limit(1);

    if (exactMatch.length > 0) {
      const verse = exactMatch[0];
      console.log(`[Bible DB] Found exact match: ${verse.reference} (${verse.translation})`);
      
      // Check if the text is a placeholder and needs replacement
      const isPlaceholder = verse.text && (
        verse.text.includes('Scripture according to') ||
        verse.text.includes('GOD\'s Word according to') ||
        verse.text.includes('GOD\'s Message according to') ||
        verse.text.includes('Jesus said to them as recorded in') ||
        verse.text.includes('In those days it happened as recorded in') ||
        verse.text.includes('The LORD spoke as written in') ||
        verse.text.includes('As it is written in') ||
        verse.text.length < 20
      );
      
      if (isPlaceholder) {
        console.log(`[Bible DB] Placeholder detected for ${verse.reference}, fetching authentic text from OpenAI`);
        const authenticVerse = await fetchVerseFromOpenAI(cleanRef, upperVersion);
        if (authenticVerse) {
          // Update database with authentic verse
          await db
            .update(bibleVerses)
            .set({ 
              text: authenticVerse.text,
              updatedAt: new Date()
            })
            .where(eq(bibleVerses.id, verse.id));
          
          console.log(`[Bible DB] Updated ${verse.reference} with authentic text`);
          return authenticVerse;
        }
      }
      
      return {
        reference: verse.reference,
        text: cleanVerseText(verse.text || ''),
        version: verse.translation || ''
      };
    }

    // Try flexible matching with different reference formats
    const referenceVariations = generateReferenceVariations(cleanRef);
    
    for (const refVariation of referenceVariations) {
      const flexibleMatch = await db
        .select()
        .from(bibleVerses)
        .where(
          and(
            or(
              eq(bibleVerses.reference, refVariation),
              ilike(bibleVerses.reference, `${refVariation}%`)
            ),
            eq(bibleVerses.translation, upperVersion),
            eq(bibleVerses.isActive, true)
          )
        )
        .limit(1);

      if (flexibleMatch.length > 0) {
        const verse = flexibleMatch[0];
        console.log(`[Bible DB] Found flexible match: ${verse.reference} (${verse.translation})`);
        return {
          reference: verse.reference,
          text: cleanVerseText(verse.text || ''),
          version: verse.translation
        };
      }
    }

    // If requested version not found, try fallback to NIV
    if (upperVersion !== 'NIV') {
      console.log(`[Bible DB] ${upperVersion} not found, trying NIV fallback`);
      return await lookupVerseFromDatabase(reference, 'NIV');
    }

    console.log(`[Bible DB] No verse found for "${reference}" in any available translation`);
    
    // Try OpenAI fallback for authentic scripture
    const aiResult = await fetchVerseFromOpenAI(reference, version);
    if (aiResult) {
      console.log(`[Bible DB] Retrieved ${reference} from OpenAI fallback`);
      return aiResult;
    }
    
    return null;
  } catch (error) {
    console.error('[Bible DB] Database lookup error:', error);
    
    // Try OpenAI fallback when database fails
    try {
      const aiResult = await fetchVerseFromOpenAI(reference, version);
      if (aiResult) {
        console.log(`[Bible DB] Retrieved ${reference} from OpenAI fallback after DB error`);
        return aiResult;
      }
    } catch (aiError) {
      console.error('[Bible AI] Fallback error:', aiError);
    }
    
    return null;
  }
}

// Generate reference variations for flexible matching
function generateReferenceVariations(reference: string): string[] {
  const variations = [reference];
  
  // Handle book name variations
  const bookAbbreviations: Record<string, string[]> = {
    'Gen': ['Genesis'],
    'Genesis': ['Gen'],
    'Exod': ['Exodus', 'Ex'],
    'Exodus': ['Exod', 'Ex'],
    'Ps': ['Psalm', 'Psalms'],
    'Psalm': ['Ps', 'Psalms'],
    'Psalms': ['Ps', 'Psalm'],
    'Matt': ['Matthew', 'Mt'],
    'Matthew': ['Matt', 'Mt'],
    'John': ['Jn', 'Jhn'],
    'Rom': ['Romans', 'Rm'],
    'Romans': ['Rom', 'Rm']
  };

  const referenceWords = reference.split(' ');
  if (referenceWords.length > 0) {
    const firstWord = referenceWords[0];
    const alternatives = bookAbbreviations[firstWord];
    
    if (alternatives) {
      for (const alt of alternatives) {
        const newRef = [alt, ...referenceWords.slice(1)].join(' ');
        variations.push(newRef);
      }
    }
  }

  return Array.from(new Set(variations));
}

// Main Bible lookup function - Scripture API integration with fallbacks
export async function lookupBibleVerse(reference: string, preferredVersion: string = 'NIV'): Promise<BibleVerseResponse | null> {
  try {
    console.log(`[Bible API] Looking up ${reference} in ${preferredVersion}`);
    
    // STEP 1: Try Scripture API first (American Bible Society - authentic source)
    try {
      const scriptureResult = await scriptureApiService.fetchVerseFromAPI(reference, preferredVersion);
      if (scriptureResult) {
        console.log(`[Scripture API] ✅ Found ${reference} from American Bible Society`);
        return scriptureResult;
      }
    } catch (scriptureError) {
      console.log(`[Scripture API] ⚠️ Error accessing Scripture API:`, scriptureError);
    }
    
    // STEP 2: Check local database for existing verses
    let result = await lookupVerseFromDatabase(reference, preferredVersion);
    
    if (result) {
      // Check if the text is a placeholder and needs replacement from Scripture API
      const isPlaceholder = result.text && (
        result.text.includes('Scripture according to') ||
        result.text.includes('GOD\'s Word according to') ||
        result.text.includes('GOD\'s Message according to') ||
        result.text.includes('Jesus said to them as recorded in') ||
        result.text.includes('In those days it happened as recorded in') ||
        result.text.includes('The LORD spoke as written in') ||
        result.text.includes('As it is written in') ||
        result.text.length < 20
      );
      
      if (isPlaceholder) {
        console.log(`[Bible API] 🔄 Placeholder detected, trying Scripture API for authentic text`);
        try {
          const authenticVerse = await scriptureApiService.fetchVerseFromAPI(reference, preferredVersion);
          if (authenticVerse) {
            console.log(`[Scripture API] ✅ Replaced placeholder with authentic text`);
            return authenticVerse;
          }
        } catch (error) {
          console.log(`[Scripture API] Failed to replace placeholder, trying OpenAI`);
        }
      } else {
        console.log(`[Bible API] Found ${reference} in local database`);
        return result;
      }
    }
    
    // STEP 3: OpenAI fallback for licensed versions or when Scripture API fails
    const versionConfig = BIBLE_VERSIONS.find(v => v.code === preferredVersion);
    if (!versionConfig || versionConfig.useOpenAI) {
      console.log(`[Bible API] 🤖 Trying OpenAI fallback for ${preferredVersion}`);
      result = await fetchVerseFromOpenAI(reference, preferredVersion);
      
      if (result) {
        console.log(`[Bible API] ✅ Retrieved ${reference} from OpenAI fallback`);
        return result;
      }
    }
    
    console.log(`[Bible API] ❌ Could not find ${reference} in ${preferredVersion} from any source`);
    return null;
  } catch (error) {
    console.error('[Bible API] Error in lookupBibleVerse:', error);
    return null;
  }
}

// Search Bible verses across all translations with Scripture API integration
export async function searchBibleVerses(query: string, translation: string = 'NIV', limit: number = 20): Promise<any[]> {
  try {
    console.log(`[Bible API] Searching for "${query}" in ${translation} translation`);
    
    // STEP 1: Try Scripture API first for fresh, authentic results
    try {
      const scriptureResults = await scriptureApiService.searchVerses(query, translation, limit);
      if (scriptureResults && scriptureResults.length > 0) {
        console.log(`[Scripture API] ✅ Found ${scriptureResults.length} verses from American Bible Society`);
        // Convert to expected format
        return scriptureResults.map(verse => ({
          reference: verse.reference,
          text: verse.text,
          version: verse.version,
          source: verse.source,
          book: verse.reference.split(' ')[0],
          translation: verse.version.toUpperCase(),
          popularityScore: 0
        }));
      }
    } catch (scriptureError) {
      console.log(`[Scripture API] ⚠️ Search error:`, scriptureError);
    }
    
    // STEP 2: Search local database as fallback
    const searchResults = await db
      .select()
      .from(bibleVerses)
      .where(
        and(
          eq(bibleVerses.translation, translation.toUpperCase()),
          or(
            ilike(bibleVerses.text, `%${query}%`),
            ilike(bibleVerses.reference, `%${query}%`),
            ilike(bibleVerses.book, `%${query}%`)
          ),
          eq(bibleVerses.isActive, true)
        )
      )
      .orderBy(bibleVerses.popularityScore)
      .limit(limit);

    console.log(`[Bible DB] Found ${searchResults.length} verses matching "${query}" in local database`);
    
    // Filter out placeholder text and enhance with Scripture API if needed
    const enhancedResults = [];
    for (const verse of searchResults) {
      const isPlaceholder = verse.text && (
        verse.text.includes('Scripture according to') ||
        verse.text.includes('GOD\'s Word according to') ||
        verse.text.includes('GOD\'s Message according to') ||
        verse.text.includes('Jesus said to them as recorded in') ||
        verse.text.length < 20
      );
      
      if (isPlaceholder) {
        // Try to get authentic text from Scripture API
        try {
          const authenticVerse = await scriptureApiService.fetchVerseFromAPI(verse.reference || '', translation);
          if (authenticVerse) {
            enhancedResults.push({
              ...verse,
              text: authenticVerse.text,
              source: authenticVerse.source
            });
            continue;
          }
        } catch (error) {
          // Skip placeholder verses if we can't get authentic text
          continue;
        }
      }
      
      enhancedResults.push(verse);
    }
    
    return enhancedResults;
  } catch (error) {
    console.error('[Bible API] Search error:', error);
    return [];
  }
}

// Get random Bible verse from licensed database
export async function getRandomBibleVerse(translation: string = 'NIV'): Promise<any | null> {
  try {
    console.log(`[Bible DB] Getting random verse in ${translation}`);
    
    const randomVerse = await db
      .select()
      .from(bibleVerses)
      .where(
        and(
          eq(bibleVerses.translation, translation.toUpperCase()),
          eq(bibleVerses.isActive, true)
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomVerse.length > 0) {
      const verse = randomVerse[0];
      console.log(`[Bible DB] Random verse: ${verse.reference}`);
      
      // Check if the text is a placeholder and needs replacement
      const isPlaceholder = verse.text && (
        verse.text.includes('Scripture according to') ||
        verse.text.includes('GOD\'s Word according to') ||
        verse.text.includes('GOD\'s Message according to') ||
        verse.text.includes('Jesus said to them as recorded in') ||
        verse.text.length < 20
      );
      
      if (isPlaceholder) {
        console.log(`[Bible DB] Placeholder detected in random verse ${verse.reference}, fetching authentic text`);
        const authenticVerse = await fetchVerseFromOpenAI(verse.reference, verse.translation || 'NIV');
        if (authenticVerse) {
          // Update database with authentic verse
          await db
            .update(bibleVerses)
            .set({ 
              text: authenticVerse.text,
              updatedAt: new Date()
            })
            .where(eq(bibleVerses.id, verse.id));
          
          console.log(`[Bible DB] Updated random verse ${verse.reference} with authentic text`);
          return {
            ...verse,
            text: authenticVerse.text
          };
        }
      }
      
      return verse;
    }

    return null;
  } catch (error) {
    console.error('[Bible DB] Random verse error:', error);
    return null;
  }
}

// Helper function to normalize Bible references
function normalizeReference(reference: string): string[] {
  const variations: string[] = [reference];
  
  // Capitalize the first letter of each word for proper Bible book names
  const properCase = reference.replace(/\b\w+/g, word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
  
  if (properCase !== reference) {
    variations.push(properCase);
  }
  
  // Handle common book name variations
  const bookMappings: Record<string, string[]> = {
    'matt': ['Matthew', 'Mt'],
    'matthew': ['Matt', 'Mt'],
    'mk': ['Mark'],
    'mark': ['Mk'],
    'lk': ['Luke', 'Lk'],
    'luke': ['Lk'],
    'jn': ['John', 'Jhn'],
    'john': ['Jn', 'Jhn'],
    'acts': ['Act'],
    'rom': ['Romans', 'Rm'],
    'romans': ['Rom', 'Rm'],
    '1 cor': ['1 Corinthians', '1Cor'],
    '1 corinthians': ['1 Cor', '1Cor'],
    '2 cor': ['2 Corinthians', '2Cor'],
    '2 corinthians': ['2 Cor', '2Cor'],
    'gal': ['Galatians'],
    'galatians': ['Gal'],
    'eph': ['Ephesians'],
    'ephesians': ['Eph'],
    'phil': ['Philippians', 'Php'],
    'philippians': ['Phil', 'Php'],
    'col': ['Colossians'],
    'colossians': ['Col'],
    '1 thess': ['1 Thessalonians', '1Th'],
    '1 thessalonians': ['1 Thess', '1Th'],
    '2 thess': ['2 Thessalonians', '2Th'],
    '2 thessalonians': ['2 Thess', '2Th'],
    '1 tim': ['1 Timothy', '1Ti'],
    '1 timothy': ['1 Tim', '1Ti'],
    '2 tim': ['2 Timothy', '2Ti'],
    '2 timothy': ['2 Tim', '2Ti'],
    'titus': ['Tit'],
    'philemon': ['Phlm'],
    'heb': ['Hebrews'],
    'hebrews': ['Heb'],
    'jas': ['James', 'Jam'],
    'james': ['Jas', 'Jam'],
    '1 pet': ['1 Peter', '1Pe'],
    '1 peter': ['1 Pet', '1Pe'],
    '2 pet': ['2 Peter', '2Pe'],
    '2 peter': ['2 Pet', '2Pe'],
    '1 john': ['1 Jn', '1Jo'],
    '2 john': ['2 Jn', '2Jo'],
    '3 john': ['3 Jn', '3Jo'],
    'jude': ['Jud'],
    'rev': ['Revelation', 'Re'],
    'revelation': ['Rev', 'Re']
  };

  const lowerRef = reference.toLowerCase();
  for (const [key, alternatives] of Object.entries(bookMappings)) {
    if (lowerRef.startsWith(key + ' ')) {
      for (const alt of alternatives) {
        variations.push(reference.replace(new RegExp(`^${key}`, 'i'), alt));
      }
    }
  }

  return Array.from(new Set(variations)); // Remove duplicates
}

export default { lookupBibleVerse };