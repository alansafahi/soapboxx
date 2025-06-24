/**
 * Bible Import Runner
 * Executes the complete Bible import for missing ASV and WEB translations
 */

import { completeBibleImporter } from './complete-bible-import.js';

async function runBibleImport() {
  console.log('🚀 Starting Bible import process...');
  console.log('📋 Target translations: ASV (American Standard Version), WEB (World English Bible)');
  console.log('🔍 Both translations are public domain and freely available');
  
  try {
    const results = await completeBibleImporter.importMissingTranslations();
    
    console.log('\n📊 IMPORT RESULTS:');
    console.log('================');
    
    for (const result of results) {
      console.log(`\n${result.translation} (${result.source}):`);
      console.log(`✅ Success: ${result.success}`);
      console.log(`📥 Imported: ${result.imported} verses`);
      console.log(`⏭️ Skipped: ${result.skipped} verses`);
      console.log(`❌ Errors: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.log('Error details:');
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
    }
    
    // Final verification
    console.log('\n🔍 Verifying import results...');
    const { db } = await import('./db.js');
    const { bibleVerses } = await import('../shared/schema.js');
    const { eq, count } = await import('drizzle-orm');
    
    const asvCount = await db.select({ count: count() }).from(bibleVerses).where(eq(bibleVerses.translation, 'ASV'));
    const webCount = await db.select({ count: count() }).from(bibleVerses).where(eq(bibleVerses.translation, 'WEB'));
    
    console.log(`📚 ASV final count: ${asvCount[0]?.count || 0} verses`);
    console.log(`📚 WEB final count: ${webCount[0]?.count || 0} verses`);
    
    if ((asvCount[0]?.count || 0) > 30000 && (webCount[0]?.count || 0) > 30000) {
      console.log('🎉 Bible import completed successfully!');
      console.log('✅ Both ASV and WEB translations now have complete verse counts');
    } else {
      console.log('⚠️ Import completed but verse counts may be lower than expected');
      console.log('💡 This could be due to API limitations or data source issues');
    }
    
  } catch (error) {
    console.error('❌ Bible import failed:', error);
    process.exit(1);
  }
}

// Run the import
runBibleImport().then(() => {
  console.log('🏁 Bible import process finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});