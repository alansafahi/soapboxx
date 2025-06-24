/**
 * Batch Bible Import Runner
 * Executes the efficient batch Bible import for ASV and WEB translations
 */

import { batchBibleImporter } from './batch-bible-import.js';

async function runBatchImport() {
  console.log('🚀 Starting efficient batch Bible import...');
  console.log('📋 Target translations: ASV (American Standard Version), WEB (World English Bible)');
  console.log('⚡ Using optimized batch processing to handle timeout constraints');
  
  try {
    // Check current status
    const asvCount = await batchBibleImporter.getVerseCount('ASV');
    const webCount = await batchBibleImporter.getVerseCount('WEB');
    
    console.log(`📊 Current status: ASV=${asvCount} verses, WEB=${webCount} verses`);
    
    const results = [];
    
    // Import ASV if not complete
    if (!await batchBibleImporter.isTranslationComplete('ASV')) {
      console.log('🔄 Starting ASV import...');
      const asvResult = await batchBibleImporter.importInBatches('ASV', 8);
      results.push(asvResult);
    } else {
    }
    
    // Import WEB if not complete
    if (!await batchBibleImporter.isTranslationComplete('WEB')) {
      console.log('🔄 Starting WEB import...');
      const webResult = await batchBibleImporter.importInBatches('WEB', 8);
      results.push(webResult);
    } else {
    }
    
    // Final status
    const finalAsvCount = await batchBibleImporter.getVerseCount('ASV');
    const finalWebCount = await batchBibleImporter.getVerseCount('WEB');
    
    console.log('\n🎉 Batch import completed!');
    console.log(`📊 Final status: ASV=${finalAsvCount} verses, WEB=${finalWebCount} verses`);
    
    results.forEach(result => {
    });
    
    if (finalAsvCount >= 31000 && finalWebCount >= 31000) {
      console.log('🎯 Both translations are now complete!');
    }
    
  } catch (error) {
    console.error('❌ Batch import failed:', error);
    process.exit(1);
  }
}

// Execute the import
runBatchImport();