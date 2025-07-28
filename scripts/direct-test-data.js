// Direct test data insertion using database
// Run with: node scripts/direct-test-data.js

import { db } from '../server/db.ts';
import { volunteers } from '../shared/schema.ts';

const testVolunteers = [
  {
    firstName: "Sarah",
    lastName: "Johnson", 
    email: "sarah.johnson@test.com",
    phone: "555-0101",
    address: "123 Main St, Cityville",
    skills: ["Teaching", "Music", "Children's Ministry"],
    interests: ["Youth Programs", "Worship"],
    userId: "test-user-1",
    communityId: 1,
    status: "active",
    backgroundCheckCompleted: true,
    backgroundCheckExpiry: "2025-12-15",
    backgroundCheckStatus: "approved"
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@test.com", 
    phone: "555-0102",
    address: "456 Oak Ave, Townsburg",
    skills: ["Audio/Visual", "Technology", "Setup"],
    interests: ["Media Ministry", "Technical Support"],
    userId: "test-user-2", 
    communityId: 1,
    status: "active",
    backgroundCheckCompleted: false,
    backgroundCheckStatus: "pending"
  },
  {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@test.com",
    phone: "555-0103",
    address: "789 Pine St, Villagetown", 
    skills: ["Hospitality", "Event Planning", "Cooking"],
    interests: ["Fellowship Events", "Community Outreach"],
    userId: "test-user-3",
    communityId: 1,
    status: "active",
    backgroundCheckCompleted: false,
    backgroundCheckStatus: "none"
  },
  {
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@test.com",
    phone: "555-0104",
    address: "321 Elm Dr, Hamletville",
    skills: ["Counseling", "Prayer", "Pastoral Care"], 
    interests: ["Support Ministry", "Prayer Team"],
    userId: "test-user-4",
    communityId: 1,
    status: "active",
    backgroundCheckCompleted: true,
    backgroundCheckExpiry: "2024-06-01",
    backgroundCheckStatus: "expired"
  },
  {
    firstName: "Jessica",
    lastName: "Williams",
    email: "jessica.williams@test.com",
    phone: "555-0105",
    address: "654 Maple Rd, Burgtown",
    skills: ["Administration", "Communication", "Organization"],
    interests: ["Office Support", "Communication Team"],
    userId: "test-user-5",
    communityId: 1,
    status: "active",
    backgroundCheckCompleted: true,
    backgroundCheckExpiry: "2025-02-28", // Expires soon
    backgroundCheckStatus: "approved"
  }
];

async function addDirectTestData() {
  console.log('🧪 Adding test volunteers directly to database...');
  
  try {
    for (const volunteer of testVolunteers) {
      const result = await db.insert(volunteers).values(volunteer).returning();
      console.log(`✅ Created volunteer: ${volunteer.firstName} ${volunteer.lastName} (ID: ${result[0].id})`);
    }
    
    console.log('\n🎉 Test volunteer data creation complete!');
    console.log('📊 Summary:');
    console.log(`   • ${testVolunteers.length} test volunteers created`);
    console.log(`   • Mix of background check statuses`);
    console.log(`   • Ready for cross-linking testing`);
    console.log('\n🗑️ To remove test data later, run: node scripts/remove-test-data.js');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addDirectTestData();
}

export { addDirectTestData };