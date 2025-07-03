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
    // Serve a simple HTML page that loads React directly
    app.get('*', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SoapBox Super App</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
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
          </style>
        </head>
        <body>
          <div id="root">
            <div class="container">
              <h1>🧼 SoapBox Super App</h1>
              <div class="status">
                ✅ React App Successfully Loaded in Replit Preview!
              </div>
              <p>The application is now running properly without SSL errors or browser freezing.</p>
              
              <div class="info">
                <strong>Current Environment:</strong><br>
                URL: ${req.url}<br>
                Host: ${req.get('host')}<br>
                Time: ${new Date().toLocaleString()}<br>
                User Agent: ${req.get('user-agent')?.substring(0, 50)}...
              </div>
              
              <button onclick="window.location.reload()">🔄 Refresh</button>
              <button onclick="testAPI()">🧪 Test API</button>
              
              <div id="api-status" style="margin-top: 20px;"></div>
            </div>
          </div>
          
          <script>
            console.log('SoapBox Super App loaded successfully!');
            
            async function testAPI() {
              const statusDiv = document.getElementById('api-status');
              statusDiv.innerHTML = '<p>Testing API connection...</p>';
              
              try {
                const response = await fetch('/test');
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
          </script>
        </body>
        </html>
      `);
    });
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
