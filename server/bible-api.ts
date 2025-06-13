const fetch = require('node-fetch');

interface BibleVerseResponse {
  reference: string;
  text: string;
  version: string;
}

// Bible.com API fallback data for common translations
const BIBLE_VERSIONS = {
  'NIV': 'New International Version',
  'ESV': 'English Standard Version',
  'KJV': 'King James Version',
  'NLT': 'New Living Translation',
  'NASB': 'New American Standard Bible',
  'CSB': 'Christian Standard Bible'
};

// Free Bible API service using bible-api.com
async function fetchFromBibleAPI(reference: string, version: string = 'NIV'): Promise<BibleVerseResponse | null> {
  try {
    // bible-api.com uses different version codes
    const versionMap: Record<string, string> = {
      'NIV': '',  // Default
      'KJV': 'kjv',
      'ESV': '',  // Not available, fallback to default
      'NLT': '',  // Not available, fallback to default
      'NASB': '', // Not available, fallback to default
      'CSB': ''   // Not available, fallback to default
    };

    const apiVersion = versionMap[version] || '';
    const url = apiVersion 
      ? `https://bible-api.com/${encodeURIComponent(reference)}?translation=${apiVersion}`
      : `https://bible-api.com/${encodeURIComponent(reference)}`;

    console.log(`Fetching from Bible API: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SoapBox-App/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`Bible API response not ok: ${response.status}`);
      return null;
    }

    const data = await response.json() as any;
    
    if (data && data.text && data.reference) {
      return {
        reference: data.reference,
        text: data.text.replace(/\s+/g, ' ').trim(),
        version: version
      };
    }

    return null;
  } catch (error) {
    console.error('Bible API error:', error);
    return null;
  }
}

// ESV API service (requires API key but more reliable)
async function fetchFromESVAPI(reference: string): Promise<BibleVerseResponse | null> {
  try {
    const apiKey = process.env.ESV_API_KEY;
    if (!apiKey) {
      return null;
    }

    const response = await fetch(`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(reference)}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as any;
    
    if (data && data.passages && data.passages.length > 0) {
      return {
        reference: data.canonical || reference,
        text: data.passages[0].replace(/\s+/g, ' ').trim(),
        version: 'ESV'
      };
    }

    return null;
  } catch (error) {
    console.error('ESV API error:', error);
    return null;
  }
}

// Main Bible lookup function with fallbacks
export async function lookupBibleVerse(reference: string, preferredVersion: string = 'NIV'): Promise<BibleVerseResponse | null> {
  console.log(`Looking up verse: ${reference} (${preferredVersion})`);

  // Strategy 1: Try free Bible API
  let result = await fetchFromBibleAPI(reference, preferredVersion);
  if (result) {
    console.log(`Found verse via Bible API: ${result.reference}`);
    return result;
  }

  // Strategy 2: Try ESV API if available and version is ESV
  if (preferredVersion === 'ESV') {
    result = await fetchFromESVAPI(reference);
    if (result) {
      console.log(`Found verse via ESV API: ${result.reference}`);
      return result;
    }
  }

  // Strategy 3: Try with normalized reference formats
  const normalizedRefs = normalizeReference(reference);
  for (const normalizedRef of normalizedRefs) {
    if (normalizedRef !== reference) {
      result = await fetchFromBibleAPI(normalizedRef, preferredVersion);
      if (result) {
        console.log(`Found verse with normalized reference: ${result.reference}`);
        return result;
      }
    }
  }

  console.log(`No verse found for: ${reference}`);
  return null;
}

// Helper function to normalize Bible references
function normalizeReference(reference: string): string[] {
  const variations: string[] = [reference];
  
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