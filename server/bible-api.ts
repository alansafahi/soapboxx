import { db } from './db';
import { bibleVerses } from '@shared/schema';
import { eq, and, like, ilike, or, sql } from 'drizzle-orm';

interface BibleVerseResponse {
  reference: string;
  text: string;
  version: string;
}

// Complete Bible translation mapping with full names
const BIBLE_VERSIONS = {
  'KJV': 'King James Version',
  'NIV': 'New International Version', 
  'ESV': 'English Standard Version',
  'NLT': 'New Living Translation',
  'NASB': 'New American Standard Bible',
  'CSB': 'Christian Standard Bible',
  'MSG': 'The Message',
  'AMP': 'Amplified Bible',
  'CEV': 'Contemporary English Version',
  'NET': 'New English Translation',
  'CEB': 'Common English Bible',
  'GNT': 'Good News Translation',
  'NKJV': 'New King James Version',
  'RSV': 'Revised Standard Version',
  'NRSV': 'New Revised Standard Version',
  'HCSB': 'Holman Christian Standard Bible',
  'NCV': 'New Century Version'
};

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
      return {
        reference: verse.reference,
        text: verse.text || '',
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
          text: verse.text,
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
    return null;
  } catch (error) {
    console.error('[Bible DB] Database lookup error:', error);
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

// Main Bible lookup function - database-first with comprehensive coverage
export async function lookupBibleVerse(reference: string, preferredVersion: string = 'NIV'): Promise<BibleVerseResponse | null> {
  console.log(`[Bible DB] Looking up verse: "${reference}" (${preferredVersion})`);
  
  // Use database-first approach with your licensed Bible content
  const result = await lookupVerseFromDatabase(reference, preferredVersion);
  
  if (result) {
    console.log(`[Bible DB] SUCCESS: Found verse in licensed database: ${result.reference} (${result.version})`);
    return result;
  }

  console.log(`[Bible DB] Verse not found: "${reference}" in ${preferredVersion}`);
  return null;
}

// Search Bible verses across all translations
export async function searchBibleVerses(query: string, translation: string = 'NIV', limit: number = 20): Promise<any[]> {
  try {
    console.log(`[Bible DB] Searching for "${query}" in ${translation} translation`);
    
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

    console.log(`[Bible DB] Found ${searchResults.length} verses matching "${query}"`);
    return searchResults;
  } catch (error) {
    console.error('[Bible DB] Search error:', error);
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
      console.log(`[Bible DB] Random verse: ${randomVerse[0].reference}`);
      return randomVerse[0];
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