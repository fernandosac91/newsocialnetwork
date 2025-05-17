import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getToken } from 'next-auth/jwt';
import { decode } from 'jsonwebtoken';
import prisma from '@/lib/db/prisma';

// Types for socket with authenticated user info
interface AuthenticatedSocket extends SocketIOServer {
  userId?: string;
  communityId?: string;
  username?: string;
}

// Global socket.io server instance (will be initialized once)
let io: SocketIOServer | null = null;

// Store active users
const activeUsers = new Map<string, string>(); // userId -> socketId

/**
 * Initialize the Socket.IO server
 */
export function initSocketServer(server: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  });

  // Socket.IO authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      // Verify JWT token
      const secret = process.env.NEXTAUTH_SECRET;
      if (!secret) {
        return next(new Error('Server configuration error'));
      }

      // Decode token to get user information
      const decoded = decode(token) as any;
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      // Get user from database to verify existence and get up-to-date info
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub || decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          communityId: true,
          status: true,
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.status !== 'APPROVED') {
        return next(new Error('User account is not approved'));
      }

      // Attach user info to socket
      socket.userId = user.id;
      socket.communityId = user.communityId || undefined;
      socket.username = user.name || user.email || 'Anonymous';

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection event handler
  io.on('connection', (socket: any) => {
    console.log(`User connected: ${socket.userId} (${socket.username})`);

    if (socket.userId) {
      // Store user as active
      activeUsers.set(socket.userId, socket.id);

      // Join community room
      if (socket.communityId) {
        socket.join(`community:${socket.communityId}`);
      }

      // Join personal room for direct messages
      socket.join(`user:${socket.userId}`);

      // Notify others in the same community that user is online
      if (socket.communityId) {
        socket.to(`community:${socket.communityId}`).emit('user:online', {
          userId: socket.userId,
          username: socket.username,
        });
      }

      // Emit list of active users in the same community
      const communityActiveUsers = Array.from(activeUsers.keys())
        .filter(async (userId) => {
          // Get user's community
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { communityId: true },
          });
          return user?.communityId === socket.communityId;
        });

      socket.emit('users:active', communityActiveUsers);
    }

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      if (socket.userId) {
        // Remove user from active users
        activeUsers.delete(socket.userId);

        // Notify others the user went offline
        if (socket.communityId) {
          socket.to(`community:${socket.communityId}`).emit('user:offline', {
            userId: socket.userId,
          });
        }
      }
    });
  });

  console.log('Socket.IO server initialized');
  return io;
}

/**
 * Get the Socket.IO server instance (or throw if not initialized)
 */
export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO server not initialized');
  }
  return io;
}

/**
 * Check if a user is online
 */
export function isUserOnline(userId: string): boolean {
  return activeUsers.has(userId);
}

/**
 * Get all active users
 */
export function getActiveUsers(): string[] {
  return Array.from(activeUsers.keys());
}

/**
 * Get the socketId for a userId
 */
export function getSocketId(userId: string): string | undefined {
  return activeUsers.get(userId);
}