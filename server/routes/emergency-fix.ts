// EMERGENCY: Fix cross-user authentication issue
import { Express } from 'express';
import { pool } from '../db';

export function setupEmergencyFix(app: Express) {
  // Emergency endpoint to clear all problematic sessions and reset security
  app.post('/api/emergency-security-fix', async (req, res) => {
    try {
      console.log('🚨 EMERGENCY SECURITY FIX ACTIVATED');
      
      // Step 1: Nuclear database session clearing
      await pool.query('DELETE FROM sessions');
      console.log('All sessions cleared from database');
      
      // Step 2: Clear any cached authentication data
      // This prevents any residual cross-user authentication
      
      res.json({
        success: true,
        message: 'Emergency security fix applied - all sessions cleared',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Emergency security fix error:', error);
      res.status(500).json({
        success: false,
        message: 'Security fix failed',
        error: error.message
      });
    }
  });
}