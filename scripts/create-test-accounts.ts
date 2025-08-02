import { storage } from "../server/storage";
import bcrypt from "bcrypt";

const testPassword = "TestPass123!";

async function createTestAccounts() {
  console.log("Creating Comprehensive Test Accounts for Verification");
  console.log("=".repeat(60));
  console.log(`Password for ALL accounts: ${testPassword}`);
  console.log("");

  const hashedPassword = await bcrypt.hash(testPassword, 12);

  const accounts = [
    // Fresh accounts (never been in system, no verification)
    { email: 'fresh1@testverify.com', firstName: 'Fresh', lastName: 'User1', emailVerified: false, phoneVerified: false, phone: null },
    { email: 'fresh2@testverify.com', firstName: 'Fresh', lastName: 'User2', emailVerified: false, phoneVerified: false, phone: null },
    { email: 'fresh3@testverify.com', firstName: 'Fresh', lastName: 'User3', emailVerified: false, phoneVerified: false, phone: null },
    
    // Email verified only
    { email: 'emailonly@testverify.com', firstName: 'Email', lastName: 'Only', emailVerified: true, phoneVerified: false, phone: null },
    
    // SMS verified only  
    { email: 'smsonly@testverify.com', firstName: 'SMS', lastName: 'Only', emailVerified: false, phoneVerified: true, phone: '+15551234567' },
    
    // Both verified
    { email: 'bothverified@testverify.com', firstName: 'Both', lastName: 'Verified', emailVerified: true, phoneVerified: true, phone: '+15551234568' }
  ];

  for (const account of accounts) {
    try {
      console.log(`Creating ${account.email}...`);
      
      const username = account.email.split('@')[0] + '_' + Date.now();
      
      const user = await storage.createUser({
        email: account.email,
        username: username,
        firstName: account.firstName,
        lastName: account.lastName,
        password: hashedPassword,
        emailVerified: account.emailVerified,
        phoneVerified: account.phoneVerified,
        mobileNumber: account.phone,
        hasCompletedOnboarding: true,
        isDiscoverable: true
      });

      console.log(`✓ Created: ${account.email} (ID: ${user.id})`);
      console.log(`  Email Verified: ${account.emailVerified ? '✓' : '✗'}`);
      console.log(`  SMS Verified: ${account.phoneVerified ? '✓' : '✗'}`);
      console.log(`  Phone: ${account.phone || 'None'}`);
      console.log("");

    } catch (error) {
      console.error(`✗ Failed to create ${account.email}:`, error.message);
    }
  }

  console.log("=".repeat(60));
  console.log("COMPREHENSIVE TEST ACCOUNTS READY");
  console.log("=".repeat(60));
  console.log(`Password: ${testPassword}`);
  console.log("");
  
  console.log("🆕 FRESH ACCOUNTS (Never verified anything):");
  console.log("  fresh1@testverify.com");
  console.log("  fresh2@testverify.com");
  console.log("  fresh3@testverify.com");
  console.log("");
  
  console.log("📧 EMAIL VERIFIED ONLY:");
  console.log("  emailonly@testverify.com (Email ✓, SMS ✗)");
  console.log("");
  
  console.log("📱 SMS VERIFIED ONLY:");
  console.log("  smsonly@testverify.com (Email ✗, SMS ✓)");
  console.log("");
  
  console.log("✅ FULLY VERIFIED:");
  console.log("  bothverified@testverify.com (Email ✓, SMS ✓)");
  console.log("");
  
  console.log("Ready for comprehensive verification testing!");
  console.log("Test the SMS verification system with any of the fresh accounts!");
}

createTestAccounts().catch(console.error);