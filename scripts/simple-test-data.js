// Simple test data creation through available APIs
// Run with: node scripts/simple-test-data.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Simpler test volunteer data
const testVolunteers = [
  {
    firstName: "Sarah",
    lastName: "Johnson", 
    email: "sarah.johnson@test.com",
    phone: "555-0101",
    skills: ["Teaching", "Music"],
    interests: ["Youth Programs", "Worship"],
    backgroundCheckStatus: "approved",
    backgroundCheckExpiry: "2025-12-15"
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@test.com", 
    phone: "555-0102",
    skills: ["Technology", "Setup"],
    interests: ["Media Ministry"],
    backgroundCheckStatus: "pending"
  },
  {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@test.com",
    phone: "555-0103", 
    skills: ["Hospitality", "Event Planning"],
    interests: ["Fellowship Events"],
    backgroundCheckStatus: "none"
  },
  {
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@test.com",
    phone: "555-0104",
    skills: ["Counseling", "Prayer"], 
    interests: ["Support Ministry"],
    backgroundCheckStatus: "expired",
    backgroundCheckExpiry: "2024-06-01"
  },
  {
    firstName: "Jessica",
    lastName: "Williams",
    email: "jessica.williams@test.com",
    phone: "555-0105",
    skills: ["Administration", "Communication"],
    interests: ["Office Support"],
    backgroundCheckStatus: "approved",
    backgroundCheckExpiry: "2025-02-28" // Expires soon
  }
];

async function createSimpleTestData() {
  console.log('🧪 Creating simple test data for volunteer management testing...');
  
  try {
    // Try different volunteer API endpoints
    const endpoints = [
      '/api/volunteers',
      '/api/volunteer/create',
      '/api/volunteer-management/volunteers'
    ];
    
    let successfulEndpoint = null;
    
    for (const endpoint of endpoints) {
      console.log(`🔍 Testing endpoint: ${endpoint}`);
      
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testVolunteers[0]) // Test with first volunteer
        });
        
        const result = await response.text();
        
        if (response.ok) {
          console.log(`✅ Found working endpoint: ${endpoint}`);
          successfulEndpoint = endpoint;
          break;
        } else {
          console.log(`❌ Endpoint ${endpoint} failed: ${response.status} - ${result}`);
        }
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} error: ${error.message}`);
      }
    }
    
    if (!successfulEndpoint) {
      console.log('⚠️ No working volunteer API endpoints found');
      console.log('📝 Available options:');
      console.log('   • Use the volunteer management UI to manually add test volunteers');
      console.log('   • Check if volunteer management endpoints are properly registered');
      console.log('   • Use database migration or seed script');
      return;
    }
    
    // Create all test volunteers using the working endpoint
    console.log(`📝 Creating test volunteers using ${successfulEndpoint}...`);
    
    for (const volunteer of testVolunteers) {
      try {
        const response = await fetch(`${BASE_URL}${successfulEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(volunteer)
        });
        
        if (response.ok) {
          console.log(`✅ Created volunteer: ${volunteer.firstName} ${volunteer.lastName}`);
        } else {
          console.log(`❌ Failed to create volunteer: ${volunteer.firstName} ${volunteer.lastName}`);
        }
      } catch (error) {
        console.log(`❌ Error creating volunteer: ${volunteer.firstName} ${volunteer.lastName}`);
      }
    }
    
    console.log('\n🎉 Test data creation completed!');
    console.log('📊 Summary:');
    console.log(`   • Attempted to create ${testVolunteers.length} test volunteers`);
    console.log(`   • Mixed background check statuses for testing`);
    console.log(`   • Ready for cross-linking functionality testing`);
    console.log('\n🔍 Check the volunteer management interface to see results');
    console.log('🗑️ Test data can be removed using the volunteer management UI');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSimpleTestData();
}

export { createSimpleTestData };