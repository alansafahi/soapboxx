// Direct database test using the storage class
import { storage } from './server/storage.js';

async function testDirectDB() {
  try {
    console.log('Testing getUserCreatedChurches method directly...\n');
    
    const testUserId = 'xinjk1vlu2l';
    console.log(`Testing with user ID: ${testUserId}`);
    
    const churches = await storage.getUserCreatedChurches(testUserId);
    
    console.log(`\nResults:`);
    console.log(`Found ${churches.length} churches/communities`);
    
    if (churches.length > 0) {
      console.log('\nChurch details:');
      churches.forEach((church, index) => {
        console.log(`${index + 1}. ${church.name} (ID: ${church.id})`);
        console.log(`   Type: ${church.type}`);
        console.log(`   Status: ${church.verificationStatus}`);
        console.log(`   Created by: ${church.createdBy}`);
        console.log('');
      });
    }
    
    console.log('Direct database test completed successfully!');
    
  } catch (error) {
    console.error('Direct DB test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectDB();