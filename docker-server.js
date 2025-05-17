const http = require('http');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const url = require('url');

const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Simple in-memory auth mechanism (replace with proper auth in production)
const isAdmin = (req) => {
  // Check for admin Authorization header (basic implementation)
  const authHeader = req.headers.authorization;
  // In a real app, verify JWT token or session
  return authHeader === 'Bearer admin-token';
};

// Simple logging function
const logAdminAction = async (action, userId, details) => {
  try {
    await prisma.adminLog.create({
      data: {
        action,
        userId,
        details: JSON.stringify(details),
        timestamp: new Date()
      }
    });
    console.log(`Admin action logged: ${action}`);
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Helper to parse JSON body from request
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
};

// Create a simple HTTP server
const server = http.createServer(async (req, res) => {
  // Parse URL for path and query parameters
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Admin API endpoints
  if (pathname.startsWith('/api/admin/')) {
    // Check admin authorization for all admin routes
    if (!isAdmin(req)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized. Admin access required.' }));
      return;
    }
    
    // GET /api/admin/users - List all users with filters
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      try {
        const { community, role, status } = query;
        
        // Build filter object
        const filter = {};
        if (community) filter.communityId = community;
        if (role) filter.role = role;
        if (status) filter.status = status;
        
        const users = await prisma.user.findMany({
          where: filter,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            community: true
          }
        });
        
        await logAdminAction('LIST_USERS', null, { filters: query });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    
    // GET /api/admin/events - List all events
    else if (pathname === '/api/admin/events' && req.method === 'GET') {
      try {
        const events = await prisma.event.findMany();
        
        await logAdminAction('LIST_EVENTS', null, {});
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(events));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    
    // GET /api/admin/circles - List all circles
    else if (pathname === '/api/admin/circles' && req.method === 'GET') {
      try {
        const circles = await prisma.circle.findMany();
        
        await logAdminAction('LIST_CIRCLES', null, {});
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(circles));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    
    // PATCH /api/admin/user/:id - Update user role or status
    else if (pathname.match(/^\/api\/admin\/user\/\d+$/) && req.method === 'PATCH') {
      try {
        const userId = pathname.split('/').pop();
        const data = await parseBody(req);
        
        // Only allow updating role or status
        const updateData = {};
        if (data.role) updateData.role = data.role;
        if (data.status) updateData.status = data.status;
        
        const updatedUser = await prisma.user.update({
          where: { id: parseInt(userId) },
          data: updateData
        });
        
        await logAdminAction('UPDATE_USER', userId, { 
          changes: updateData 
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updatedUser));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    
    // DELETE /api/admin/event/:id - Delete an event
    else if (pathname.match(/^\/api\/admin\/event\/\d+$/) && req.method === 'DELETE') {
      try {
        const eventId = pathname.split('/').pop();
        
        await prisma.event.delete({
          where: { id: parseInt(eventId) }
        });
        
        await logAdminAction('DELETE_EVENT', null, { eventId });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Event deleted successfully' }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    
    // DELETE /api/admin/circle/:id - Delete a circle
    else if (pathname.match(/^\/api\/admin\/circle\/\d+$/) && req.method === 'DELETE') {
      try {
        const circleId = pathname.split('/').pop();
        
        await prisma.circle.delete({
          where: { id: parseInt(circleId) }
        });
        
        await logAdminAction('DELETE_CIRCLE', null, { circleId });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Circle deleted successfully' }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
    
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    
    return;
  }
  
  // Original routes
  if (pathname === '/') {
    // Send a basic HTML homepage
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>News Social Network</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
            .success { color: green; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>News Social Network</h1>
          <div class="container">
            <h2>Docker Container Status</h2>
            <p class="success">✅ Container is running successfully!</p>
            <p>This is a simplified Docker server for the News Social Network application.</p>
            <p>The full Next.js application with all features would be running in a production environment.</p>
          </div>
          <div class="container">
            <h2>API Endpoints</h2>
            <ul>
              <li><a href="/api/status">/api/status</a> - Check API status</li>
              <li><a href="/api/db-status">/api/db-status</a> - Check database connection</li>
              <li><strong>Admin APIs:</strong></li>
              <li>/api/admin/users - List all users</li>
              <li>/api/admin/events - List all events</li>
              <li>/api/admin/circles - List all circles</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  } 
  else if (pathname === '/api/status') {
    // Return API status
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }));
  }
  else if (pathname === '/api/db-status') {
    // Check database connection
    try {
      // Try to query the database
      const dbStatus = await prisma.$queryRaw`SELECT 1 as result`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        message: 'Database connection successful',
        data: dbStatus
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      }));
    }
  }
  else {
    // 404 for everything else
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Docker server running on port ${port}`);
  console.log(`Visit http://localhost:${port} to see the homepage`);
}); 