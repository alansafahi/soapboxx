/**
 * Alternative Bible API Sources Investigation
 * Research multiple Bible API sources for ASV and WEB translations
 */

import fetch from 'node-fetch';

interface BibleAPISource {
  name: string;
  baseUrl: string;
  testEndpoint: (translation: string, book: string) => string;
  parseResponse: (data: any) => any[];
  rateLimit: number; // requests per second
  requiresKey: boolean;
}

const API_SOURCES: BibleAPISource[] = [
  {
    name: 'Bible API',
    baseUrl: 'https://bible-api.com',
    testEndpoint: (translation: string, book: string) => 
      `https://bible-api.com/${book}+1?translation=${translation}`,
    parseResponse: (data: any) => data.verses || [],
    rateLimit: 2,
    requiresKey: false
  },
  {
    name: 'API.Bible',
    baseUrl: 'https://api.scripture.api.bible',
    testEndpoint: (translation: string, book: string) => 
      `https://api.scripture.api.bible/v1/bibles/${translation}/books/GEN/chapters/1/verses`,
    parseResponse: (data: any) => data.data || [],
    rateLimit: 1,
    requiresKey: true
  },
  {
    name: 'ESV API',
    baseUrl: 'https://api.esv.org',
    testEndpoint: (translation: string, book: string) => 
      `https://api.esv.org/v3/passage/text/?q=${book}+1`,
    parseResponse: (data: any) => [data],
    rateLimit: 1,
    requiresKey: true
  },
  {
    name: 'Bible Gateway Parser',
    baseUrl: 'https://www.biblegateway.com',
    testEndpoint: (translation: string, book: string) => 
      `https://www.biblegateway.com/passage/?search=${book}+1&version=${translation}`,
    parseResponse: (data: any) => [],
    rateLimit: 0.5,
    requiresKey: false
  },
  {
    name: 'Bible.org API',
    baseUrl: 'https://bible.org',
    testEndpoint: (translation: string, book: string) => 
      `https://bible.org/api/verse/${translation}/${book}/1`,
    parseResponse: (data: any) => data.verses || [],
    rateLimit: 1,
    requiresKey: false
  }
];

class AlternativeBibleAPITester {
  
  async testAPISource(source: BibleAPISource, translation: string): Promise<{
    source: string;
    available: boolean;
    error?: string;
    sampleData?: any;
  }> {
    console.log(`🔍 Testing ${source.name} for ${translation}...`);
    
    try {
      const testUrl = source.testEndpoint(translation, 'Genesis');
      console.log(`📡 Testing URL: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        headers: {
          'User-Agent': 'SoapBox Bible Import System 1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        return {
          source: source.name,
          available: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      const data = await response.json();
      const verses = source.parseResponse(data);
      
      return {
        source: source.name,
        available: verses.length > 0,
        sampleData: verses.slice(0, 2) // First 2 verses as sample
      };
      
    } catch (error) {
      return {
        source: source.name,
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async findWorkingAPIs(translation: string): Promise<{
    translation: string;
    workingSources: any[];
    failedSources: any[];
  }> {
    console.log(`🎯 Searching for working APIs for ${translation} translation...`);
    
    const results = await Promise.all(
      API_SOURCES.map(source => this.testAPISource(source, translation))
    );
    
    const workingSources = results.filter(r => r.available);
    const failedSources = results.filter(r => !r.available);
    
    console.log(`✅ Found ${workingSources.length} working sources for ${translation}`);
    console.log(`❌ ${failedSources.length} sources failed for ${translation}`);
    
    return {
      translation,
      workingSources,
      failedSources
    };
  }
  
  async testAllTranslations(): Promise<void> {
    console.log('🚀 Testing all Bible API sources for ASV and WEB translations...\n');
    
    const translations = ['ASV', 'WEB', 'asv', 'web', 'american-standard', 'world-english'];
    
    for (const translation of translations) {
      const results = await this.findWorkingAPIs(translation);
      
      console.log(`\n📋 Results for ${translation.toUpperCase()}:`);
      
      if (results.workingSources.length > 0) {
        console.log('✅ Working sources:');
        results.workingSources.forEach(source => {
          console.log(`  - ${source.source}`);
          if (source.sampleData) {
            console.log(`    Sample: ${JSON.stringify(source.sampleData).substring(0, 100)}...`);
          }
        });
      }
      
      if (results.failedSources.length > 0) {
        console.log('❌ Failed sources:');
        results.failedSources.forEach(source => {
          console.log(`  - ${source.source}: ${source.error}`);
        });
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Export for use
export { AlternativeBibleAPITester, API_SOURCES };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AlternativeBibleAPITester();
  tester.testAllTranslations()
    .then(() => {
      console.log('\n🎉 API testing completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ API testing failed:', error);
      process.exit(1);
    });
}