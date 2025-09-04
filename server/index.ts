import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
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
    port: process.env.PORT || '5000'
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
    
    const server = await registerRoutes(app);
    console.log('Routes registered successfully');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Express error:', err);
      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log('Vite development server setup complete');
    } else {
      serveStatic(app);
      console.log('Static file serving setup complete');
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
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
