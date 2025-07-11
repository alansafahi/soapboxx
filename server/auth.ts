/**
 * Unified Authentication System for SoapBox Super App
 * Consolidates all authentication logic into a single, consistent system
 */
import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as AppleStrategy } from "passport-apple";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";
import { sendVerificationEmail } from "./email-service";

// Session configuration
export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Extend session on each request
    name: 'connect.sid', // Match the cookie name being sent by browser
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

// Passport configuration
function configurePassport() {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Check if user exists
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Create new user from Google profile
          user = await storage.createUser({
            id: crypto.randomUUID(),
            email,
            username: email.split('@')[0] + '_' + Date.now(),
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            password: null, // OAuth users don't have passwords
            role: 'member',
            emailVerified: true, // Google emails are pre-verified
            churchId: null,
          });
        } else if (!user.emailVerified) {
          // Verify email for existing users
          await storage.verifyUserEmail(user.id);
        }

        // Update last login
        await storage.updateUserLastLogin(user.id);
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Apple OAuth Strategy
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    passport.use(new AppleStrategy({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID || 'CGQ7FW7J58',
      callbackURL: "/api/auth/apple/callback",
      keyID: process.env.APPLE_KEY_ID || 'A9J6FBJP8J',
      privateKeyString: process.env.APPLE_CLIENT_SECRET,
      scope: ['name', 'email']
    }, async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const email = profile.email;
        if (!email) {
          return done(new Error('No email found in Apple profile'), null);
        }

        // Check if user exists
        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Create new user from Apple profile
          user = await storage.createUser({
            id: crypto.randomUUID(),
            email,
            username: email.split('@')[0] + '_apple_' + Date.now(),
            firstName: profile.name?.firstName || '',
            lastName: profile.name?.lastName || '',
            password: null, // OAuth users don't have passwords
            role: 'member',
            emailVerified: true, // Apple emails are pre-verified
            churchId: null,
          });
        } else if (!user.emailVerified) {
          // Verify email for existing users
          await storage.verifyUserEmail(user.id);
        }

        // Update last login
        await storage.updateUserLastLogin(user.id);
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Passport serialization
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
}

// Unified authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check for session-based authentication
    if (req.session && req.session.userId) {
      return next();
    }
    
    // If no session, return unauthorized
    return res.status(401).json({ success: false, message: "Unauthorized" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

// Main setup function
export function setupAuth(app: Express): void {
  app.set('trust proxy', 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport strategies
  configurePassport();

  // User registration endpoint
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
          message: 'Account already exists with this email address' 
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

      // Check for pre-assigned church based on email
      let claimableChurch = null;
      try {
        const church = await storage.getChurchByAdminEmail(email);
        if (church && !church.claimedBy) {
          claimableChurch = {
            id: church.id,
            name: church.name,
            address: church.address,
            city: church.city,
            state: church.state
          };
        }
      } catch (error) {

      }

      // Send verification email
      try {
        await sendVerificationEmail({
          email,
          firstName,
          token: verificationToken
        });

      } catch (emailError) {
        // Continue with registration even if email fails
      }

      const response = {
        success: true,
        message: 'Registration successful! Please check your email to verify your account before logging in.',
        email: newUser.email,
        requiresVerification: true,
        ...(claimableChurch && { claimableChurch })
      };

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Registration failed. Please try again.' 
      });
    }
  });

  // Login endpoint
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

      // Check email verification
      if (!user.emailVerified) {
        return res.status(403).json({ 
          success: false,
          message: 'Please verify your email before logging in. Check your inbox for verification link.',
          requiresVerification: true,
          email: user.email
        });
      }

      // Create secure session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      (req.session as any).authenticated = true;


      req.session.save((err: any) => {
        if (err) {
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
      res.status(500).json({ 
        success: false,
        message: 'Login failed. Please try again.' 
      });
    }
  });

  // Email verification endpoint (GET for email links)
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
      res.redirect('/email-verification?error=verification_failed');
    }
  });

  // Email verification endpoint (POST for frontend requests)
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: 'Verification token is required' 
        });
      }

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid verification token' 
        });
      }

      // Check token age (24 hours max)
      const tokenAge = Date.now() - (user.emailVerificationSentAt?.getTime() || 0);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Verification token has expired' 
        });
      }

      // Verify user email
      await storage.verifyUserEmail(user.id);

      res.json({ 
        success: true, 
        message: 'Email verified successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Email verification failed' 
      });
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
      await sendVerificationEmail({
        email,
        firstName: user.firstName || '',
        token: verificationToken
      });

      res.json({ 
        success: true,
        message: 'Verification email sent successfully' 
      });
    } catch (error) {
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
        (req.session as any).authenticated = true;

        // Save session before redirect
        req.session.save((err) => {
          if (err) {
            return res.redirect('/login?error=session_failed');
          }
          res.redirect('/?oauth=success');
        });
      } catch (error) {
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
        (req.session as any).authenticated = true;

        // Save session before redirect
        req.session.save((err) => {
          if (err) {
            return res.redirect('/login?error=session_failed');
          }
          res.redirect('/?oauth=success');
        });
      } catch (error) {
        res.redirect('/login?error=oauth_failed');
      }
    }
  );

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    try {

      
      // Clear all session data immediately
      if (req.session) {
        (req.session as any).user = null;
        (req.session as any).userId = null;
        (req.session as any).authenticated = false;
      }
      
      // Clear req.user as well
      req.user = null;
      
      const sessionId = req.sessionID;
      
      // Destroy the session completely
      req.session.destroy(async (err: any) => {
        if (err) {
        }
        
        // Clear session cookies
        res.clearCookie('connect.sid', { path: '/' });
        
        
        res.json({ 
          success: true,
          message: 'Logged out successfully' 
        });
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Logout failed' 
      });
    }
  });

  // Redirect GET /api/login to frontend login page
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  // Debug endpoint to establish session (temporary)
  app.post('/api/debug/establish-session', async (req, res) => {
    try {
      const user = await storage.getUserByEmail('alan@soapboxsuperapp.com');
      if (user) {
        (req.session as any).userId = user.id;
        (req.session as any).user = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };
        (req.session as any).authenticated = true;
        
        req.session.save((err: any) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Session save failed' });
          }
          res.json({ success: true, message: 'Session established', userId: user.id });
        });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to establish session' });
    }
  });
}