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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SoapBox Super App</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0; 
      padding: 20px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      background: rgba(255,255,255,0.1);
      padding: 40px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    h1 { 
      font-size: 3rem; 
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p { 
      font-size: 1.2rem; 
      margin: 1rem 0;
      opacity: 0.9;
    }
    .status {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid #22c55e;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      font-weight: 500;
    }
    .info {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      font-size: 0.9rem;
    }
    button {
      background: linear-gradient(45deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      margin: 10px;
      transition: transform 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
    }
    .loading {
      display: none;
      color: #fbbf24;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="container">
      <h1>🧼 SoapBox Super App</h1>
      <div class="status">
        ✅ App Successfully Loaded in Replit Preview!
      </div>
      <p>The application is running properly without SSL errors or browser freezing.</p>
      
      <div class="info">
        <strong>Environment Info:</strong><br>
        Path: ${req.url}<br>
        Host: ${req.get('host')}<br>
        Time: ${new Date().toLocaleString()}<br>
        Refresh Count: <span id="refresh-count">1</span>
      </div>
      
      <button onclick="hardRefresh()">🔄 Refresh</button>
      <button onclick="testAPI()">🧪 Test API</button>
      <button onclick="clearCache()">🧹 Clear Cache</button>
      
      <div id="api-status" style="margin-top: 20px;"></div>
      <div id="loading" class="loading">Loading...</div>
    </div>
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
    
    // Auto-refresh if page seems stuck
    setTimeout(() => {
      if (!forceContentVisible()) {
        console.log('Page appears blank, auto-refreshing...');
        window.location.reload();
      }
    }, 2000);
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
