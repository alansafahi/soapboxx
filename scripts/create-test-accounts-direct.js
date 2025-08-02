// Direct database creation of test accounts with proper verification states
const bcrypt = require('bcrypt');

const testPassword = "TestPass123!";

async function createTestAccountsDirect() {
  console.log("Creating Test Accounts Directly in Database");
  console.log("=".repeat(60));
  
  const hashedPassword = await bcrypt.hash(testPassword, 12);
  
  // First, clean up any existing test accounts
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();
  
  try {
    // Delete existing test accounts
    await client.query(`
      DELETE FROM users 
      WHERE email LIKE '%testverify.com'
    `);
    console.log("Cleaned up existing test accounts");
    
    // Create fresh accounts
    const accounts = [
      // Completely fresh accounts
      {
        email: 'fresh1@testverify.com',
        firstName: 'Fresh',
        lastName: 'User1',
        emailVerified: false,
        phoneVerified: false,
        phone: null
      },
      {
        email: 'fresh2@testverify.com', 
        firstName: 'Fresh',
        lastName: 'User2',
        emailVerified: false,
        phoneVerified: false,
        phone: null
      },
      {
        email: 'fresh3@testverify.com',
        firstName: 'Fresh', 
        lastName: 'User3',
        emailVerified: false,
        phoneVerified: false,
        phone: null
      },
      // Email verified only
      {
        email: 'emailonly@testverify.com',
        firstName: 'Email',
        lastName: 'Only', 
        emailVerified: true,
        phoneVerified: false,
        phone: null
      },
      // SMS verified only
      {
        email: 'smsonly@testverify.com',
        firstName: 'SMS',
        lastName: 'Only',
        emailVerified: false,
        phoneVerified: true,
        phone: '+15551234567'
      },
      // Both verified
      {
        email: 'bothverified@testverify.com',
        firstName: 'Both',
        lastName: 'Verified',
        emailVerified: true,
        phoneVerified: true,
        phone: '+15551234568'
      }
    ];
    
    for (const account of accounts) {
      const username = account.email.split('@')[0] + '_' + Date.now();
      
      await client.query(`
        INSERT INTO users (
          email, username, first_name, last_name, password,
          email_verified, phone_verified, mobile_number,
          has_completed_onboarding, is_discoverable, role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, 'member')
      `, [
        account.email,
        username,
        account.firstName,
        account.lastName,
        hashedPassword,
        account.emailVerified,
        account.phoneVerified,
        account.phone
      ]);
      
      console.log(`✓ Created: ${account.email} (Email: ${account.emailVerified ? '✓' : '✗'}, SMS: ${account.phoneVerified ? '✓' : '✗'})`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("TEST ACCOUNTS CREATED SUCCESSFULLY");
    console.log("=".repeat(60));
    console.log(`Password for ALL: ${testPassword}`);
    console.log("");
    console.log("FRESH ACCOUNTS (No verification):");
    console.log("  fresh1@testverify.com");
    console.log("  fresh2@testverify.com");  
    console.log("  fresh3@testverify.com");
    console.log("");
    console.log("PARTIAL VERIFICATION:");
    console.log("  emailonly@testverify.com (Email ✓, SMS ✗)");
    console.log("  smsonly@testverify.com (Email ✗, SMS ✓)");
    console.log("");
    console.log("FULL VERIFICATION:");
    console.log("  bothverified@testverify.com (Email ✓, SMS ✓)");
    console.log("");
    console.log("Ready for testing!");
    
  } catch (error) {
    console.error('Error creating accounts:', error);
  } finally {
    await client.end();
  }
}

createTestAccountsDirect().catch(console.error);