import bcrypt from 'bcrypt';
import crypto from 'crypto';
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { emailService } from "./emailService";

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days for better persistence
  
  // Enhanced PostgreSQL session store with better error handling
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: false,
    ttl: sessionTtl / 1000, // Convert to seconds
  });

  // Handle PostgreSQL store errors
  sessionStore.on('error', (error) => {
    console.error('Session store error:', error);
  });

  return session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on activity
    cookie: {
      secure: false,
      httpOnly: false, // Allow JavaScript access for debugging
      maxAge: sessionTtl,
      sameSite: 'lax',
      domain: undefined, // Ensure cookies work on localhost
    },
    name: 'connect.sid',
  });
}

export function setupAuth(app: Express): void {
  // Trust proxy for proper session handling
  app.set('trust proxy', 1);
  app.use(getSession());

  // User registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, username, firstName, lastName } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email, password, and username are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists with this email' });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const newUser = await storage.createUser({
        id: Math.random().toString(36).substring(2, 15),
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
        // Continue with registration even if email fails
      }

      // DO NOT create session for unverified users
      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        email: newUser.email,
        requiresVerification: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // User login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email before logging in. Check your inbox for verification link.',
          requiresVerification: true,
          email: user.email
        });
      }

      // Set up session with explicit data structure
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

      // Assign session data
      Object.assign(req.session, sessionData);

      // Force session save and regenerate ID for security
      req.session.regenerate((err: any) => {
        if (err) {
          console.error('Session regenerate error:', err);
          return res.status(500).json({ message: 'Session creation failed' });
        }

        // Re-assign data after regeneration
        Object.assign(req.session, sessionData);

        req.session.save((saveErr: any) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: 'Session save failed' });
          }
          
          console.log('Session created successfully:', req.sessionID);
          res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          });
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Email verification endpoint
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }

      // Find user by verification token
      const user = await storage.getUserByVerificationToken(token as string);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Update user as verified
      await storage.verifyUserEmail(user.id);

      res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  // Resend verification email endpoint
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
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

      res.json({ message: 'Verification email sent' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification email' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Current user endpoint is handled in routes.ts with fresh database data
}

// Authentication middleware with enhanced debugging
export function isAuthenticated(req: any, res: any, next: any) {
  const sessionUser = (req.session as any)?.user;
  const userId = (req.session as any)?.userId;
  
  // Debug session state
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Session user:', sessionUser);
  console.log('User ID:', userId);
  
  if (!sessionUser || !userId) {
    console.log('Authentication failed - no session user or userId');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Attach user to request for compatibility
  req.user = {
    id: sessionUser.id,
    claims: { sub: sessionUser.id },
    ...sessionUser
  };
  
  next();
}