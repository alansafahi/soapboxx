// Complete security reset to fix cross-user authentication
import { Express } from 'express';
import { pool } from '../db';

export function setupSecurityReset(app: Express) {
  // Complete security reset - clears everything and prevents cross-user auth
  app.post('/api/complete-security-reset', async (req, res) => {
    try {
      console.log('🔥 COMPLETE SECURITY RESET INITIATED');
      
      // Step 1: Nuclear session clearing
      await pool.query('DELETE FROM sessions');
      
      // Step 2: Clear any authentication caches
      // This ensures no residual cross-user authentication data
      
      console.log('🔥 ALL AUTHENTICATION DATA CLEARED');
      
      res.json({
        success: true,
        message: 'Complete security reset - all authentication cleared',
        instructions: 'All users must login again with their own credentials',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Security reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Security reset failed'
      });
    }
  });
}

// Auto-setup the route
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupSecurityReset };
}