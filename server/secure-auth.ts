import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { pool, db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

// Secure session management with strict isolation
interface SecureSession {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

// Session blacklist for immediate invalidation
const sessionBlacklist = new Set<string>();

// Secure session utilities
class SecureSessionManager {
  // Generate cryptographically secure session ID
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create new session with strict isolation
  static async createSession(userId: string, req: Request): Promise<string> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Store session in database with metadata for security tracking
    await pool.query(`
      INSERT INTO secure_sessions (
        session_id, user_id, created_at, expires_at, 
        ip_address, user_agent, is_active
      ) VALUES ($1, $2, NOW(), $3, $4, $5, true)
    `, [
      sessionId, 
      userId, 
      expiresAt, 
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    ]);

    return sessionId;
  }

  // Validate session with comprehensive security checks
  static async validateSession(sessionId: string, req: Request): Promise<string | null> {
    // Check blacklist first - immediate rejection
    if (sessionBlacklist.has(sessionId)) {
      return null;
    }

    try {
      const result = await pool.query(`
        SELECT user_id, expires_at, ip_address, user_agent, is_active
        FROM secure_sessions 
        WHERE session_id = $1 AND is_active = true
      `, [sessionId]);

      if (result.rows.length === 0) {
        return null;
      }

      const session = result.rows[0];

      // Check expiration
      if (new Date() > new Date(session.expires_at)) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Security: Check IP consistency (optional - can be disabled for mobile users)
      // if (session.ip_address !== (req.ip || 'unknown')) {
      //   await this.invalidateSession(sessionId);
      //   return null;
      // }

      return session.user_id;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Completely invalidate session with blacklisting
  static async invalidateSession(sessionId: string): Promise<void> {
    // Add to blacklist for immediate protection
    sessionBlacklist.add(sessionId);
    
    // Remove from database
    await pool.query(`
      UPDATE secure_sessions 
      SET is_active = false, invalidated_at = NOW()
      WHERE session_id = $1
    `, [sessionId]);

    // Clean up blacklist periodically (remove after 24 hours)
    setTimeout(() => {
      sessionBlacklist.delete(sessionId);
    }, 24 * 60 * 60 * 1000);
  }

  // Nuclear logout - invalidate ALL sessions for user
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    const result = await pool.query(`
      SELECT session_id FROM secure_sessions 
      WHERE user_id = $1 AND is_active = true
    `, [userId]);

    // Add all user sessions to blacklist
    result.rows.forEach(row => {
      sessionBlacklist.add(row.session_id);
    });

    // Deactivate all sessions
    await pool.query(`
      UPDATE secure_sessions 
      SET is_active = false, invalidated_at = NOW()
      WHERE user_id = $1
    `, [userId]);
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    await pool.query(`
      UPDATE secure_sessions 
      SET is_active = false, invalidated_at = NOW()
      WHERE expires_at < NOW() AND is_active = true
    `);
  }
}

// Secure authentication middleware
export const secureAuth: RequestHandler = async (req, res, next) => {
  try {
    const sessionId = req.cookies['secure_session'];
    
    if (!sessionId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const userId = await SecureSessionManager.validateSession(sessionId, req);
    
    if (!userId) {
      // Clear invalid cookie
      res.clearCookie('secure_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired session" 
      });
    }

    // Attach user to request
    const user = await storage.getUser(userId);
    if (!user) {
      await SecureSessionManager.invalidateSession(sessionId);
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    (req as any).user = user;
    (req as any).sessionId = sessionId;
    
    next();
  } catch (error) {
    console.error('Secure auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Authentication error" 
    });
  }
};

// Setup secure authentication routes
export function setupSecureAuth(app: Express) {
  // Secure login endpoint
  app.post('/api/secure-auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and password are required' 
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.password) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Check email verification
      if (!user.emailVerified) {
        return res.status(403).json({ 
          success: false,
          message: 'Email verification required',
          requiresVerification: true,
          email: user.email
        });
      }

      // Create secure session
      const sessionId = await SecureSessionManager.createSession(user.id, req);
      
      // Set secure cookie
      res.cookie('secure_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Secure login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Login failed' 
      });
    }
  });

  // Secure logout endpoint
  app.post('/api/secure-auth/logout', secureAuth, async (req, res) => {
    try {
      const sessionId = (req as any).sessionId;
      
      // Invalidate current session
      await SecureSessionManager.invalidateSession(sessionId);
      
      // Clear cookie
      res.clearCookie('secure_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({ 
        success: true,
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('Secure logout error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Logout failed' 
      });
    }
  });

  // Get current user endpoint
  app.get('/api/secure-auth/user', secureAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        // Include all other user fields as needed
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        // ... other fields
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to get user data' 
      });
    }
  });

  // Nuclear logout - invalidate all sessions for current user
  app.post('/api/secure-auth/logout-all', secureAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      
      await SecureSessionManager.invalidateAllUserSessions(user.id);
      
      res.clearCookie('secure_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({ 
        success: true,
        message: 'All sessions invalidated successfully' 
      });
    } catch (error) {
      console.error('Nuclear logout error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to invalidate all sessions' 
      });
    }
  });

  // Cleanup expired sessions (run periodically)
  setInterval(async () => {
    try {
      await SecureSessionManager.cleanupExpiredSessions();
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
}

export { SecureSessionManager };