const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare to run Next.js
app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Import and initialize Socket.IO server
  // We require this here to ensure Next.js is initialized first
  const { initSocketServer } = require('./src/lib/socket/server');
  initSocketServer(server);

  // Start HTTP server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 