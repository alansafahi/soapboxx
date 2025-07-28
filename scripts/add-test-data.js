// Test Data Script - Creates dummy volunteers and background checks for testing
// Run with: node scripts/add-test-data.js
// Remove with: node scripts/remove-test-data.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test volunteers data
const testVolunteers = [
  {
    firstName: "Sarah",
    lastName: "Johnson", 
    email: "sarah.johnson@test.com",
    phone: "555-0101",
    skills: ["Teaching", "Music", "Children's Ministry"],
    interests: ["Youth Programs", "Worship"],
    status: "active",
    userId: "test-user-1",
    churchId: 1,
    backgroundCheck: true,
    orientation: true,
    backgroundCheckStatus: "approved",
    backgroundCheckExpiry: "2025-12-15"
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@test.com", 
    phone: "555-0102",
    skills: ["Audio/Visual", "Technology", "Setup"],
    interests: ["Media Ministry", "Technical Support"],
    status: "active",
    userId: "test-user-2", 
    churchId: 1,
    backgroundCheck: true,
    orientation: true,
    backgroundCheckStatus: "pending",
    backgroundCheckExpiry: null
  },
  {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@test.com",
    phone: "555-0103", 
    skills: ["Hospitality", "Event Planning", "Cooking"],
    interests: ["Fellowship Events", "Community Outreach"],
    status: "active",
    userId: "test-user-3",
    churchId: 1,
    backgroundCheck: false,
    orientation: true,
    backgroundCheckStatus: "none",
    backgroundCheckExpiry: null
  },
  {
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@test.com",
    phone: "555-0104",
    skills: ["Counseling", "Prayer", "Pastoral Care"], 
    interests: ["Support Ministry", "Prayer Team"],
    status: "active",
    userId: "test-user-4",
    churchId: 1,
    backgroundCheck: true,
    orientation: true,
    backgroundCheckStatus: "expired",
    backgroundCheckExpiry: "2024-06-01"
  },
  {
    firstName: "Jessica",
    lastName: "Williams",
    email: "jessica.williams@test.com",
    phone: "555-0105",
    skills: ["Administration", "Communication", "Organization"],
    interests: ["Office Support", "Communication Team"],
    status: "active", 
    userId: "test-user-5",
    churchId: 1,
    backgroundCheck: true,
    orientation: true,
    backgroundCheckStatus: "approved",
    backgroundCheckExpiry: "2025-02-28" // Expires soon
  }
];

// Test background checks data
const testBackgroundChecks = [
  {
    volunteerId: 1, // Sarah Johnson
    provider: "MinistrySafe",
    externalId: "MS-12345",
    checkType: "comprehensive",
    status: "approved",
    requestedAt: "2024-12-15",
    completedAt: "2024-12-20",
    expiresAt: "2025-12-15",
    cost: "$25.00",
    notes: "Standard background check completed successfully"
  },
  {
    volunteerId: 2, // Michael Chen  
    provider: "Checkr",
    externalId: "CHK-67890",
    checkType: "basic",
    status: "pending",
    requestedAt: "2025-01-15",
    completedAt: null,
    expiresAt: "2026-01-15",
    cost: "$15.00", 
    notes: "Background check in progress"
  },
  {
    volunteerId: 4, // David Thompson
    provider: "MinistrySafe",
    externalId: "MS-11111",
    checkType: "comprehensive",
    status: "expired",
    requestedAt: "2023-06-01",
    completedAt: "2023-06-05", 
    expiresAt: "2024-06-01",
    cost: "$25.00",
    notes: "Background check expired, renewal needed"
  },
  {
    volunteerId: 5, // Jessica Williams
    provider: "Checkr", 
    externalId: "CHK-22222",
    checkType: "comprehensive",
    status: "approved",
    requestedAt: "2024-02-15",
    completedAt: "2024-02-28",
    expiresAt: "2025-02-28",
    cost: "$25.00",
    notes: "Expires within 30 days - renewal needed soon"
  }
];

async function addTestData() {
  console.log('🧪 Adding test data for volunteer and background check systems...');
  
  try {
    // Add test volunteers
    console.log('📝 Creating test volunteers...');
    const volunteerIds = [];
    
    for (const volunteer of testVolunteers) {
      const response = await fetch(`${BASE_URL}/api/volunteers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(volunteer)
      });
      
      if (response.ok) {
        const result = await response.json();
        volunteerIds.push(result.id);
        console.log(`  ✅ Created volunteer: ${volunteer.firstName} ${volunteer.lastName}`);
      } else {
        console.log(`  ❌ Failed to create volunteer: ${volunteer.firstName} ${volunteer.lastName}`);
      }
    }
    
    // Add test background checks
    console.log('🛡️ Creating test background checks...');
    
    for (const [index, backgroundCheck] of testBackgroundChecks.entries()) {
      // Map to actual volunteer IDs if available
      const actualVolunteerId = volunteerIds[backgroundCheck.volunteerId - 1] || backgroundCheck.volunteerId;
      
      const response = await fetch(`${BASE_URL}/api/divine-phase2/background-checks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...backgroundCheck,
          volunteerId: actualVolunteerId
        })
      });
      
      if (response.ok) {
        console.log(`  ✅ Created background check for volunteer ID: ${actualVolunteerId}`);
      } else {
        console.log(`  ❌ Failed to create background check for volunteer ID: ${actualVolunteerId}`);
      }
    }
    
    console.log('\n🎉 Test data creation complete!');
    console.log('📊 Summary:');
    console.log(`   • ${testVolunteers.length} test volunteers`);
    console.log(`   • ${testBackgroundChecks.length} test background checks`);
    console.log(`   • Mix of statuses: approved, pending, expired, none`);
    console.log(`   • Includes expiring checks for testing notifications`);
    console.log('\n🗑️ To remove test data later, run: node scripts/remove-test-data.js');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addTestData();
}

export { addTestData, testVolunteers, testBackgroundChecks };