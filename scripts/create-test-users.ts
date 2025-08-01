import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users, communities, userCommunities } from "../shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Test users configuration
const testPassword = "TestPass123!";
const hashedPassword = await bcrypt.hash(testPassword, 12);

const testUsers = [
  // Member role - all verification stages
  {
    email: "member.new@soapboxtest.com",
    username: "member_new",
    firstName: "Alex",
    lastName: "Member",
    role: "Member",
    description: "Completely new member - no verification",
    emailVerified: false,
    phoneVerified: false,
    mobileNumber: null
  },
  {
    email: "member.email@soapboxtest.com", 
    username: "member_email",
    firstName: "Jordan",
    lastName: "EmailMember",
    role: "Member",
    description: "Member with email verification only",
    emailVerified: true,
    phoneVerified: false,
    mobileNumber: null
  },
  {
    email: "member.sms@soapboxtest.com",
    username: "member_sms", 
    firstName: "Casey",
    lastName: "SMSMember",
    role: "Member",
    description: "Member with SMS verification only",
    emailVerified: false,
    phoneVerified: true,
    mobileNumber: "+15551234567"
  },
  
  // Church Leader role - all verification stages
  {
    email: "leader.new@soapboxtest.com",
    username: "leader_new",
    firstName: "Morgan",
    lastName: "Leader",
    role: "Pastor",
    description: "New church leader - no verification",
    emailVerified: false,
    phoneVerified: false,
    mobileNumber: null
  },
  {
    email: "leader.email@soapboxtest.com",
    username: "leader_email", 
    firstName: "Taylor",
    lastName: "EmailLeader",
    role: "Pastor",
    description: "Church leader with email verification only",
    emailVerified: true,
    phoneVerified: false,
    mobileNumber: null
  },
  {
    email: "leader.sms@soapboxtest.com",
    username: "leader_sms",
    firstName: "River",
    lastName: "SMSLeader", 
    role: "Pastor",
    description: "Church leader with SMS verification only",
    emailVerified: false,
    phoneVerified: true,
    mobileNumber: "+15551234568"
  },
  
  // Volunteer role - all verification stages
  {
    email: "volunteer.new@soapboxtest.com",
    username: "volunteer_new",
    firstName: "Sage",
    lastName: "Volunteer",
    role: "Member", // Base role, volunteer status in community
    description: "New volunteer - no verification",
    emailVerified: false,
    phoneVerified: false,
    mobileNumber: null
  },
  {
    email: "volunteer.email@soapboxtest.com",
    username: "volunteer_email",
    firstName: "Avery", 
    lastName: "EmailVolunteer",
    role: "Member",
    description: "Volunteer with email verification only",
    emailVerified: true,
    phoneVerified: false,
    mobileNumber: null
  },
  {
    email: "volunteer.sms@soapboxtest.com",
    username: "volunteer_sms",
    firstName: "Quinn",
    lastName: "SMSVolunteer",
    role: "Member", 
    description: "Volunteer with SMS verification only",
    emailVerified: false,
    phoneVerified: true,
    mobileNumber: "+15551234569"
  }
];

async function createTestUsers() {
  console.log("Creating comprehensive test users...");
  console.log(`Password for all test users: ${testPassword}`);
  console.log("=".repeat(50));

  try {
    // Get or create a test community
    let testCommunity = await db.select().from(communities).where(eq(communities.name, "Test Community")).limit(1);
    
    if (testCommunity.length === 0) {
      console.log("Creating test community...");
      const [community] = await db.insert(communities).values({
        name: "Test Community",
        description: "Test community for verification testing",
        denominationTradition: "Non-denominational",
        address: "123 Test Street",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        country: "USA",
        isVerified: true,
        verificationStatus: "approved",
        createdBy: "system"
      }).returning();
      testCommunity = [community];
    }

    const communityId = testCommunity[0].id;

    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.email} (${userData.description})`);
      
      // Create user
      const [user] = await db.insert(users).values({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        emailVerified: userData.emailVerified,
        phoneVerified: userData.phoneVerified,
        mobileNumber: userData.mobileNumber,
        emailVerificationToken: userData.emailVerified ? null : crypto.randomBytes(32).toString('hex'),
        emailVerificationSentAt: userData.emailVerified ? null : new Date(),
        hasCompletedOnboarding: true,
        isDiscoverable: true,
        profileComplete: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Add user to community with appropriate role
      await db.insert(userCommunities).values({
        userId: user.id,
        communityId: communityId,
        role: userData.role,
        isActive: true,
        joinedAt: new Date()
      });

      console.log(`  ✓ User created with ID: ${user.id}`);
      console.log(`    Email: ${userData.email}`);
      console.log(`    Role: ${userData.role}`);
      console.log(`    Email Verified: ${userData.emailVerified}`);
      console.log(`    Phone Verified: ${userData.phoneVerified}`);
      console.log(`    Mobile: ${userData.mobileNumber || 'None'}`);
      console.log("");
    }

    console.log("=".repeat(50));
    console.log("TEST USER CREDENTIALS SUMMARY");
    console.log("=".repeat(50));
    console.log(`Common Password: ${testPassword}`);
    console.log("");
    
    console.log("MEMBER ROLE:");
    console.log("  Completely New: member.new@soapboxtest.com");
    console.log("  Email Only: member.email@soapboxtest.com");
    console.log("  SMS Only: member.sms@soapboxtest.com");
    console.log("");
    
    console.log("CHURCH LEADER ROLE:");
    console.log("  Completely New: leader.new@soapboxtest.com");
    console.log("  Email Only: leader.email@soapboxtest.com");
    console.log("  SMS Only: leader.sms@soapboxtest.com");
    console.log("");
    
    console.log("VOLUNTEER ROLE:");
    console.log("  Completely New: volunteer.new@soapboxtest.com");
    console.log("  Email Only: volunteer.email@soapboxtest.com");
    console.log("  SMS Only: volunteer.sms@soapboxtest.com");
    console.log("");
    
    console.log("All users are ready for comprehensive verification testing!");

  } catch (error) {
    console.error("Error creating test users:", error);
    throw error;
  }
}

createTestUsers().catch(console.error);