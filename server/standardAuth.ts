import bcrypt from 'bcrypt';
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { emailService } from "./emailService";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
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
    rolling: false,
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

      // Create user
      const newUser = await storage.createUser({
        id: Math.random().toString(36).substring(2, 15),
        email,
        username,
        firstName: firstName || '',
        lastName: lastName || '',
        password: hashedPassword,
        role: 'member',
        isEmailVerified: false,
        churchId: null,
      });

      // Set up session
      (req.session as any).userId = newUser.id;
      (req.session as any).user = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      };

      // Force session save before responding
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session creation failed' });
        }
        
        res.status(201).json({
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        });
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

      // Set up session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      // Force session save before responding
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session creation failed' });
        }
        
        res.json({
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
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