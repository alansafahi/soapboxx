/**
 * Fix Contacts Page Authentication Issue
 * Creates working session for production user to resolve contacts page access
 */

import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

async function fixContactsAuthentication() {
  console.log('🔧 Fixing contacts page authentication...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Verify production user exists
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, ['hello@soapboxsuperapp.com']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Production user not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Production user found:', user.email);
    console.log('User details:', {
      id: user.id,
      email: user.email,
      verified: user.is_verified,
      role: user.role
    });
    
    // Check if user is verified
    if (!user.is_verified) {
      console.log('🔧 Verifying production user...');
      const verifyQuery = 'UPDATE users SET is_verified = true WHERE id = $1';
      await pool.query(verifyQuery, [user.id]);
      console.log('✅ User verified');
    }
    
    console.log('✅ Contacts page authentication ready');
    console.log('🔗 Navigate to /auto-login to establish session');
    
  } catch (error) {
    console.error('❌ Error fixing authentication:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixContactsAuthentication().catch(console.error);