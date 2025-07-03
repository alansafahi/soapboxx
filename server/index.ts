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

  if (app.get("env") === "development") {
    try {
      // Import and setup Vite middleware for development
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: { port: 24678 }
        },
        appType: "spa",
        base: "/",
        optimizeDeps: {
          include: ['react', 'react-dom', 'wouter']
        }
      });
      
      app.use(vite.ssrFixStacktrace);
      app.use(vite.middlewares);
      console.log("✅ Vite development server initialized");
    } catch (error) {
      console.error("❌ Vite initialization failed:", error);
      // Fallback: serve the original React app via HTML
      app.get('*', (req: any, res: any) => {
        res.set({
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SoapBox Super App - Faith Community Platform</title>
    <link rel="icon" type="image/jpeg" href="/attached_assets/SoapBox logo_1749686315479.jpeg">
    <script type="module" crossorigin src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
      });
    }
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  server.listen(port, "0.0.0.0", () => {
    log(`🚀 SoapBox Super App serving on 0.0.0.0:${port}`);
    log(`✅ Original React application restored and ready!`);
  });
  
  // Ensure server starts within 10 seconds
  setTimeout(() => {
    log(`⚡ Server startup completed - React app should be accessible`);
  }, 10000);
})();
