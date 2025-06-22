/**
 * Production Authentication System
 * Secure email verification, OAuth integration, and session management
 * Fixes critical security vulnerabilities on www.soapboxapp.org
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { emailService } from "./emailService";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as AppleStrategy } from "passport-apple";
import jwt from "jsonwebtoken";

// Production session configuration
export function getProductionSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: false,
    ttl: sessionTtl / 1000,
  });

  return session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: false, // Allow HTTP for development
      httpOnly: true, // Prevent XSS attacks
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
    name: 'soapbox_session',
  });
}

// Configure Passport for OAuth
export function configurePassport() {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy with production domain callback URL
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Use production domain for OAuth callback (updated for deployment)
    const baseUrl = 'https://www.soapboxapp.org';
    
    console.log(`🔗 Google OAuth callback URL: ${baseUrl}/api/auth/google/callback`);
    console.log(`✅ Google Client ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${baseUrl}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (!user) {
          // Create new user from Google profile
          user = await storage.createUser({
            id: crypto.randomUUID(),
            email: profile.emails?.[0]?.value || '',
            username: profile.emails?.[0]?.value?.split('@')[0] || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value || null,
            role: 'member',
            emailVerified: true, // Google accounts are pre-verified
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else if (!user.emailVerified) {
          // Mark existing user as verified if they sign in with Google
          await storage.verifyUserEmail(user.id);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Apple Sign-In Strategy
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    const appleRedirectUri = process.env.APPLE_REDIRECT_URI || 'https://www.soapboxapp.org/auth/callback';
    
    console.log(`🍎 Apple OAuth redirect URI: ${appleRedirectUri}`);
    
    console.log(`✅ Apple Client ID: ${process.env.APPLE_CLIENT_ID?.substring(0, 25)}...`);
    
    passport.use(new AppleStrategy({
      clientID: process.env.APPLE_CLIENT_ID, // Use environment variable
      teamID: 'CGQ7FW7J58', // Apple Team ID
      keyID: 'A9J6FBJP8J', // SoapBox SignIn Key ID
      privateKeyString: process.env.APPLE_CLIENT_SECRET, // Use environment variable
      callbackURL: appleRedirectUri,
      scope: ['name', 'email'],
      passReqToCallback: false
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Apple provides user info in idToken
        const appleUser = idToken ? JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString()) : {};
        const email = appleUser.email || profile.email;
        
        let user = await storage.getUserByEmail(email || '');
        
        if (!user) {
          // Create new user from Apple profile
          user = await storage.createUser({
            id: crypto.randomUUID(),
            email: email || '',
            username: email?.split('@')[0] || `apple_${appleUser.sub}`,
            firstName: profile.name?.firstName || '',
            lastName: profile.name?.lastName || '',
            profileImageUrl: null, // Apple doesn't provide profile photos
            role: 'member',
            emailVerified: true, // Apple accounts are pre-verified
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else if (!user.emailVerified) {
          // Mark existing user as verified if they sign in with Apple
          await storage.verifyUserEmail(user.id);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }
}

export function setupProductionAuth(app: Express): void {
  app.set('trust proxy', 1);
  app.use(getProductionSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport strategies
  configurePassport();

  // Standard email/password registration with REQUIRED email verification
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, username, firstName, lastName } = req.body;

      if (!email || !password || !username || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false,
          message: 'Email, password, username, first name, and last name are required' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Please enter a valid email address' 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'User already exists with this email' 
        });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ 
          success: false,
          message: 'Username already taken' 
        });
      }

      // Hash password with high security
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create unverified user
      const newUser = await storage.createUser({
        id: crypto.randomUUID(),
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'member',
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationSentAt: new Date(),
        churchId: null,
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail({
          email,
          firstName,
          token: verificationToken
        });
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Still continue - user can request resend
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account before logging in.',
        email: newUser.email,
        requiresVerification: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Registration failed. Please try again.' 
      });
    }
  });

  // Login page (GET route)
  app.get('/api/login', (req, res) => {
    // Redirect to the frontend login page
    res.redirect('/login');
  });

  // Debug endpoint to test session functionality
  app.get('/api/debug/session', (req, res) => {
    const session = req.session as any;
    res.json({
      hasSession: !!session,
      sessionId: req.sessionID,
      userId: session?.userId,
      user: session?.user,
      sessionData: session
    });
  });

  // REMOVED: Test session endpoint eliminated for security - prevents unauthorized session creation

  // REMOVED: Auto-login endpoint eliminated for security - prevents session recreation after logout

  // Email/password login with MANDATORY email verification
  app.post('/api/auth/login', async (req, res) => {
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

      // MANDATORY: Email verification required for production security
      if (!user.emailVerified) {
        return res.status(403).json({ 
          success: false,
          message: 'Please verify your email before logging in. Check your inbox for verification link.',
          requiresVerification: true,
          email: user.email
        });
      }

      // Create secure session
      const sessionData = {
        userId: user.id,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      };

      // Explicitly set session properties
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      console.log('🔐 Creating session for user:', user.email);
      console.log('Session data being saved:', { userId: user.id, hasUser: true });

      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ 
            success: false,
            message: 'Login failed. Please try again.' 
          });
        }
        
        console.log('✅ Session saved successfully for user:', user.email);
        
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
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Login failed. Please try again.' 
      });
    }
  });

  // Email verification endpoint
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.redirect('/email-verification?error=missing_token');
      }

      const user = await storage.getUserByVerificationToken(token as string);
      if (!user) {
        return res.redirect('/email-verification?error=invalid_token');
      }

      // Check token age (24 hours max)
      const tokenAge = Date.now() - (user.emailVerificationSentAt?.getTime() || 0);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return res.redirect('/email-verification?error=expired_token');
      }

      // Verify user email
      await storage.verifyUserEmail(user.id);

      res.redirect('/email-verification?success=true');
    } catch (error) {
      console.error('Email verification error:', error);
      res.redirect('/email-verification?error=verification_failed');
    }
  });

  // Resend verification email
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is already verified' 
        });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await storage.updateUserVerificationToken(user.id, verificationToken);

      // Send verification email
      await emailService.sendVerificationEmail({
        email,
        firstName: user.firstName || '',
        token: verificationToken
      });

      res.json({ 
        success: true,
        message: 'Verification email sent successfully' 
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      
      // Log detailed SendGrid error information
      if (error.response?.body?.errors) {
        console.error('SendGrid detailed errors:', JSON.stringify(error.response.body.errors, null, 2));
        
        // Return more specific error message
        const sendGridError = error.response.body.errors[0];
        if (sendGridError) {
          return res.status(500).json({ 
            success: false,
            message: `SendGrid error: ${sendGridError.message || 'Email service error'}`,
            details: sendGridError.field ? `Field: ${sendGridError.field}` : undefined
          });
        }
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Failed to resend verification email' 
      });
    }
  });

  // Secure logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    try {
      console.log('🚪 Logout request received, destroying session...');
      console.log('🔍 Current session before logout:', {
        sessionId: req.sessionID,
        hasSession: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        userId: req.session?.userId,
        authenticated: req.session?.authenticated
      });
      
      // Clear all session data immediately
      if (req.session) {
        req.session.user = null;
        req.session.userId = null;
        req.session.authenticated = false;
        req.session.autoLogin = false;
        req.session.populatedAt = null;
      }
      
      // Clear req.user as well
      req.user = null;
      
      const sessionId = req.sessionID;
      
      // Destroy the session completely
      req.session.destroy(async (err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
        
        // CRITICAL SECURITY FIX: Delete session from database manually
        try {
          const { pool } = await import('./db');
          // Delete the specific session by ID
          const result = await pool.query('DELETE FROM sessions WHERE sid = $1', [sessionId]);
          console.log('🗑️ Session deleted from database:', sessionId, 'Rows affected:', result.rowCount);
          
          // Also delete any session containing this user's data to ensure complete cleanup
          const userCleanup = await pool.query(
            `DELETE FROM sessions WHERE sess::text LIKE '%"userId":"${req.session?.userId}"%'`
          );
          console.log('🗑️ User sessions cleaned:', userCleanup.rowCount);
        } catch (dbError) {
          console.error('Database session cleanup error:', dbError);
        }
        
        // Clear ALL possible session cookies with comprehensive options
        const cookieOptions = [
          { path: '/', httpOnly: true, secure: false, sameSite: 'lax' as const },
          { path: '/', httpOnly: true, secure: true, sameSite: 'lax' as const },
          { path: '/', secure: false },
          { path: '/', secure: true },
          { path: '/' },
          {}
        ];
        
        const cookieNames = ['connect.sid', 'soapbox_session', 'session'];
        
        cookieNames.forEach(name => {
          cookieOptions.forEach(options => {
            try {
              res.clearCookie(name, options);
            } catch (e) {
              // Continue if cookie clearing fails
            }
          });
        });
        
        console.log('✅ Session destroyed and all cookies cleared');
        
        res.json({ 
          success: true,
          message: 'Logged out successfully' 
        });
      });
    } catch (error) {
      console.error('Logout endpoint error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Logout failed' 
      });
    }
  });

  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        // User is authenticated, establish session
        const user = req.user as any;
        
        if (!user) {
          return res.redirect('/login?error=oauth_failed');
        }

        // Create session manually to ensure it's properly established
        (req.session as any).userId = user.id;
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        };

        // Update last login
        await storage.updateUserLastLogin(user.id);
        
        // Save session before redirect
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.redirect('/login?error=session_failed');
          }
          // Successful authentication - redirect to home
          res.redirect('/?oauth=success');
        });
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect('/login?error=oauth_failed');
      }
    }
  );

  // Apple OAuth routes
  app.get('/api/auth/apple', 
    passport.authenticate('apple', { scope: ['name', 'email'] })
  );

  app.get('/api/auth/apple/callback',
    passport.authenticate('apple', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        // User is authenticated, establish session
        const user = req.user as any;
        
        if (!user) {
          return res.redirect('/login?error=oauth_failed');
        }

        // Create session manually to ensure it's properly established
        (req.session as any).userId = user.id;
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        };

        // Update last login
        await storage.updateUserLastLogin(user.id);
        
        // Save session before redirect
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.redirect('/login?error=session_failed');
          }
          // Successful authentication - redirect to home
          res.redirect('/?oauth=success');
        });
      } catch (error) {
        console.error('Apple OAuth callback error:', error);
        res.redirect('/login?error=oauth_failed');
      }
    }
  );

  // Production Apple callback route
  app.post('/auth/callback',
    passport.authenticate('apple', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        // User is authenticated, establish session
        const user = req.user as any;
        
        if (!user) {
          return res.redirect('/login?error=oauth_failed');
        }

        // Create session manually to ensure it's properly established
        (req.session as any).userId = user.id;
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        };

        // Update last login
        await storage.updateUserLastLogin(user.id);
        
        // Save session before redirect
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.redirect('/login?error=session_failed');
          }
          // Successful authentication - redirect to home
          res.redirect('/?oauth=success');
        });
      } catch (error) {
        console.error('Apple OAuth callback error:', error);
        res.redirect('/login?error=oauth_failed');
      }
    }
  );


}

// Production authentication middleware with fallback user creation
export async function isAuthenticatedProduction(req: any, res: any, next: any) {
  const session = req.session as any;
  const sessionUser = session?.user;
  const userId = session?.userId;
  
  console.log('🔐 Authentication check:', {
    hasSession: !!req.session,
    sessionUser: !!sessionUser,
    userId,
    sessionId: req.sessionID,
    sessionKeys: session ? Object.keys(session) : [],
    authenticated: session?.authenticated
  });
  
  // Strict check: if session exists but authenticated is explicitly false, reject
  if (session && session.authenticated === false) {
    console.log('❌ Authentication failed - session marked as not authenticated');
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }
  
  // Check if req.user was populated by ensureSessionAuthentication middleware
  if (req.user && req.user.claims && req.user.claims.sub) {
    console.log('✅ User authenticated via middleware:', req.user.claims.sub);
    return next();
  }
  
  // Check existing session authentication - more flexible check
  if (session && sessionUser && userId) {
    // Additional validation: ensure user data is not null/cleared
    if (sessionUser === null || userId === null) {
      console.log('❌ Authentication failed - session data was cleared');
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }
    
    // Set authenticated flag if missing but session data exists
    if (session.authenticated !== true) {
      session.authenticated = true;
      console.log('🔧 Setting session as authenticated for existing session');
    }
    
    // Ensure req.user is populated for compatibility
    if (!req.user) {
      req.user = {
        id: sessionUser?.id || userId,
        claims: { sub: sessionUser?.id || userId },
        ...(sessionUser || {})
      };
    }
    console.log('✅ User authenticated via session:', sessionUser?.email || userId);
    return next();
  }
  
  // No auto-authentication in production - require proper login
  
  console.log('❌ Authentication failed - no valid session data');
  return res.status(401).json({ 
    success: false,
    message: 'Unauthorized' 
  });
}