import { storage } from "../server/storage";
import bcrypt from "bcrypt";

// Test password for all users
const testPassword = "TestPass123!";

// Test users data
const testUsers = [
  // Member role - all verification stages
  { email: "member.new@soapboxtest.com", firstName: "Alex", lastName: "Member", role: "Member", emailVerified: false, phoneVerified: false, phone: null },
  { email: "member.email@soapboxtest.com", firstName: "Jordan", lastName: "EmailMember", role: "Member", emailVerified: true, phoneVerified: false, phone: null },
  { email: "member.sms@soapboxtest.com", firstName: "Casey", lastName: "SMSMember", role: "Member", emailVerified: false, phoneVerified: true, phone: "+15551234567" },
  
  // Church Leader role - all verification stages
  { email: "leader.new@soapboxtest.com", firstName: "Morgan", lastName: "Leader", role: "Pastor", emailVerified: false, phoneVerified: false, phone: null },
  { email: "leader.email@soapboxtest.com", firstName: "Taylor", lastName: "EmailLeader", role: "Pastor", emailVerified: true, phoneVerified: false, phone: null },
  { email: "leader.sms@soapboxtest.com", firstName: "River", lastName: "SMSLeader", role: "Pastor", emailVerified: false, phoneVerified: true, phone: "+15551234568" },
  
  // Volunteer role - all verification stages
  { email: "volunteer.new@soapboxtest.com", firstName: "Sage", lastName: "Volunteer", role: "Member", emailVerified: false, phoneVerified: false, phone: null },
  { email: "volunteer.email@soapboxtest.com", firstName: "Avery", lastName: "EmailVolunteer", role: "Member", emailVerified: true, phoneVerified: false, phone: null },
  { email: "volunteer.sms@soapboxtest.com", firstName: "Quinn", lastName: "SMSVolunteer", role: "Member", emailVerified: false, phoneVerified: true, phone: "+15551234569" }
];

async function createTestUsers() {
  
  
  

  const hashedPassword = await bcrypt.hash(testPassword, 12);

  for (const userData of testUsers) {
    try {
      
      
      // Generate username from email
      const username = userData.email.split('@')[0].replace('.', '_');
      
      // Create user with storage interface
      const user = await storage.createUser({
        email: userData.email,
        username: username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        emailVerified: userData.emailVerified,
        phoneVerified: userData.phoneVerified,
        mobileNumber: userData.phone,
        hasCompletedOnboarding: true,
        isDiscoverable: true
      });

      
      
      
      
      
      

    } catch (error) {
      
    }
  }

  
  
  
  
  
  
  
    
  
  
  
  
  
  
  
  
  
  
  
  
  
}

createTestUsers().catch(console.error);