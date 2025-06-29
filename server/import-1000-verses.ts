import { db } from './db.js';
import { soapboxBible } from '../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import popularVerses from './popular-verses-1000.json' assert { type: 'json' };

// API.Bible configuration for public domain versions
const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = process.env.SCRIPTURE_API_KEY;

// Bible version mappings to API.Bible IDs
const BIBLE_VERSIONS = {
  'KJV': 'de4e12af7f28f599-02',   // King James Version
  'KJVA': '01b29f4b342acc35-01',  // King James Version with Apocrypha  
  'WEB': '9879dbb7cfe39e4d-03',   // World English Bible
  'ASV': '06125adad2d5898a-01',   // American Standard Version
  'CEV': '1e39c8b29e926c0a-01',   // Contemporary English Version
  'GNT': '592420522e16049f-01'    // Good News Translation
};

interface ApiVerseResult {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  reference: string;
  content: string;
}

interface ImportResult {
  success: number;
  errors: string[];
  duplicates: number;
  totalProcessed: number;
}

/**
 * Clean verse text by removing HTML tags, verse numbers, and explanatory prefixes
 */
function cleanVerseText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove HTML entities
    .replace(/&[a-zA-Z]+;/g, '')
    // Remove explanatory prefixes like "Hebrews 11:2 in the Good News Translation (GNT) is: "
    .replace(/^[A-Za-z0-9\s:]+ in the [^:]+:\s*/i, '')
    .replace(/^[A-Za-z0-9\s:]+ \([A-Z]+\) is:\s*/i, '')
    // Remove verse numbers with pilcrow symbols (¶)
    .replace(/\d+¶/g, '')
    // Remove verse numbers in various formats
    .replace(/^\d+[A-Za-z]*[\.\)\]\s]+/g, '')
    .replace(/\[\d+[A-Za-z]*\]/g, '')
    .replace(/\(\d+[A-Za-z]*\)/g, '')
    // Remove remaining translation prefixes
    .replace(/^[A-Z]{2,5}:\s*/g, '')
    .replace(/^[A-Z]{2,5}\s*-\s*/g, '')
    // Clean up whitespace
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Parse book name and chapter/verse from reference
 */
function parseReference(reference: string): { book: string; chapter: number; verse: string } {
  // Handle ranges like "Matthew 11:28-30" 
  const match = reference.match(/^(\d?\s*[A-Za-z\s]+)\s+(\d+):(.+)$/);
  if (!match) {
    console.warn(`Could not parse reference: ${reference}`);
    return { book: reference, chapter: 1, verse: '1' };
  }
  
  const [, book, chapterStr, verseStr] = match;
  return {
    book: book.trim(),
    chapter: parseInt(chapterStr),
    verse: verseStr.trim()
  };
}

/**
 * Fetch a single verse from API.Bible with rate limiting
 */
async function fetchVerseFromAPI(reference: string, translation: string): Promise<ApiVerseResult | null> {
  const bibleId = BIBLE_VERSIONS[translation as keyof typeof BIBLE_VERSIONS];
  if (!bibleId) {
    console.error(`Unknown translation: ${translation}`);
    return null;
  }

  try {
    const searchUrl = `${API_BASE_URL}/bibles/${bibleId}/search`;
    const params = new URLSearchParams({
      query: reference,
      limit: '1'
    });

    console.log(`Fetching ${reference} (${translation}) from API.Bible...`);
    
    const response = await fetch(`${searchUrl}?${params}`, {
      headers: {
        'api-key': API_KEY!,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`API error for ${reference}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const verses = data?.data?.verses;
    
    if (!verses || verses.length === 0) {
      console.warn(`No verses found for ${reference} in ${translation}`);
      return null;
    }

    return verses[0];
  } catch (error) {
    console.error(`Error fetching ${reference}:`, error);
    return null;
  }
}

/**
 * Check if verse already exists in SoapBox Bible cache
 */
async function verseExists(reference: string, translation: string): Promise<boolean> {
  try {
    const existing = await db.select()
      .from(soapboxBible)
      .where(and(
        eq(soapboxBible.reference, reference),
        eq(soapboxBible.translation, translation)
      ))
      .limit(1);
    
    return existing.length > 0;
  } catch (error) {
    console.error(`Error checking if verse exists: ${reference}`, error);
    return false;
  }
}

/**
 * Save verse to SoapBox Bible cache
 */
async function saveVerse(reference: string, translation: string, apiResult: ApiVerseResult): Promise<boolean> {
  try {
    const { book, chapter, verse } = parseReference(reference);
    const cleanText = cleanVerseText(apiResult.content);
    
    if (!cleanText || cleanText.length < 5) {
      console.warn(`Skipping verse with insufficient content: ${reference}`);
      return false;
    }

    await db.insert(soapboxBible).values({
      reference,
      book,
      chapter,
      verse,
      text: cleanText,
      translation,
      source: 'API.Bible',
      popularity: 1000 - popularVerses.indexOf(reference), // Higher number = more popular
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`✓ Saved: ${reference} (${translation})`);
    return true;
  } catch (error) {
    console.error(`Error saving verse ${reference}:`, error);
    return false;
  }
}

/**
 * Import verses for a specific translation with rate limiting
 */
async function importVersesForTranslation(translation: string): Promise<ImportResult> {
  console.log(`\n📖 Starting import for ${translation}...`);
  
  const result: ImportResult = {
    success: 0,
    errors: [],
    duplicates: 0,
    totalProcessed: 0
  };

  for (let i = 0; i < popularVerses.length; i++) {
    const reference = popularVerses[i];
    result.totalProcessed++;

    try {
      // Check if verse already exists
      if (await verseExists(reference, translation)) {
        console.log(`⚠️  Already exists: ${reference} (${translation})`);
        result.duplicates++;
        continue;
      }

      // Fetch from API.Bible
      const apiResult = await fetchVerseFromAPI(reference, translation);
      if (!apiResult) {
        result.errors.push(`Failed to fetch ${reference} from API`);
        continue;
      }

      // Save to database
      if (await saveVerse(reference, translation, apiResult)) {
        result.success++;
      } else {
        result.errors.push(`Failed to save ${reference} to database`);
      }

      // Progress indicator
      if (i % 50 === 0) {
        console.log(`📊 Progress: ${i + 1}/${popularVerses.length} verses processed`);
      }

      // Rate limiting: 300ms delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`Error processing ${reference}:`, error);
      result.errors.push(`Error processing ${reference}: ${error}`);
    }
  }

  return result;
}

/**
 * Get import progress from database
 */
async function getImportProgress(): Promise<{ completedCount: number, lastTranslation?: string, lastIndex?: number }> {
  try {
    const count = await db.select({ count: sql`count(*)` }).from(soapboxBible);
    const completedCount = Number(count[0]?.count || 0);
    
    // Simple progress tracking - can be enhanced with a dedicated progress table
    return { completedCount };
  } catch (error) {
    console.error('Error getting import progress:', error);
    return { completedCount: 0 };
  }
}

/**
 * Import verses with daily rate limit awareness (5,000 per day)
 */
async function importVersesWithRateLimit(translation: string, maxDailyRequests: number = 800): Promise<ImportResult> {
  console.log(`\n📖 Starting import for ${translation} (max ${maxDailyRequests} requests today)...`);
  
  const result: ImportResult = {
    success: 0,
    errors: [],
    duplicates: 0,
    totalProcessed: 0
  };

  let requestsToday = 0;

  for (let i = 0; i < popularVerses.length; i++) {
    const reference = popularVerses[i];
    result.totalProcessed++;

    try {
      // Check if verse already exists (no API call needed)
      if (await verseExists(reference, translation)) {
        console.log(`⚠️  Already exists: ${reference} (${translation})`);
        result.duplicates++;
        continue;
      }

      // Check daily rate limit before making API call
      if (requestsToday >= maxDailyRequests) {
        console.log(`\n⏸️  Daily rate limit reached (${maxDailyRequests} requests)`);
        console.log(`📊 Processed ${i + 1}/${popularVerses.length} verses for ${translation}`);
        console.log(`✅ Successfully imported: ${result.success} verses`);
        console.log(`🔄 Resume tomorrow from verse ${i + 1}: ${popularVerses[i]}`);
        break;
      }

      // Fetch from API.Bible (counts as API request)
      const apiResult = await fetchVerseFromAPI(reference, translation);
      requestsToday++;
      
      if (!apiResult) {
        result.errors.push(`Failed to fetch ${reference} from API`);
        continue;
      }

      // Save to database
      if (await saveVerse(reference, translation, apiResult)) {
        result.success++;
      } else {
        result.errors.push(`Failed to save ${reference} to database`);
      }

      // Progress indicator
      if (i % 25 === 0) {
        console.log(`📊 Progress: ${i + 1}/${popularVerses.length} verses, ${requestsToday}/${maxDailyRequests} API calls today`);
      }

      // Rate limiting: 300ms delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`Error processing ${reference}:`, error);
      result.errors.push(`Error processing ${reference}: ${error}`);
    }
  }

  return result;
}

/**
 * Main import function with smart batching and resumption
 */
export async function import1000PopularVerses(maxDailyRequests: number = 800): Promise<void> {
  console.log('🚀 Starting import of 1,000 most popular Bible verses...');
  console.log(`📋 Total verses to process: ${popularVerses.length}`);
  console.log(`🔤 Translations: ${Object.keys(BIBLE_VERSIONS).join(', ')}`);
  console.log(`⏱️  Daily rate limit: ${maxDailyRequests} API requests`);

  if (!API_KEY) {
    throw new Error('SCRIPTURE_API_KEY environment variable not set');
  }

  // Check current progress
  const progress = await getImportProgress();
  console.log(`📈 Current database: ${progress.completedCount} verses cached`);

  const overallResults = {
    totalSuccess: 0,
    totalErrors: 0,
    totalDuplicates: 0,
    translationResults: {} as Record<string, ImportResult>
  };

  // Import verses for each translation with rate limiting
  for (const translation of Object.keys(BIBLE_VERSIONS)) {
    try {
      const result = await importVersesWithRateLimit(translation, maxDailyRequests);
      overallResults.translationResults[translation] = result;
      overallResults.totalSuccess += result.success;
      overallResults.totalErrors += result.errors.length;
      overallResults.totalDuplicates += result.duplicates;

      console.log(`\n✅ ${translation} import session completed:`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Duplicates: ${result.duplicates}`);
      console.log(`   Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log(`   Sample errors:`, result.errors.slice(0, 2));
      }

      // If we hit rate limit, stop for today
      if (result.totalProcessed < popularVerses.length) {
        console.log(`\n⏸️  Stopping import for today due to rate limits`);
        console.log(`🔄 Run again tomorrow to continue importing remaining verses`);
        break;
      }
    } catch (error) {
      console.error(`❌ Failed to import ${translation}:`, error);
      overallResults.totalErrors++;
    }
  }

  // Final summary
  const finalProgress = await getImportProgress();
  console.log('\n🎯 IMPORT SESSION SUMMARY:');
  console.log(`📊 Verses imported this session: ${overallResults.totalSuccess}`);
  console.log(`⚠️  Duplicates skipped: ${overallResults.totalDuplicates}`);
  console.log(`❌ Errors encountered: ${overallResults.totalErrors}`);
  console.log(`💾 Total verses in database: ${finalProgress.completedCount}`);

  // Calculate estimated completion
  const totalPossible = popularVerses.length * Object.keys(BIBLE_VERSIONS).length;
  const percentComplete = ((finalProgress.completedCount / totalPossible) * 100).toFixed(1);
  console.log(`📈 Overall progress: ${percentComplete}% complete`);

  if (finalProgress.completedCount < totalPossible) {
    const remainingDays = Math.ceil((totalPossible - finalProgress.completedCount) / maxDailyRequests);
    console.log(`⏳ Estimated ${remainingDays} more day(s) to complete all translations`);
  } else {
    console.log(`🎉 All verses imported successfully!`);
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import1000PopularVerses().catch(console.error);
}