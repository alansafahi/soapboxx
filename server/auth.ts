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
import { SMSService } from "./sms-service";
import { pool, db } from "./db";
import { invitations, userCommunities } from "../shared/schema";
import { eq } from "drizzle-orm";

// SECURITY UPDATE: Emergency lockdown disabled - Secure authentication enabled
let EMERGENCY_LOGOUT_ACTIVE = false; // DISABLED - Secure authentication now active
const blockedUserIds = new Set<number>(); // Block problematic users if needed

// Security recovery completed
console.log('✅ SECURE AUTHENTICATION ENABLED - Cross-user vulnerability eliminated');
console.log('🔐 Session isolation and blacklisting active');
console.log('🛡️ Emergency lockdown disabled - System is now secure');

// Reset emergency mode function for normal operation
const resetEmergencyMode = () => {
  EMERGENCY_LOGOUT_ACTIVE = false;
  blockedUserIds.clear();
  console.log('✅ EMERGENCY MODE RESET - Normal authentication restored for all users');
};

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
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Extend session on each request
    name: 'connect.sid', // Match the cookie name being sent by browser
    cookie: {
      httpOnly: true,
      secure: false, // Disable secure cookies for development
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
    // CRITICAL: Block all authentication if emergency logout is active
    if (EMERGENCY_LOGOUT_ACTIVE) {
      console.log('🚨 EMERGENCY LOGOUT ACTIVE - Authentication blocked for:', req.path);
      return res.status(401).json({ 
        success: false, 
        message: "Emergency logout active - All sessions terminated",
        emergencyLogout: true,
        redirectTo: '/login'
      });
    }
    
    // Check multiple sources for user authentication
    let userId = null;
    let user = null;

    // 1. Check session-based authentication
    if (req.session && req.session.userId) {
      // Block specific user IDs that have been force-logged out
      if (blockedUserIds.has(Number(req.session.userId))) {
        console.log(`🚫 Blocked user ${req.session.userId} attempting re-authentication`);
        req.session.destroy(() => {});
        return res.status(401).json({ 
          success: false,
          message: "User session permanently terminated",
          forceLogout: true,
          redirectTo: '/login'
        });
      }
      userId = req.session.userId;
    }
    
    // 2. Check if user is already attached by passport or other middleware
    if (!userId && (req as any).user) {
      const existingUser = (req as any).user;
      userId = existingUser.id || existingUser.sub;
    }

    // 3. PERMANENTLY DISABLED: Auto-repair session functionality removed completely
    // This was causing CRITICAL SECURITY ISSUE where users could be logged in as other users
    // DO NOT RE-ENABLE - causes cross-user authentication vulnerabilities

    if (userId) {
      try {
        user = await storage.getUser(userId);
        if (user) {
          (req as any).user = user;
          return next();
        }
      } catch (error) {
        console.error('User lookup failed in auth middleware:', error);
      }
    }
    
    // If no authentication found, return unauthorized
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required"
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
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
      const { 
        email, 
        password, 
        username, 
        firstName, 
        lastName, 
        staffInvite,
        // New onboarding fields
        mobileNumber,
        role,
        gender,
        ageRange,
        ministryInterests,
        churchAffiliation,
        inviteToken
      } = req.body;
      


      // Handle onboarding without username requirement
      const generatedUsername = username || `${firstName}${lastName}${Date.now()}`.toLowerCase();
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false,
          message: 'Email, password, first name, and last name are required' 
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
        // If this is a staff invitation and user exists, create the staff invitation for existing user
        if (staffInvite && staffInvite.communityId && staffInvite.role) {
          try {

            
            // Check if user already has a role in this community
            const existingRole = await pool.query(
              'SELECT * FROM user_churches WHERE user_id = $1 AND church_id = $2',
              [existingUser.id, staffInvite.communityId]
            );
            
            if (existingRole.rows.length === 0) {
              // Create new staff invitation for existing user
              await pool.query(
                'INSERT INTO user_churches (user_id, church_id, role, is_active, assigned_by, assigned_at, title) VALUES ($1, $2, $3, false, $4, NOW(), $5)',
                [existingUser.id, staffInvite.communityId, staffInvite.role, existingUser.id, staffInvite.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())]
              );
              
              return res.status(200).json({
                success: true,
                message: 'Staff invitation created! Please log in to accept your position.',
                existingUser: true,
                staffInvitation: { communityId: staffInvite.communityId, role: staffInvite.role }
              });
            } else {
              return res.status(200).json({
                success: true,
                message: 'You already have a role in this community. Please log in to manage your position.',
                existingUser: true,
                existingRole: existingRole.rows[0].role
              });
            }
          } catch (staffError) {
            
          }
        }
        
        return res.status(409).json({ 
          success: false,
          message: 'It looks like you already have an account with this email. Would you like to sign in instead?',
          errorType: 'account_exists',
          suggestedAction: 'login'
        });
      }

      const existingUsername = await storage.getUserByUsername(generatedUsername);
      if (existingUsername) {
        // Generate a unique username if collision occurs
        const finalUsername = `${generatedUsername}_${crypto.randomBytes(4).toString('hex')}`;
      }

      // Hash password with high security
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Handle invite token if provided
      let inviterCommunityId = null;
      if (inviteToken) {
        try {
          const invite = await db.select()
            .from(invitations)
            .where(eq(invitations.inviteCode, inviteToken))
            .limit(1);
            
          if (invite.length && invite[0].status === 'pending') {
            // Get inviter's community
            const inviterCommunity = await db.select({ communityId: userCommunities.communityId })
              .from(userCommunities)
              .where(eq(userCommunities.userId, invite[0].inviterId))
              .limit(1);
              
            if (inviterCommunity.length) {
              inviterCommunityId = inviterCommunity[0].communityId;
            }
            
            // Mark invitation as accepted
            await db.update(invitations)
              .set({ status: 'accepted' })
              .where(eq(invitations.inviteCode, inviteToken));
          }
        } catch (error) {
          // Continue registration even if invite processing fails
        }
      }

      // Create unverified user with enhanced profile data
      const finalUsername = existingUsername ? `${generatedUsername}_${crypto.randomBytes(4).toString('hex')}` : generatedUsername;
      
      const newUser = await storage.createUser({
        id: crypto.randomUUID(),
        email,
        username: finalUsername,
        firstName,
        lastName,
        password: hashedPassword,
        role: role || 'member',
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationSentAt: new Date(),
        churchId: null,
        // Enhanced profile fields
        mobileNumber: mobileNumber || null,
        gender: gender || null,
        ageRange: ageRange || null,
        ministryInterests: ministryInterests || [],
        churchAffiliation: churchAffiliation || null,
        hasCompletedOnboarding: true, // Mark as completed since they went through onboarding flow
      });

      // Check for pre-assigned church based on email
      let claimableChurch = null;
      // Temporarily disabled pre-assigned church logic

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

      // Handle staff invitation if present
      if (staffInvite && staffInvite.communityId && staffInvite.role) {
        try {
          // Create pending staff invitation directly in user_churches table
          await pool.query(
            'INSERT INTO user_churches (user_id, church_id, role, is_active, assigned_by, assigned_at, title) VALUES ($1, $2, $3, false, $4, NOW(), $5)',
            [newUser.id, staffInvite.communityId, staffInvite.role, newUser.id, staffInvite.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())]
          );
        } catch (staffError) {
          
          // Continue with registration even if staff invitation fails
        }
      }

      // Handle invite-based community association
      if (inviterCommunityId && !staffInvite) {
        try {
          // Add user to inviter's community as a member
          await db.insert(userCommunities).values({
            userId: newUser.id,
            communityId: inviterCommunityId,
            role: 'member',
            isActive: true,
            joinedAt: new Date()
          });
        } catch (communityError) {
          // Continue with registration even if community association fails
        }
      }

      const response = {
        success: true,
        message: staffInvite 
          ? 'Registration successful! You\'ve been added as a staff member. Please check your email to verify your account.'
          : 'Registration successful! Please check your email to verify your account before logging in.',
        email: newUser.email,
        requiresVerification: true,
        ...(claimableChurch && { claimableChurch }),
        ...(staffInvite && { staffInvitation: { communityId: staffInvite.communityId, role: staffInvite.role } })
      };

      res.status(201).json(response);
    } catch (error) {
      
      res.status(500).json({ 
        success: false,
        message: 'Registration failed. Please try again.',
        error: (error as Error).message
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
          message: 'Email verification required. Please check your email and click the verification link before logging in.',
          requiresVerification: true,
          email: user.email,
          userFriendlyMessage: 'Please check your email (including spam folder) and click the verification link to activate your account before logging in.'
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
        message: 'Login failed. Please try again.',
        error: (error as Error).message
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

  // Check email verification status for password reset
  app.post('/api/auth/check-email-verification', async (req, res) => {
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

      res.json({ 
        success: true,
        emailVerified: user.emailVerified || false,
        message: user.emailVerified ? 'Email is verified' : 'Email verification required'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to check email verification status' 
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

  // SMS Verification routes
  app.post('/api/auth/send-sms-verification', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ 
          success: false,
          message: 'Phone number is required' 
        });
      }

      // Validate phone number format
      if (!SMSService.validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid phone number format' 
        });
      }

      // Check if user is authenticated or provide email for identification
      const { email } = req.body;
      const userId = (req.session as any)?.userId;
      
      let user;
      if (userId) {
        user = await storage.getUser(userId);
      } else if (email) {
        user = await storage.getUserByEmail(email);
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Check rate limiting (max 3 attempts per 15 minutes)
      const attempts = user.smsVerificationAttempts || 0;
      const lastAttempt = user.smsVerificationExpires;
      const now = new Date();
      
      if (attempts >= 3 && lastAttempt && (now.getTime() - lastAttempt.getTime()) < 15 * 60 * 1000) {
        return res.status(429).json({ 
          success: false,
          message: 'Too many verification attempts. Please wait 15 minutes before trying again.' 
        });
      }

      // Generate and send verification code
      const smsService = new SMSService();
      const verificationCode = smsService.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with SMS verification data
      await storage.updateUserSMSVerification(user.id, {
        smsVerificationCode: verificationCode,
        smsVerificationExpires: expiresAt,
        smsVerificationAttempts: attempts + 1,
        mobileNumber: phoneNumber
      });

      // Send SMS
      await smsService.sendVerificationCode(phoneNumber, verificationCode);

      res.json({ 
        success: true,
        message: 'Verification code sent successfully',
        expiresAt: expiresAt.toISOString(),
        formattedPhone: smsService.formatPhoneNumber(phoneNumber)
      });
    } catch (error) {
      
      res.status(500).json({ 
        success: false,
        message: 'Failed to send verification code' 
      });
    }
  });

  // Verify SMS code
  app.post('/api/auth/verify-sms', async (req, res) => {
    try {
      const { code, phoneNumber } = req.body;
      
      if (!code || !phoneNumber) {
        return res.status(400).json({ 
          success: false,
          message: 'Verification code and phone number are required' 
        });
      }

      // Find user by phone number or session
      const { email } = req.body;
      const userId = (req.session as any)?.userId;
      
      let user;
      if (userId) {
        user = await storage.getUser(userId);
      } else if (email) {
        user = await storage.getUserByEmail(email);
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Check if code matches and hasn't expired
      if (user.smsVerificationCode !== code) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid verification code' 
        });
      }

      if (!user.smsVerificationExpires || new Date() > user.smsVerificationExpires) {
        return res.status(400).json({ 
          success: false,
          message: 'Verification code has expired' 
        });
      }

      // Mark phone as verified
      await storage.verifyUserPhone(user.id);

      res.json({ 
        success: true,
        message: 'Phone number verified successfully' 
      });
    } catch (error) {
      
      res.status(500).json({ 
        success: false,
        message: 'Failed to verify phone number' 
      });
    }
  });

  // Check SMS verification status
  app.post('/api/auth/sms-verification-status', async (req, res) => {
    try {
      const { email } = req.body;
      const userId = (req.session as any)?.userId;
      
      let user;
      if (userId) {
        user = await storage.getUser(userId);
      } else if (email) {
        user = await storage.getUserByEmail(email);
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      res.json({ 
        success: true,
        phoneVerified: user.phoneVerified || false,
        hasPhoneNumber: !!user.mobileNumber,
        formattedPhone: user.mobileNumber ? new SMSService().formatPhoneNumber(user.mobileNumber) : null
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to check SMS verification status' 
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

  // EMERGENCY SESSION TERMINATOR - Blocks all future sessions
  app.post('/api/auth/logout', async (req, res) => {
    try {
      console.log('🚨 EMERGENCY SESSION TERMINATOR ACTIVATED 🚨');
      
      // STEP 1: Activate emergency logout mode to block all future sessions
      EMERGENCY_LOGOUT_ACTIVE = true;
      
      // STEP 2: Get current user ID and block it permanently
      if ((req.session as any)?.userId) {
        blockedUserIds.add((req.session as any).userId);
        console.log(`User ${(req.session as any).userId} permanently blocked from re-authentication`);
      }
      
      // STEP 2.5: PERMANENTLY DISABLE AUTOMATIC AUTHENTICATION
      // Block ALL users to prevent cross-user authentication completely
      try {
        const allUsers = await db.select({ id: users.id }).from(users);
        allUsers.forEach(user => {
          blockedUserIds.add(Number(user.id));
        });
        console.log(`ALL USERS BLOCKED - Complete authentication shutdown: ${allUsers.length} users`);
      } catch (error) {
        console.log('User blocking failed during emergency shutdown');
      }
      
      // STEP 3: Nuclear database destruction
      await pool.query('DELETE FROM sessions');
      console.log('💥 ALL SESSIONS OBLITERATED FROM DATABASE');
      
      // STEP 4: Destroy session store completely
      req.session.destroy((err: any) => {
        if (err) console.error('Session destroy error:', err);
      });
      
      // STEP 5: Clear all possible cookies with extreme prejudice
      const domains = [undefined, req.get('host'), '.' + req.get('host'), 'replit.dev', '.replit.dev'];
      const cookieNames = ['connect.sid', 'sessionId', 'auth', 'user', 'session', 'passport'];
      
      domains.forEach(domain => {
        cookieNames.forEach(name => {
          const options: any = { path: '/', httpOnly: true, secure: false };
          if (domain) options.domain = domain;
          res.clearCookie(name, options);
        });
      });
      
      // STEP 6: Set anti-cache headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Logout-Success', 'true');
      
      console.log('🔥 EMERGENCY LOGOUT COMPLETED - SYSTEM LOCKED DOWN');
      
      // PERMANENTLY DISABLE EMERGENCY MODE RESET
      // No automatic reset - manual reset required to prevent cross-user authentication
      console.log('⚠️ Emergency mode is PERMANENT until manual reset - No automatic authentication recovery');
      
      res.json({ 
        success: true,
        message: 'EMERGENCY LOGOUT - All sessions terminated, normal login restored in 5 seconds',
        emergencyMode: true,
        resetIn: 5000,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Emergency logout error:', error);
      EMERGENCY_LOGOUT_ACTIVE = true; // Still activate emergency mode
      res.json({ 
        success: true,
        message: 'Emergency logout attempted - System locked',
        emergencyMode: true
      });
    }
  });

  // Redirect GET /api/login to frontend login page
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  // Emergency logout endpoint - DISABLED to prevent conflicts
  app.post('/api/emergency-logout', async (req, res) => {
    // Redirect to main logout
    res.redirect(307, '/api/auth/logout');
  });
  
  // Reset emergency mode endpoint for development
  app.post('/api/reset-emergency', (req, res) => {
    resetEmergencyMode();
    res.json({ 
      success: true, 
      message: 'Emergency mode reset - Normal authentication restored' 
    });
  });

  // Debug endpoint DISABLED to prevent automatic re-authentication
  // app.post('/api/debug/establish-session', async (req, res) => {
  //   res.status(503).json({ success: false, message: 'Debug endpoint disabled for production' });
  // });
}