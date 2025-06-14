import fetch from 'node-fetch';

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
    // Clean and format the reference properly
    const cleanRef = reference.trim();
    
    // Use KJV for reliable results, or default for others
    const useKJV = version === 'KJV';
    const url = useKJV 
      ? `https://bible-api.com/${encodeURIComponent(cleanRef)}?translation=kjv`
      : `https://bible-api.com/${encodeURIComponent(cleanRef)}`;

    console.log(`[Bible API] Attempting to fetch: ${url}`);
    console.log(`[Bible API] Original reference: "${reference}"`);
    console.log(`[Bible API] Clean reference: "${cleanRef}"`);
    console.log(`[Bible API] Encoded reference: "${encodeURIComponent(cleanRef)}"`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SoapBox-Bible-App/1.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    console.log(`[Bible API] Response received - Status: ${response.status}, OK: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[Bible API] Error response body: ${errorText}`);
      return null;
    }

    const responseText = await response.text();
    console.log(`[Bible API] Response body length: ${responseText.length}`);
    console.log(`[Bible API] Response preview: ${responseText.substring(0, 300)}`);
    
    if (!responseText.trim()) {
      console.log(`[Bible API] Empty response received`);
      return null;
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[Bible API] JSON parse error:`, parseError);
      console.log(`[Bible API] Failed to parse response: ${responseText}`);
      return null;
    }
    
    console.log(`[Bible API] Parsed JSON structure:`, Object.keys(data));
    
    // Check if we have valid verse data
    if (data && data.reference && data.text) {
      const cleanText = data.text
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const result = {
        reference: data.reference,
        text: cleanText,
        version: data.translation_name || (useKJV ? 'King James Version' : 'World English Bible')
      };
      
      console.log(`[Bible API] SUCCESS! Returning formatted verse:`, result);
      return result;
    } else {
      console.log(`[Bible API] Missing required fields - reference: ${!!data?.reference}, text: ${!!data?.text}`);
      console.log(`[Bible API] Full data object:`, data);
    }

    return null;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[Bible API] Request timeout after 15 seconds');
    } else {
      console.error('[Bible API] Fetch error:', error);
    }
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
  console.log(`[Bible API] Looking up verse: "${reference}" (${preferredVersion})`);

  // First, normalize the reference to proper case format
  const normalizedRefs = normalizeReference(reference);
  console.log(`[Bible API] Normalized references to try:`, normalizedRefs);
  
  // Try each normalized reference format
  for (const normalizedRef of normalizedRefs) {
    console.log(`[Bible API] Trying reference: "${normalizedRef}"`);
    
    // Strategy 1: Try free Bible API
    let result = await fetchFromBibleAPI(normalizedRef, preferredVersion);
    if (result) {
      console.log(`[Bible API] SUCCESS: Found verse via Bible API: ${result.reference}`);
      return result;
    }

    // Strategy 2: Try ESV API if available and version is ESV
    if (preferredVersion === 'ESV') {
      result = await fetchFromESVAPI(normalizedRef);
      if (result) {
        console.log(`[Bible API] SUCCESS: Found verse via ESV API: ${result.reference}`);
        return result;
      }
    }
  }

  console.log(`[Bible API] FINAL FAILURE: No verse found for any format of: "${reference}"`);
  return null;
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