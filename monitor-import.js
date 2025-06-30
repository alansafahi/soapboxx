import { db } from './server/db.js';
import { soapboxBible, bibleVerses } from './shared/schema.js';
import { count } from 'drizzle-orm';

async function monitorImport() {
  console.log('📊 Monitoring Bible verse import progress...\n');
  
  for (let i = 0; i < 30; i++) { // Monitor for 5 minutes (30 x 10 seconds)
    try {
      // Check soapbox_bible table (where imports go)
      const soapboxCount = await db.select({ count: count() }).from(soapboxBible);
      const soapboxTotal = Number(soapboxCount[0]?.count || 0);
      
      // Check bible_verses table (existing verses)
      const bibleCount = await db.select({ count: count() }).from(bibleVerses);
      const bibleTotal = Number(bibleCount[0]?.count || 0);
      
      // Check translations in soapbox_bible
      const translationCounts = await db
        .select({ 
          translation: soapboxBible.translation,
          count: count()
        })
        .from(soapboxBible)
        .groupBy(soapboxBible.translation);
      
      console.log(`🔄 Progress Check ${i + 1}:`);
      console.log(`   SoapBox Bible: ${soapboxTotal} verses`);
      console.log(`   Bible Verses: ${bibleTotal} verses`);
      console.log(`   Total Combined: ${soapboxTotal + bibleTotal} verses`);
      console.log(`   Goal: 1,000 verses`);
      
      if (translationCounts.length > 0) {
        console.log('   Translations in SoapBox Bible:');
        translationCounts.forEach(t => {
          console.log(`     ${t.translation}: ${t.count} verses`);
        });
      }
      
      const totalProgress = soapboxTotal + bibleTotal;
      const percentComplete = ((totalProgress / 1000) * 100).toFixed(1);
      console.log(`   Progress: ${percentComplete}% complete\n`);
      
      if (totalProgress >= 1000) {
        console.log('🎉 Import goal reached! 1,000+ verses available.');
        break;
      }
      
      // Wait 10 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 10000));
      
    } catch (error) {
      console.error('Error monitoring import:', error);
      break;
    }
  }
  
  console.log('📊 Monitoring complete.');
}

monitorImport().catch(console.error);