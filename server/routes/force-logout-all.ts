// FORCE LOGOUT ALL USERS - Emergency security measure
import { Express } from 'express';
import { pool } from '../db';

export function setupForceLogoutAll(app: Express) {
  // Emergency force logout all users
  app.post('/api/force-logout-all', async (req, res) => {
    try {
      console.log('🚨 FORCE LOGOUT ALL USERS ACTIVATED');
      
      // Nuclear session destruction
      await pool.query('DELETE FROM sessions');
      console.log('ALL SESSIONS DELETED FROM DATABASE');
      
      // Clear any in-memory session data
      
      res.json({
        success: true,
        message: 'ALL USERS FORCE LOGGED OUT - Complete session termination',
        action: 'All sessions destroyed',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Force logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Force logout failed'
      });
    }
  });
}