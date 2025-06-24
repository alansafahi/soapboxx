/**
 * Optimized Bible Translation Importer
 * Imports ASV and WEB translations using chunked batch processing
 */
import { BibleAPIImporter } from './server/bible-api-importer.js';

async function importMissingTranslations() {
  console.log('🚀 Starting optimized Bible translation import...');
  
  const importer = new BibleAPIImporter();
  
  // Import ASV (American Standard Version)
  console.log('\n📖 Importing ASV (American Standard Version)...');
  try {
    const asvResult = await importer.importTranslation('ASV');
    console.log(`✅ ASV Import Complete: ${asvResult.totalVerses} verses imported`);
  } catch (error) {
    console.error('❌ ASV Import Failed:', error);
  }
  
  // Import WEB (World English Bible)
  console.log('\n📖 Importing WEB (World English Bible)...');
  try {
    const webResult = await importer.importTranslation('WEB');
    console.log(`✅ WEB Import Complete: ${webResult.totalVerses} verses imported`);
  } catch (error) {
    console.error('❌ WEB Import Failed:', error);
  }
  
  console.log('\n🎉 Bible translation import process completed!');
  process.exit(0);
}

importMissingTranslations();