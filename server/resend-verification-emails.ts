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
      return;
    }

    
    for (const user of unverifiedUsers) {
    }


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
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }


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
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Process failed:', error);
      process.exit(1);
    });
}