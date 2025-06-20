/**
 * Authentic Bible API Integration System
 * Uses legitimate, free Bible APIs to populate authentic scripture content
 * Cost-effective solution using public domain and freely available Bible texts
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fetch from 'node-fetch';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Free Bible APIs for authentic content
const BIBLE_APIS = {
  // Bible API (free, no key required)
  bibleApi: 'https://bible-api.com',
  
  // ESV API (free tier available)
  esvApi: 'https://api.esv.org/v3/passage/text',
  
  // Bible Gateway (scraping approach for public domain versions)
  bibleGateway: 'https://www.biblegateway.com/passage/',
  
  // API.Bible (free tier with registration)
  apiBible: 'https://api.scripture.api.bible/v1'
};

// Translation mapping to free sources
const FREE_TRANSLATION_SOURCES = {
  'KJV': { source: 'bible-api', version: 'kjv' },
  'WEB': { source: 'bible-api', version: 'web' }, // World English Bible (public domain)
  'ASV': { source: 'bible-api', version: 'asv' }, // American Standard Version (public domain)
  'ESV': { source: 'esv-api', version: 'ESV' },
  'NIV': { source: 'api-bible', version: 'de4e12af7f28f599-02' }, // Free tier
  'NLT': { source: 'api-bible', version: 'de4e12af7f28f599-01' }
};

/**
 * Fetch authentic Bible verse from Bible API (free, no key required)
 */
async function fetchFromBibleApi(reference, version = 'kjv') {
  try {
    const url = `${BIBLE_APIS.bibleApi}/${reference}?translation=${version}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Bible API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.verses && data.verses.length > 0) {
      return {
        text: data.verses[0].text.trim(),
        reference: data.reference,
        translation: version.toUpperCase()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching from Bible API:`, error);
    return null;
  }
}

/**
 * Fetch multiple verses efficiently
 */
async function fetchBibleChapter(book, chapter, version = 'kjv') {
  try {
    const reference = `${book} ${chapter}`;
    const url = `${BIBLE_APIS.bibleApi}/${reference}?translation=${version}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Bible API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.verses && data.verses.length > 0) {
      return data.verses.map(verse => ({
        text: verse.text.trim(),
        reference: `${book} ${chapter}:${verse.verse}`,
        translation: version.toUpperCase(),
        book: book,
        chapter: chapter,
        verse: verse.verse
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching chapter from Bible API:`, error);
    return [];
  }
}

/**
 * Get all Bible books and their chapter counts
 */
function getBibleStructure() {
  return {
    // Old Testament
    'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
    'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
    '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
    'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
    'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
    'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
    'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4,
    'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
    'Zechariah': 14, 'Malachi': 4,
    
    // New Testament
    'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
    'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6,
    'Ephesians': 6, 'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5,
    '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3,
    'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3,
    '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
  };
}

/**
 * Replace placeholder content with authentic Bible verses
 */
async function replaceWithAuthenticVerses() {
  console.log('🔄 Starting authentic Bible verse replacement using free APIs...');
  
  const bibleStructure = getBibleStructure();
  const freeVersions = ['kjv', 'web', 'asv']; // Public domain versions
  let totalUpdated = 0;
  
  try {
    for (const [book, chapters] of Object.entries(bibleStructure)) {
      console.log(`📖 Processing ${book} (${chapters} chapters)...`);
      
      for (let chapter = 1; chapter <= chapters; chapter++) {
        console.log(`  📄 Chapter ${chapter}...`);
        
        for (const version of freeVersions) {
          try {
            // Fetch entire chapter at once for efficiency
            const verses = await fetchBibleChapter(book, chapter, version);
            
            if (verses.length > 0) {
              // Prepare batch update
              const updatePromises = verses.map(async (verse) => {
                const updateQuery = `
                  UPDATE bible_verses 
                  SET text = $1
                  WHERE reference = $2 AND translation = $3
                  AND (text LIKE '%according to%' OR text LIKE '%as recorded in%' OR text LIKE '%as written in%')
                `;
                
                return pool.query(updateQuery, [
                  verse.text,
                  verse.reference,
                  verse.translation
                ]);
              });
              
              await Promise.all(updatePromises);
              totalUpdated += verses.length;
              console.log(`    ✅ Updated ${verses.length} verses for ${version.toUpperCase()}`);
            }
            
            // Rate limiting - small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.error(`    ❌ Error processing ${book} ${chapter} (${version}):`, error.message);
          }
        }
        
        // Longer delay between chapters to be respectful to API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`🎉 Completed authentic Bible replacement!`);
    console.log(`📊 Total verses updated: ${totalUpdated}`);
    
    // Final verification
    const placeholderCheck = await pool.query(`
      SELECT COUNT(*) as remaining_placeholders
      FROM bible_verses 
      WHERE text LIKE '%according to%' 
         OR text LIKE '%as recorded in%' 
         OR text LIKE '%as written in%'
    `);
    
    const authenticCheck = await pool.query(`
      SELECT COUNT(*) as authentic_verses
      FROM bible_verses 
      WHERE text NOT LIKE '%according to%' 
        AND text NOT LIKE '%as recorded in%' 
        AND text NOT LIKE '%as written in%'
        AND length(text) > 20
    `);
    
    console.log(`🔍 Verification Results:`);
    console.log(`   Remaining placeholders: ${placeholderCheck.rows[0].remaining_placeholders}`);
    console.log(`   Authentic verses: ${authenticCheck.rows[0].authentic_verses}`);
    
  } catch (error) {
    console.error('❌ Fatal error during authentic Bible replacement:', error);
    throw error;
  }
}

/**
 * Populate specific high-priority verses first
 */
async function populateHighPriorityVerses() {
  console.log('🎯 Populating high-priority verses with authentic content...');
  
  const highPriorityVerses = [
    'Genesis 1:1', 'Genesis 1:27', 'Exodus 20:3', 'Deuteronomy 6:4',
    'Psalm 23:1', 'Psalm 23:4', 'Psalm 119:105', 'Proverbs 3:5',
    'Isaiah 40:31', 'Jeremiah 29:11', 'Matthew 5:16', 'Matthew 28:19',
    'John 3:16', 'John 14:6', 'Romans 3:23', 'Romans 6:23',
    'Romans 8:28', 'Ephesians 2:8', 'Philippians 4:13', 'Philippians 4:19',
    '2 Timothy 3:16', 'Hebrews 11:1', '1 John 1:9', 'Revelation 21:4'
  ];
  
  let updated = 0;
  
  for (const reference of highPriorityVerses) {
    try {
      const verse = await fetchFromBibleApi(reference, 'kjv');
      
      if (verse) {
        await pool.query(`
          UPDATE bible_verses 
          SET text = $1
          WHERE reference = $2 AND translation = 'KJV'
        `, [verse.text, reference]);
        
        console.log(`✅ Updated ${reference}: "${verse.text.substring(0, 50)}..."`);
        updated++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error updating ${reference}:`, error.message);
    }
  }
  
  console.log(`🎯 High-priority verses updated: ${updated}/${highPriorityVerses.length}`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Authentic Bible API Integration');
    console.log('💰 Using free, legitimate Bible APIs for cost-effective implementation');
    
    // Start with high-priority verses
    await populateHighPriorityVerses();
    
    // Then process the complete Bible
    await replaceWithAuthenticVerses();
    
    // Final status report
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total_verses,
        COUNT(DISTINCT reference) as unique_references,
        COUNT(DISTINCT book) as books_covered,
        COUNT(DISTINCT translation) as translations_covered,
        COUNT(*) FILTER (WHERE text NOT LIKE '%according to%' AND text NOT LIKE '%as recorded in%' AND text NOT LIKE '%as written in%' AND length(text) > 20) as authentic_verses
      FROM bible_verses
    `);
    
    const stats = finalStats.rows[0];
    console.log('📊 FINAL STATUS REPORT:');
    console.log(`   Total verses: ${stats.total_verses}`);
    console.log(`   Unique references: ${stats.unique_references}`);
    console.log(`   Books covered: ${stats.books_covered}/66`);
    console.log(`   Translations: ${stats.translations_covered}/17`);
    console.log(`   Authentic verses: ${stats.authentic_verses}`);
    console.log(`   Authentication rate: ${((stats.authentic_verses / stats.total_verses) * 100).toFixed(2)}%`);
    
    console.log('✅ Authentic Bible API Integration completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error in main execution:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { replaceWithAuthenticVerses, populateHighPriorityVerses, fetchFromBibleApi };