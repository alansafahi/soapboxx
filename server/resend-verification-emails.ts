import { pool } from './db';
import { sendVerificationEmail } from './email-service';
import crypto from 'crypto';

interface UnverifiedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

async function resendVerificationEmails() {
  try {
    console.log('🔍 Finding unverified users...');
    
    // Get legitimate unverified users (excluding test/demo accounts)
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, created_at 
      FROM users 
      WHERE email_verified = false 
        AND email NOT LIKE '%@email.com' 
        AND email NOT LIKE 'test%'
        AND email NOT LIKE 'user_%'
        AND email NOT LIKE 'msg_user_%'
        AND email NOT LIKE 'member_%'
        AND first_name IS NOT NULL 
        AND first_name != ''
        AND created_at > '2025-06-20'
      ORDER BY created_at DESC;
    `);

    const unverifiedUsers: UnverifiedUser[] = result.rows;
    
    if (unverifiedUsers.length === 0) {
      console.log('✅ No legitimate unverified users found.');
      return;
    }

    console.log(`📋 Found ${unverifiedUsers.length} legitimate unverified users:`);
    
    for (const user of unverifiedUsers) {
      console.log(`   • ${user.first_name} ${user.last_name} (${user.email}) - registered ${user.created_at}`);
    }

    console.log('\n📧 Sending verification emails...\n');

    let sentCount = 0;
    let failedCount = 0;

    for (const user of unverifiedUsers) {
      try {
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Store verification token in database
        await pool.query(
          'UPDATE users SET email_verification_token = $1, email_verification_sent_at = NOW() WHERE id = $2',
          [verificationToken, user.id]
        );

        // Send verification email
        const result = await sendVerificationEmail({
          email: user.email,
          firstName: user.first_name || 'User',
          token: verificationToken
        });

        if (result.success) {
          console.log(`✅ ${user.first_name} ${user.last_name} (${user.email}) - Email sent successfully (ID: ${result.messageId})`);
          sentCount++;
        } else {
          console.log(`❌ ${user.first_name} ${user.last_name} (${user.email}) - Failed: ${result.error}`);
          failedCount++;
        }
      } catch (error) {
        console.log(`❌ ${user.first_name} ${user.last_name} (${user.email}) - Error: ${error}`);
        failedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully sent: ${sentCount} emails`);
    console.log(`   ❌ Failed to send: ${failedCount} emails`);
    console.log(`   📋 Total users processed: ${unverifiedUsers.length}`);

    return {
      users: unverifiedUsers,
      sentCount,
      failedCount
    };

  } catch (error) {
    console.error('💥 Error in resendVerificationEmails:', error);
    throw error;
  }
}

// Export for use in routes
export { resendVerificationEmails };

// Run directly if called as script
if (import.meta.url === `file://${process.argv[1]}`) {
  resendVerificationEmails()
    .then(() => {
      console.log('\n🎉 Verification email resend process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Process failed:', error);
      process.exit(1);
    });
}