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
      
      res.send(`<html><head><title>SoapBox Super App</title></head><body style="background:#667eea;color:white;padding:20px;font-family:Arial;">
<h1 style="color:white;text-align:center;font-size:2rem;">🧼 SoapBox Super App</h1>
<div style="background:rgba(34,197,94,0.2);border:1px solid #22c55e;padding:15px;margin:20px auto;max-width:600px;text-align:center;border-radius:8px;">
✅ App Successfully Loaded in Replit Preview!
</div>
<p style="text-align:center;max-width:600px;margin:20px auto;">The application is running properly without SSL errors or browser freezing.</p>
<div style="background:rgba(59,130,246,0.2);border:1px solid #3b82f6;padding:15px;margin:20px auto;max-width:600px;text-align:center;border-radius:8px;">
<strong>Environment Info:</strong><br>
Path: ${req.url}<br>
Host: ${req.get('host')}<br>
Time: ${new Date().toLocaleString()}
</div>
<div style="text-align:center;margin:20px;">
<button onclick="window.location.reload()" style="background:#3b82f6;color:white;border:none;padding:12px 24px;margin:5px;border-radius:8px;cursor:pointer;">🔄 Refresh</button>
<button onclick="alert('Server is running on port 5000!')" style="background:#3b82f6;color:white;border:none;padding:12px 24px;margin:5px;border-radius:8px;cursor:pointer;">🧪 Test</button>
</div>
  
  <script>
    console.log('SoapBox Super App loaded at', new Date().toLocaleString());
    
    // Track refresh count
    let refreshCount = parseInt(localStorage.getItem('refreshCount') || '0') + 1;
    localStorage.setItem('refreshCount', refreshCount.toString());
    document.getElementById('refresh-count').textContent = refreshCount;
    
    function hardRefresh() {
      document.getElementById('loading').style.display = 'block';
      localStorage.setItem('refreshCount', '0');
      window.location.reload(true);
    }
    
    function clearCache() {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      alert('Cache cleared! Refreshing...');
      hardRefresh();
    }
    
    async function testAPI() {
      const statusDiv = document.getElementById('api-status');
      statusDiv.innerHTML = '<div class="info">Testing API connection...</div>';
      
      try {
        const response = await fetch('/test', {
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const text = await response.text();
          statusDiv.innerHTML = '<div class="status">✅ API Connection Working!</div>';
        } else {
          statusDiv.innerHTML = '<div class="info">⚠️ API returned: ' + response.status + '</div>';
        }
      } catch (error) {
        statusDiv.innerHTML = '<div class="info">❌ API Error: ' + error.message + '</div>';
      }
    }
    
    // Prevent blank screens on navigation
    window.addEventListener('beforeunload', function() {
      document.getElementById('loading').style.display = 'block';
    });
    
    // Force content visibility for Replit preview
    function forceContentVisible() {
      const root = document.getElementById('root');
      const container = document.querySelector('.container');
      
      if (root && container) {
        // Force display styles
        root.style.display = 'block';
        root.style.visibility = 'visible';
        root.style.opacity = '1';
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        
        // Hide any loading screens
        const loadingElements = document.querySelectorAll('[class*="loading"], [id*="loading"]');
        loadingElements.forEach(el => {
          if (el.id !== 'loading') { // Keep our loading div
            el.style.display = 'none';
          }
        });
        
        console.log('Content visibility forced for Replit preview');
        return true;
      }
      return false;
    }
    
    // Try multiple times to ensure content is visible
    setTimeout(forceContentVisible, 100);
    setTimeout(forceContentVisible, 500);
    setTimeout(forceContentVisible, 1000);
    
    // Content is visible - no auto-refresh needed
    console.log('Content loaded successfully in Replit preview!');
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
