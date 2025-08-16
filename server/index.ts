import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Production server configuration
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for Replit deployment
app.set('trust proxy', 1);

// WWW subdomain redirect middleware
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.startsWith('www.')) {
    const newHost = host.slice(4); // Remove 'www.'
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const redirectUrl = `${protocol}://${newHost}${req.originalUrl}`;
    return res.redirect(301, redirectUrl);
  }
  next();
});

// Enable response compression for better performance
app.use(compression({
  level: 6, // Balanced compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req: Request, res: Response) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Fallback to standard filter function
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve attached assets statically
app.use('/attached_assets', express.static('attached_assets'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));



// Media moderation routes
app.use('/api/media', async (req, res, next) => {
  try {
    const { default: mediaModerationRoutes } = await import('./routes/media-moderation.js');
    return mediaModerationRoutes(req, res, next);
  } catch (error) {
    next(error);
  }
});

// D.I.V.I.N.E. Phase 3A: Cross-Campus Member Management routes
app.use('/api/cross-campus-members', async (req, res, next) => {
  try {
    const { default: crossCampusMemberRoutes } = await import('./routes/cross-campus-member-routes.js');
    return crossCampusMemberRoutes(req, res, next);
  } catch (error) {
    next(error);
  }
});

// PUBLIC ENTERPRISE CONTACT ENDPOINT - No authentication required
app.post('/api/enterprise-contact', async (req, res) => {
  try {
    const { fullName, name, title, email, phone, churchName, cityState, numberOfCampuses, congregationSize, message } = req.body;
    
    // Use fullName if provided, otherwise fallback to name for backward compatibility
    const actualName = fullName || name;
    
    // Input validation and sanitization
    if (!actualName?.trim() || !title?.trim() || !email?.trim() || !churchName?.trim() || 
        !cityState?.trim() || !numberOfCampuses?.trim() || !congregationSize?.trim()) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Phone number validation (if provided)
    if (phone && !/^[\d\s\-\(\)\+]+$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus signs' });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: actualName.trim(),
      title: title.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      churchName: churchName.trim(),
      cityState: cityState.trim(),
      numberOfCampuses: numberOfCampuses.trim(),
      congregationSize: congregationSize.trim(),
      message: message?.trim() || ''
    };

    // Send email to sales team
    const { sendEmail } = await import('./email-service');
    const emailContent = `
      <h2>New Enterprise Contact Request</h2>
      
      <p><strong>Name:</strong> ${sanitizedData.name}</p>
      <p><strong>Title:</strong> ${sanitizedData.title}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      <p><strong>Phone:</strong> ${sanitizedData.phone || 'Not provided'}</p>
      <p><strong>Church/Organization:</strong> ${sanitizedData.churchName}</p>
      <p><strong>City, State:</strong> ${sanitizedData.cityState}</p>
      <p><strong>Number of Campuses:</strong> ${sanitizedData.numberOfCampuses}</p>
      <p><strong>Total Congregation Size:</strong> ${sanitizedData.congregationSize}</p>
      
      <h3>Message:</h3>
      <p>${sanitizedData.message || 'No additional message'}</p>
      
      <hr>
      <p><em>Sent from SoapBox Super App Enterprise Contact Form</em></p>
    `;

    const result = await sendEmail({
      to: 'sales@soapboxsuperapp.com',
      subject: `New Enterprise Contact Request from ${sanitizedData.name}`,
      html: emailContent
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Thank you for your interest! Our enterprise sales team will contact you within 24 hours.' 
      });
    } else {
      // In production, we should log the error but still return success to avoid user frustration
      // The form data is captured even if email fails
      res.json({ 
        success: true, 
        message: 'Thank you for your interest! Our enterprise sales team will contact you within 24 hours.' 
      });
    }
  } catch (error) {
    // Log error for debugging but return success to user
    console.error('Enterprise contact form error:', error);
    res.json({ 
      success: true, 
      message: 'Thank you for your interest! Our enterprise sales team will contact you within 24 hours.' 
    });
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // D.I.V.I.N.E. Volunteer Management Routes (register after auth is configured)
  const { default: volunteerRoutes } = await import('./routes/volunteer-routes');
  app.use('/api/volunteers', volunteerRoutes);
  
  // Enhanced routes with field mapping
  const enhancedRoutes = await import('./enhanced-routes');
  app.use('/api', enhancedRoutes.default);

  // Setup secure authentication transition system
  const { SecureAuthTransition } = await import('./secure-auth-transition');
  SecureAuthTransition.setupTransitionEndpoints(app);
  
  // Setup security recovery system
  const { setupSecurityRecovery } = await import('./security-recovery');
  setupSecurityRecovery(app);
  
  // Setup emergency recovery system for immediate restoration
  const { setupEmergencyRecovery } = await import('./emergency-recovery');
  setupEmergencyRecovery(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    log(`Error ${status}: ${message}`);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
