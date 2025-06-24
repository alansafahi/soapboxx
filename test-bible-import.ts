/**
 * Test script to import ASV and WEB Bible translations
 */
import { DatabaseStorage } from './server/storage.js';

async function testBibleImport() {
  console.log('🔍 Testing Bible verse count retrieval...');
  
  const storage = new DatabaseStorage();
  
  try {
    // Test ASV count
    console.log('📊 Checking ASV verse count...');
    const asvCount = await storage.getVerseCount('ASV');
    console.log(`ASV verses: ${asvCount}`);
    
    // Test WEB count
    console.log('📊 Checking WEB verse count...');
    const webCount = await storage.getVerseCount('WEB');
    console.log(`WEB verses: ${webCount}`);
    
    // Test existing translation count
    console.log('📊 Checking NIV verse count for comparison...');
    const nivCount = await storage.getVerseCount('NIV');
    console.log(`NIV verses: ${nivCount}`);
    
    // Check if we can fetch a verse from bible-api.com
    console.log('🌐 Testing bible-api.com connectivity...');
    const response = await fetch('https://bible-api.com/john%203:16?translation=asv');
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testBibleImport();