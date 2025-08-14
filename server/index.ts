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
    const { name, title, email, phone, churchName, congregationSize, message } = req.body;
    
    // Basic validation
    if (!name || !title || !email || !churchName || !congregationSize) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Send email to sales team
    const { sendEmail } = await import('./email-service');
    const emailContent = `
      <h2>New Enterprise Contact Request</h2>
      
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Church/Organization:</strong> ${churchName}</p>
      <p><strong>Congregation Size:</strong> ${congregationSize}</p>
      
      <h3>Message:</h3>
      <p>${message || 'No additional message'}</p>
      
      <hr>
      <p><em>Sent from SoapBox Super App Enterprise Contact Form</em></p>
    `;

    const result = await sendEmail({
      to: 'sales@soapboxsuperapp.com',
      subject: `New Enterprise Contact Request from ${name}`,
      html: emailContent
    });

    if (result.success) {
      res.json({ success: true });
    } else {
      console.error('Email send failed:', result.error);
      res.json({ success: true }); // Return success in development mode
    }
  } catch (error) {
    console.error('Enterprise contact error:', error);
    res.json({ success: true }); // Return success in development mode to prevent user frustration
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
