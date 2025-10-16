import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";

// Production-safe logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5000',
    database: process.env.DATABASE_URL ? 'configured' : 'missing'
  });
});

// CORS middleware (dynamic allowlist)
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://elevatelearn-frontend.onrender.com", // Render frontend
      "https://virtunera.github.io",                // GitHub Pages root
      "https://virtunera.github.io/ElevateLearn",   // GitHub Pages project path
      "http://localhost:5173",                      // Vite dev
      "http://localhost:3000"                       // Alt dev
    ];

    // Append extra origins from env (comma-separated)
    if (process.env.CORS_EXTRA_ORIGINS) {
      const extras = process.env.CORS_EXTRA_ORIGINS
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      allowedOrigins.push(...extras);
    }

    // Allow non-browser clients without Origin (e.g., curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // allow cookies
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
      
      // Add demo login routes for local development
      const { setupAuth } = await import("./replitAuth");
      await setupAuth(app);
      console.log('Demo login routes registered for local development');
      
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
        note: 'This is an API-only deployment. Frontend is served from Render Static Site.'
      });
    });

    // Use `PORT` provided in environment or default to 5000
    const port = Number(process.env.PORT) || 5000;
    
    console.log(`Attempting to listen on 0.0.0.0:${port}`);
    server.listen(port, "0.0.0.0", () => {
      log(`✅ Server started successfully on port ${port} and host 0.0.0.0`);
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
