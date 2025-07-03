import { db } from './db.js';
import { soapboxBible } from '../shared/schema.js';
import { eq, and, sql, count } from 'drizzle-orm';
import popularVerses from './popular-verses-1000.json' assert { type: 'json' };

// API.Bible configuration for public domain versions
const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = process.env.SCRIPTURE_API_KEY;

// Bible version mappings to API.Bible IDs (public domain only)
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
  apiCallsMade: number;
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
 * Convert reference format for API.Bible verse endpoint
 */
function convertReferenceForAPI(reference: string): string {
  // Convert "John 3:16" to "JHN.3.16"
  // Convert "1 Corinthians 13:4-7" to "1CO.13.4-1CO.13.7"
  
  const bookMap: Record<string, string> = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
    'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
    '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
    'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalm': 'PSA', 'Psalms': 'PSA',
    'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
    'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
    'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
    'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
    'Zechariah': 'ZEC', 'Malachi': 'MAL', 'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK',
    'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
    'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
    '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
    'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE',
    '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD',
    'Revelation': 'REV'
  };

  const match = reference.match(/^(\d?\s*[A-Za-z\s]+)\s+(\d+):(.+)$/);
  if (!match) return reference;

  const [, bookName, chapter, verseRange] = match;
  const bookCode = bookMap[bookName.trim()];
  if (!bookCode) return reference;

  // Handle verse ranges like "4-7"
  if (verseRange.includes('-')) {
    const [startVerse, endVerse] = verseRange.split('-');
    return `${bookCode}.${chapter}.${startVerse.trim()}-${bookCode}.${chapter}.${endVerse.trim()}`;
  }
  
  return `${bookCode}.${chapter}.${verseRange.trim()}`;
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
    const verseId = convertReferenceForAPI(reference);
    const verseUrl = `${API_BASE_URL}/bibles/${bibleId}/verses/${verseId}`;


    
    const response = await fetch(verseUrl, {
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
    const verse = data?.data;
    
    if (!verse || !verse.content) {
      return null;
    }

    return {
      id: verse.id,
      orgId: verse.orgId || '',
      bookId: verse.bookId || '',
      chapterId: verse.chapterId || '',
      reference: verse.reference || reference,
      content: verse.content
    };
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
async function saveVerse(reference: string, translation: string, apiResult: ApiVerseResult, popularityRank: number): Promise<boolean> {
  try {
    const { book, chapter, verse } = parseReference(reference);
    const cleanText = cleanVerseText(apiResult.content);
    
    if (!cleanText || cleanText.length < 5) {
      return false;
    }

    await db.insert(soapboxBible).values({
      reference,
      book,
      chapter,
      verse,
      text: cleanText,
      translation,
      popularityRank,
      source: 'API.Bible',
      importedAt: new Date(),
      lastUpdated: new Date()
    });


    return true;
  } catch (error) {
    console.error(`Error saving verse ${reference}:`, error);
    return false;
  }
}

/**
 * Get import progress from database
 */
async function getImportProgress(): Promise<{ completedCount: number }> {
  try {
    const result = await db.select({ count: count() }).from(soapboxBible);
    const completedCount = Number(result[0]?.count || 0);
    
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

  
  const result: ImportResult = {
    success: 0,
    errors: [],
    duplicates: 0,
    totalProcessed: 0,
    apiCallsMade: 0
  };

  for (let i = 0; i < popularVerses.length; i++) {
    const reference = popularVerses[i];
    const popularityRank = i + 1; // 1 = most popular, 1000 = least popular
    result.totalProcessed++;

    try {
      // Check if verse already exists (no API call needed)
      if (await verseExists(reference, translation)) {

        result.duplicates++;
        continue;
      }

      // Check daily rate limit before making API call
      if (result.apiCallsMade >= maxDailyRequests) {




        break;
      }

      // Fetch from API.Bible (counts as API request)
      const apiResult = await fetchVerseFromAPI(reference, translation);
      result.apiCallsMade++;
      
      if (!apiResult) {
        result.errors.push(`Failed to fetch ${reference} from API`);
        continue;
      }

      // Save to database
      if (await saveVerse(reference, translation, apiResult, popularityRank)) {
        result.success++;
      } else {
        result.errors.push(`Failed to save ${reference} to database`);
      }

      // Progress indicator
      if (i % 25 === 0) {

      }

      // Rate limiting: 300ms delay between requests to avoid hitting rate cap
      await new Promise(r => setTimeout(r, 300));
      
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





  if (!API_KEY) {
    throw new Error('SCRIPTURE_API_KEY environment variable not set');
  }

  // Check current progress
  const progress = await getImportProgress();


  const overallResults = {
    totalSuccess: 0,
    totalErrors: 0,
    totalDuplicates: 0,
    totalApiCalls: 0,
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
      overallResults.totalApiCalls += result.apiCallsMade;






      
      if (result.errors.length > 0) {

      }

      // If we hit rate limit, stop for today
      if (result.totalProcessed < popularVerses.length) {


        break;
      }
    } catch (error) {
      console.error(`Failed to import ${translation}:`, error);
      overallResults.totalErrors++;
    }
  }

  // Final summary
  const finalProgress = await getImportProgress();







  // Calculate estimated completion
  const totalPossible = popularVerses.length * Object.keys(BIBLE_VERSIONS).length;
  const percentComplete = ((finalProgress.completedCount / totalPossible) * 100).toFixed(1);


  if (finalProgress.completedCount < totalPossible) {
    const remainingVerses = totalPossible - finalProgress.completedCount;
    const remainingDays = Math.ceil(remainingVerses / maxDailyRequests);


  } else {

  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import1000PopularVerses().catch(console.error);
}