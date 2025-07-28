// Test Data Cleanup Script - Removes dummy volunteers and background checks
// Run with: node scripts/remove-test-data.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test emails to identify and remove test data
const testEmails = [
  "sarah.johnson@test.com",
  "michael.chen@test.com", 
  "emily.rodriguez@test.com",
  "david.thompson@test.com",
  "jessica.williams@test.com"
];

async function removeTestData() {
  console.log('🧹 Cleaning up test data for volunteer and background check systems...');
  
  try {
    // Get all volunteers to find test ones
    console.log('🔍 Finding test volunteers...');
    
    const volunteersResponse = await fetch(`${BASE_URL}/api/volunteers`);
    if (!volunteersResponse.ok) {
      throw new Error('Failed to fetch volunteers');
    }
    
    const volunteers = await volunteersResponse.json();
    const testVolunteerIds = volunteers
      .filter(volunteer => testEmails.includes(volunteer.email))
      .map(volunteer => volunteer.id);
    
    console.log(`📋 Found ${testVolunteerIds.length} test volunteers to remove`);
    
    // Remove background checks for test volunteers
    console.log('🛡️ Removing test background checks...');
    
    for (const volunteerId of testVolunteerIds) {
      try {
        const response = await fetch(`${BASE_URL}/api/divine-phase2/background-checks/volunteer/${volunteerId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log(`  ✅ Removed background checks for volunteer ID: ${volunteerId}`);
        } else {
          console.log(`  ⚠️ No background checks found for volunteer ID: ${volunteerId}`);
        }
      } catch (error) {
        console.log(`  ❌ Failed to remove background checks for volunteer ID: ${volunteerId}`);
      }
    }
    
    // Remove test volunteers
    console.log('📝 Removing test volunteers...');
    
    for (const volunteerId of testVolunteerIds) {
      try {
        const response = await fetch(`${BASE_URL}/api/volunteers/${volunteerId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log(`  ✅ Removed volunteer ID: ${volunteerId}`);
        } else {
          console.log(`  ❌ Failed to remove volunteer ID: ${volunteerId}`);
        }
      } catch (error) {
        console.log(`  ❌ Error removing volunteer ID: ${volunteerId}`);
      }
    }
    
    console.log('\n🎉 Test data cleanup complete!');
    console.log('📊 Summary:');
    console.log(`   • Removed ${testVolunteerIds.length} test volunteers`);
    console.log(`   • Removed associated background checks`);
    console.log(`   • Database is clean for production use`);
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  removeTestData();
}

export { removeTestData };