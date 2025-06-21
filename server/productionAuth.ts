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
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
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

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback'
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

      if (!email || !password || !username) {
        return res.status(400).json({ 
          success: false,
          message: 'Email, password, and username are required' 
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
        firstName: firstName || '',
        lastName: lastName || '',
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
          firstName: firstName || '',
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

  // GET route for /api/login - redirect to frontend login page
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

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

      Object.assign(req.session, sessionData);

      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ 
            success: false,
            message: 'Login failed. Please try again.' 
          });
        }
        
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

  // Apple OAuth placeholder (requires Apple Developer setup)
  app.get('/api/auth/apple', (req, res) => {
    res.status(501).json({ 
      success: false,
      message: 'Apple Sign-In is not yet configured. Please use email/password or Google sign-in.' 
    });
  });

  // Secure logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Logout failed' 
        });
      }
      res.clearCookie('soapbox_session');
      res.json({ 
        success: true,
        message: 'Logged out successfully' 
      });
    });
  });
}

// Production authentication middleware
export function isAuthenticatedProduction(req: any, res: any, next: any) {
  const sessionUser = (req.session as any)?.user;
  const userId = (req.session as any)?.userId;
  
  if (!sessionUser || !userId) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }
  
  // Attach user to request
  req.user = {
    id: sessionUser.id,
    claims: { sub: sessionUser.id },
    ...sessionUser
  };
  
  next();
}