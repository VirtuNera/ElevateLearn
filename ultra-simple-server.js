// Ultra-simple server - absolutely minimal
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Ultra-simple server is working!'
    }));
    return;
  }
  
  res.writeHead(200);
  res.end(JSON.stringify({
    message: 'Server is running!',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  }));
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

console.log(`Starting ultra-simple server on ${HOST}:${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Health check: http://${HOST}:${PORT}/api/health`);

server.listen(PORT, HOST, () => {
  console.log(`✅ Ultra-simple server started on ${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
