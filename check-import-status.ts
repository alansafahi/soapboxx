/**
 * Check current Bible import status
 */
import { DatabaseStorage } from './server/storage.js';

async function checkStatus() {
  const storage = new DatabaseStorage();
  
  console.log('📊 Current Bible Translation Status:');
  
  const translations = ['ASV', 'WEB', 'NIV', 'KJV', 'ESV'];
  
  for (const translation of translations) {
    try {
      const count = await storage.getVerseCount(translation);
      console.log(`${translation}: ${count.toLocaleString()} verses`);
    } catch (error) {
      console.log(`${translation}: Error checking count`);
    }
  }
}

checkStatus();