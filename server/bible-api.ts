import { scriptureApiService } from './scripture-api-service.js';

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
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchVerseFromOpenAI(reference: string, version: string = 'NIV'): Promise<BibleVerseResponse | null> {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a Bible verse lookup assistant. Provide ONLY the exact verse text from the ${version} translation without any commentary, explanations, or additional text. Return the verse in this exact JSON format: {"reference": "${reference}", "text": "verse text here", "version": "${version}"}`
          },
          {
            role: 'user',
            content: `Please provide the exact text of ${reference} from the ${version} Bible translation.`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return null;
    }

    try {
      const verseData = JSON.parse(content);
      return {
        reference: verseData.reference || reference,
        text: cleanVerseText(verseData.text || ''),
        version: verseData.version || version,
        source: 'ChatGPT API'
      };
    } catch (parseError) {
      // If JSON parsing fails, try to extract text content
      const cleanedContent = cleanVerseText(content);
      if (cleanedContent) {
        return {
          reference,
          text: cleanedContent,
          version,
          source: 'ChatGPT API'
        };
      }
      return null;
    }
  } catch (error) {
    console.error('Error fetching verse from OpenAI:', error);
    return null;
  }
}

interface BibleVerseResponse {
  reference: string;
  text: string;
  version: string;
  source?: string;
}

function generateReferenceVariations(reference: string): string[] {
  const variations = [reference];
  
  // Handle verse ranges (e.g., "John 3:16-17" vs "John 3:16")
  if (reference.includes('-')) {
    const basePart = reference.split('-')[0];
    variations.push(basePart);
  }
  
  // Handle chapter references (e.g., "Psalm 23" vs "Psalm 23:1")
  if (!reference.includes(':')) {
    variations.push(`${reference}:1`);
  }
  
  return variations;
}

export async function lookupBibleVerse(reference: string, preferredVersion: string = 'NIV'): Promise<BibleVerseResponse | null> {
  const referenceVariations = generateReferenceVariations(reference);
  
  // Try API.Bible first (primary source)
  for (const refVariation of referenceVariations) {
    try {
      const scriptureResult = await scriptureApiService.lookupVerse(refVariation, preferredVersion);
      if (scriptureResult && scriptureResult.text) {
        return {
          reference: scriptureResult.reference,
          text: cleanVerseText(scriptureResult.text),
          version: scriptureResult.version,
          source: 'API.Bible'
        };
      }
    } catch (error) {
      console.error(`API.Bible error for ${refVariation}:`, error);
    }
  }
  
  // Fallback to ChatGPT only if API.Bible is unresponsive
  const versePattern = /^[1-3]?\s*[A-Za-z]+\s+\d+:\d+/;
  if (versePattern.test(reference)) {
    const openAIResult = await fetchVerseFromOpenAI(reference, preferredVersion);
    if (openAIResult) {
      return openAIResult;
    }
  }
  
  return null;
}

export async function searchBibleVerses(query: string, translation: string = 'NIV', limit: number = 20): Promise<any[]> {
  try {
    // Use API.Bible for search (primary source)
    const scriptureResults = await scriptureApiService.searchVerses(query, translation, limit);
    if (scriptureResults && scriptureResults.length > 0) {
      return scriptureResults.map(verse => ({
        ...verse,
        text: cleanVerseText(verse.text),
        source: 'API.Bible'
      }));
    }
  } catch (error) {
    console.error('API.Bible search error:', error);
  }
  
  // No fallback for search - API.Bible only
  return [];
}

export async function getRandomBibleVerse(translation: string = 'NIV'): Promise<any | null> {
  try {
    // Try to get a well-known verse via API.Bible
    const popularVerses = [
      'John 3:16', 'Romans 8:28', 'Philippians 4:13', 'Jeremiah 29:11', 'Romans 5:8',
      'Matthew 28:19-20', 'John 14:6', 'Psalm 23:1', 'Isaiah 40:31', 'Matthew 11:28-30'
    ];
    
    const randomReference = popularVerses[Math.floor(Math.random() * popularVerses.length)];
    return await lookupBibleVerse(randomReference, translation);
  } catch (error) {
    console.error('Random verse error:', error);
    return await lookupBibleVerse('John 3:16', translation);
  }
}

function normalizeReference(reference: string): string[] {
  // Handle various reference formats
  const normalized = [];
  
  // Base reference
  normalized.push(reference);
  
  // Handle ranges like "John 3:16-17"
  if (reference.includes('-')) {
    const parts = reference.split('-');
    if (parts.length === 2) {
      normalized.push(parts[0].trim());
    }
  }
  
  return normalized;
}