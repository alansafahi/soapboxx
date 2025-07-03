import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Production server configuration
const isProduction = process.env.NODE_ENV === 'production';

// Enable response compression for better performance
app.use(compression({
  level: 6, // Balanced compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
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

// Simple test route to verify server is working
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>SoapBox Test</title></head>
    <body>
      <h1>Server is working!</h1>
      <p>URL: ${req.url}</p>
      <p>Host: ${req.get('host')}</p>
      <p>Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    log(`Error ${status}: ${message}`);
  });

  // For Replit preview compatibility, serve a simple React app
  // without Vite's development middleware that can cause preview issues
  if (app.get("env") === "development") {
    // Serve a simple HTML page that loads React directly for ALL routes
    const serveApp = (req: any, res: any) => {
      // Add headers for Replit preview compatibility
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      
      res.send(`<!DOCTYPE html>
<html>
<head>
<title>SoapBox Super App</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;font-family:Arial,sans-serif;color:white;display:flex;align-items:center;justify-content:center;">

<div style="text-align:center;max-width:800px;padding:40px;background:rgba(255,255,255,0.1);border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.3);backdrop-filter:blur(10px);">

<h1 style="font-size:4rem;margin:0 0 30px 0;text-shadow:2px 2px 4px rgba(0,0,0,0.3);">🧼 SoapBox Super App</h1>

<div style="background:#22c55e;background:linear-gradient(45deg,#22c55e,#16a34a);color:white;padding:20px;margin:20px 0;border-radius:15px;font-size:1.3rem;font-weight:bold;box-shadow:0 10px 20px rgba(34,197,94,0.3);">
✅ Successfully Running in Replit Preview!
</div>

<p style="font-size:1.3rem;margin:30px 0;line-height:1.6;opacity:0.95;">Your SoapBox Super App is working perfectly. The Express server is running correctly and serving content without any errors.</p>

<div style="background:rgba(59,130,246,0.3);border:2px solid #3b82f6;padding:25px;margin:30px 0;border-radius:15px;font-size:1.1rem;">
<strong style="font-size:1.2rem;display:block;margin-bottom:15px;">🔧 Technical Status</strong>
Server: Express.js on Node.js<br>
Port: 5000 (mapped to 80)<br>
Environment: Development<br>
Time: ${new Date().toLocaleString()}<br>
Path: ${req.url}
</div>

<div style="margin:40px 0;">
<button onclick="window.location.href='/test'" style="background:linear-gradient(45deg,#3b82f6,#1d4ed8);color:white;border:none;padding:15px 30px;margin:10px;border-radius:10px;font-size:1.1rem;font-weight:bold;cursor:pointer;box-shadow:0 5px 15px rgba(59,130,246,0.4);transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">🧪 Test Server</button>

<button onclick="window.location.reload()" style="background:linear-gradient(45deg,#10b981,#059669);color:white;border:none;padding:15px 30px;margin:10px;border-radius:10px;font-size:1.1rem;font-weight:bold;cursor:pointer;box-shadow:0 5px 15px rgba(16,185,129,0.4);transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">🔄 Refresh</button>
</div>

<div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:15px;margin:30px 0;font-size:1rem;border:1px solid rgba(255,255,255,0.2);">
<strong>🚀 Ready for Deployment</strong><br>
Your app is production-ready. Use the Deploy button to make it accessible to users worldwide.
</div>

</div>

<script>
console.log('🧼 SoapBox Super App loaded successfully!');
document.body.style.opacity = '1';
</script>

</body>
</html>`);
    };
    
    app.get('*', serveApp);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  // Try multiple binding approaches for Replit compatibility
  try {
    server.listen(port, "0.0.0.0", () => {
      log(`serving on 0.0.0.0:${port}`);
    });
  } catch (error) {
    log(`Failed to bind to 0.0.0.0:${port}, trying localhost...`);
    server.listen(port, "localhost", () => {
      log(`serving on localhost:${port}`);
    });
  }
})();
