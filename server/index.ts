import express, { type Request, Response, NextFunction } from "express";
import { setupVite, log } from "./vite";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5000',
    database: process.env.DATABASE_URL ? 'configured' : 'missing'
  });
});

// CORS middleware
app.use(cors({
  origin: [
    "https://virtunera.github.io",
    "https://virtunera.github.io/ElevateLearn", // Your specific GitHub Pages URL
    "http://localhost:5173", // Development
    "http://localhost:3000"  // Alternative development port
  ],
  credentials: true,                       // allow cookies
}));

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
  try {
    console.log('Starting Elevate360 LMS server...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Port:', process.env.PORT || '5000');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Missing!');
    
    let server: any;
    
    // Only register routes if database is available
    if (process.env.DATABASE_URL) {
      const { registerRoutes } = await import("./routes");
      server = await registerRoutes(app);
      console.log('Routes registered successfully');
    } else {
      console.log('⚠️  DATABASE_URL not set - running in limited mode');
      // Add a simple test route
      app.get('/api/test', (req, res) => {
        res.json({ message: 'Server is running but database not configured' });
      });
      // Create a simple server for limited mode
      server = app;
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Express error:', err);
      res.status(status).json({ message });
      throw err;
    });

    // API-only mode: only setup vite in development
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log('Vite development server setup complete');
    } else {
      // Production: API-only mode - no static file serving
      console.log('Running in API-only mode (no static file serving)');
      
      // Add a simple root endpoint for API-only mode
      app.get('/', (req, res) => {
        res.json({
          message: 'Elevate360 LMS API Server',
          status: 'running',
          version: '2.0.0',
          endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            courses: '/api/courses/*',
            users: '/api/users/*'
          },
          note: 'This is an API-only deployment. Frontend is served from GitHub Pages.'
        });
      });
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Railway expects the app to listen on the PORT environment variable
    // this serves both the API and the client.
    const HOST = process.env.HOST ?? '0.0.0.0';  // Use 0.0.0.0 for Railway
    const PORT = Number(process.env.PORT) || 5000;
    
    console.log(`Attempting to listen on ${HOST}:${PORT}`);
    server.listen(PORT, HOST, () => {
      log(`✅ Server started successfully on port ${PORT} and host ${HOST}`);
      console.log(`🚀 Elevate360 LMS API server is running!`);
    });
    
    // Handle server errors
    server.on('error', (err: any) => {
      console.error('Server error:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
