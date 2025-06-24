/**
 * Test Alternative Bible API Sources for ASV and WEB
 * Research multiple sources to find working ASV and WEB translations
 */

import fetch from 'node-fetch';

interface BibleSource {
  name: string;
  baseUrl: string;
  testEndpoint: (translation: string) => string;
  parseResponse: (data: any) => { book: string; chapter: number; verse: number; text: string }[];
}

const sources: BibleSource[] = [
  {
    name: 'Bible API',
    baseUrl: 'https://bible-api.com',
    testEndpoint: (translation) => `https://bible-api.com/john+3:16?translation=${translation}`,
    parseResponse: (data) => {
      if (data.verses && Array.isArray(data.verses)) {
        return data.verses.map((v: any) => ({
          book: v.book_name,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text
        }));
      }
      return [];
    }
  },
  {
    name: 'Bible Gateway API',
    baseUrl: 'https://www.biblegateway.com/passage/',
    testEndpoint: (translation) => `https://www.biblegateway.com/passage/?search=john+3:16&version=${translation}&interface=print`,
    parseResponse: (data) => {
      // This would need HTML parsing for Bible Gateway
      return [];
    }
  },
  {
    name: 'ESV API',
    baseUrl: 'https://api.esv.org/v3/passage/text/',
    testEndpoint: (translation) => `https://api.esv.org/v3/passage/text/?q=john+3:16&include-headings=false&include-footnotes=false&include-verse-numbers=false&include-short-copyright=false&include-passage-references=false`,
    parseResponse: (data) => {
      if (data.passages && data.passages.length > 0) {
        return [{
          book: 'John',
          chapter: 3,
          verse: 16,
          text: data.passages[0].trim()
        }];
      }
      return [];
    }
  },
  {
    name: 'Bible Super Search',
    baseUrl: 'https://api.biblesupersearch.com/api',
    testEndpoint: (translation) => `https://api.biblesupersearch.com/api?reference=john+3:16&bible=${translation}&format=json`,
    parseResponse: (data) => {
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((v: any) => ({
          book: v.book,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text
        }));
      }
      return [];
    }
  }
];

async function testSource(source: BibleSource, translation: string): Promise<void> {
  console.log(`\n=== Testing ${source.name} for ${translation} ===`);
  
  try {
    const url = source.testEndpoint(translation);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`Status: ${response.status}`);
    
    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const contentType = response.headers.get('content-type') || '';
    console.log(`Content-Type: ${contentType}`);
    
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log(`Response (first 200 chars): ${text.substring(0, 200)}...`);
      return;
    }
    
    console.log(`Raw response:`, JSON.stringify(data, null, 2));
    
    const verses = source.parseResponse(data);
    if (verses.length > 0) {
      console.log(`✅ Found ${verses.length} verses`);
      verses.forEach(v => {
        console.log(`  ${v.book} ${v.chapter}:${v.verse} - ${v.text.substring(0, 100)}...`);
      });
    } else {
      console.log(`❌ No verses found`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('Testing Alternative Bible API Sources for ASV and WEB translations\n');
  
  const translations = ['asv', 'web', 'ASV', 'WEB'];
  
  for (const translation of translations) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TESTING TRANSLATION: ${translation}`);
    console.log(`${'='.repeat(60)}`);
    
    for (const source of sources) {
      await testSource(source, translation);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Testing complete. Check results above for working sources.');
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch(console.error);
}