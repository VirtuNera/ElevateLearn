// Simple test server to verify Railway deployment
import express from "express";
import cors from "cors";

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://virtunera.github.io",
    "https://virtunera.github.io/ElevateLearn",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5000'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST ?? '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Test server started successfully on ${HOST}:${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
});

// Handle server errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
