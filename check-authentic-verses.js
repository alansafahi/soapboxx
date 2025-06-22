/**
 * Check Authentic Bible Verses Count
 * Analyzes current state of scripture database
 */

import { db } from "./server/db.ts";
import { bibleVerses } from "./shared/schema.ts";
import { sql, not, like, or } from "drizzle-orm";

async function checkAuthenticVerses() {
  console.log('📊 Analyzing SoapBox Bible Database...');
  
  try {
    // Total verses count
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(bibleVerses);
    const totalVerses = Number(totalResult[0].count);
    
    // Placeholder verses count
    const placeholderResult = await db
      .select({ count: sql`count(*)` })
      .from(bibleVerses)
      .where(
        or(
          like(bibleVerses.text, '%Scripture according to%'),
          like(bibleVerses.text, '%In those days it happened as recorded in%'),
          like(bibleVerses.text, '%placeholder%'),
          like(bibleVerses.text, '%Lorem ipsum%')
        )
      );
    const placeholderVerses = Number(placeholderResult[0].count);
    
    // Authentic verses count
    const authenticVerses = totalVerses - placeholderVerses;
    
    // Percentage authentic
    const authenticPercentage = ((authenticVerses / totalVerses) * 100).toFixed(2);
    
    console.log('📋 SOAPBOX BIBLE DATABASE STATUS:');
    console.log(`📖 Total verses: ${totalVerses.toLocaleString()}`);
    console.log(`✅ Authentic verses: ${authenticVerses.toLocaleString()}`);
    console.log(`⚠️  Placeholder verses: ${placeholderVerses.toLocaleString()}`);
    console.log(`📊 Authentic coverage: ${authenticPercentage}%`);
    
    // Get breakdown by translation
    console.log('\n📊 BREAKDOWN BY TRANSLATION:');
    
    const translations = ['KJV', 'NIV', 'NLT', 'ESV', 'NASB', 'CSB', 'MSG', 'AMP', 'CEV', 'NET', 'CEB', 'GNT', 'NKJV', 'RSV', 'NRSV', 'HCSB', 'NCV'];
    
    for (const translation of translations) {
      // Total for this translation
      const totalTransResult = await db
        .select({ count: sql`count(*)` })
        .from(bibleVerses)
        .where(sql`translation = ${translation}`);
      const totalTrans = Number(totalTransResult[0].count);
      
      // Placeholders for this translation
      const placeholderTransResult = await db
        .select({ count: sql`count(*)` })
        .from(bibleVerses)
        .where(
          sql`translation = ${translation} AND (
            text LIKE '%Scripture according to%' OR 
            text LIKE '%In those days it happened as recorded in%' OR 
            text LIKE '%placeholder%' OR 
            text LIKE '%Lorem ipsum%'
          )`
        );
      const placeholderTrans = Number(placeholderTransResult[0].count);
      
      const authenticTrans = totalTrans - placeholderTrans;
      const authPercent = totalTrans > 0 ? ((authenticTrans / totalTrans) * 100).toFixed(1) : '0.0';
      
      console.log(`${translation}: ${authenticTrans.toLocaleString()}/${totalTrans.toLocaleString()} authentic (${authPercent}%)`);
    }
    
    // Sample some recently added authentic verses
    console.log('\n📖 SAMPLE AUTHENTIC VERSES:');
    
    const sampleVerses = await db
      .select()
      .from(bibleVerses)
      .where(
        not(
          or(
            like(bibleVerses.text, '%Scripture according to%'),
            like(bibleVerses.text, '%In those days it happened as recorded in%'),
            like(bibleVerses.text, '%placeholder%'),
            like(bibleVerses.text, '%Lorem ipsum%')
          )
        )
      )
      .limit(10);
    
    for (const verse of sampleVerses) {
      console.log(`${verse.book} ${verse.chapter}:${verse.verse} (${verse.version}): "${verse.text.substring(0, 60)}..."`);
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

// Run the check
checkAuthenticVerses().catch(console.error);