import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getToken } from 'next-auth/jwt';
import { decode } from 'jsonwebtoken';
import prisma from '@/lib/db/prisma';

// Types for socket with authenticated user info
interface AuthenticatedSocket extends Socket {
  userId?: string;
  communityId?: string;
  username?: string;
}

// Types for chat message
interface ChatMessage {
  senderId: string;
  receiverId?: string;
  circleId?: string;
  content: string;
  timestamp: Date;
}

// Global socket.io server instance (will be initialized once)
let io: SocketIOServer | null = null;

// Store active users
const activeUsers = new Map<string, string>(); // userId -> socketId

/**
 * Initialize the Socket.IO server
 */
export function initSocketServer(server: NetServer): SocketIOServer {
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
  io.use(async (socket: AuthenticatedSocket, next) => {
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
  io.on('connection', (socket: AuthenticatedSocket) => {
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

    // Private message handler
    socket.on('message:private', async (data: Omit<ChatMessage, 'timestamp' | 'senderId'>) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { receiverId, content, circleId } = data;

        // For direct messages, ensure receiverId is provided
        if (!receiverId && !circleId) {
          socket.emit('error', { message: 'Recipient or circle is required' });
          return;
        }

        // Direct message to a user
        if (receiverId) {
          // Get receiver's community to verify they are in the same community
          const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { communityId: true },
          });

          if (!receiver) {
            socket.emit('error', { message: 'Recipient not found' });
            return;
          }

          // Ensure users are in the same community
          if (receiver.communityId !== socket.communityId) {
            socket.emit('error', { message: 'Cannot send messages to users outside your community' });
            return;
          }

          // Store message in database
          const message = await prisma.chatMessage.create({
            data: {
              content,
              senderId: socket.userId,
              receiverId,
              sentAt: new Date(),
            },
          });

          const messagePayload = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            timestamp: message.sentAt,
            senderName: socket.username,
          };

          // Send message to receiver if they are online
          const receiverSocketId = activeUsers.get(receiverId);
          if (receiverSocketId) {
            io?.to(receiverSocketId).emit('message:receive', messagePayload);
          }

          // Also send back to sender for confirmation
          socket.emit('message:sent', messagePayload);
        }
        // Circle (group) message
        else if (circleId) {
          // Verify circle exists and user is a member
          const circleMember = await prisma.circleMember.findUnique({
            where: {
              circleId_userId: {
                circleId,
                userId: socket.userId,
              },
            },
            include: {
              circle: {
                select: {
                  id: true,
                  name: true,
                  communityId: true,
                },
              },
            },
          });

          if (!circleMember) {
            socket.emit('error', { message: 'You are not a member of this circle' });
            return;
          }

          // Verify the circle is in the user's community
          if (circleMember.circle.communityId !== socket.communityId) {
            socket.emit('error', { message: 'Cannot send messages to circles outside your community' });
            return;
          }

          // Store message in database
          const message = await prisma.chatMessage.create({
            data: {
              content,
              senderId: socket.userId,
              circleId,
              sentAt: new Date(),
            },
          });

          const messagePayload = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            circleId: message.circleId,
            timestamp: message.sentAt,
            senderName: socket.username,
          };

          // Broadcast to all members of the circle
          socket.to(`circle:${circleId}`).emit('message:circle', messagePayload);

          // Also send back to sender for confirmation
          socket.emit('message:sent', messagePayload);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ receiverId, circleId }) => {
      if (!socket.userId) return;

      if (receiverId) {
        // Send typing indicator to the recipient
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io?.to(receiverSocketId).emit('typing:update', {
            userId: socket.userId,
            username: socket.username,
            isTyping: true,
          });
        }
      } else if (circleId) {
        // Broadcast typing status to circle
        socket.to(`circle:${circleId}`).emit('typing:update', {
          userId: socket.userId,
          username: socket.username,
          isTyping: true,
          circleId,
        });
      }
    });

    socket.on('typing:stop', ({ receiverId, circleId }) => {
      if (!socket.userId) return;

      if (receiverId) {
        // Send typing stopped to the recipient
        const receiverSocketId = activeUsers.get(receiverId);
        if (receiverSocketId) {
          io?.to(receiverSocketId).emit('typing:update', {
            userId: socket.userId,
            username: socket.username,
            isTyping: false,
          });
        }
      } else if (circleId) {
        // Broadcast typing stopped to circle
        socket.to(`circle:${circleId}`).emit('typing:update', {
          userId: socket.userId,
          username: socket.username,
          isTyping: false,
          circleId,
        });
      }
    });

    // Read receipt
    socket.on('message:read', async ({ messageId }) => {
      if (!socket.userId) return;

      try {
        // Update message as read (would require an additional field in the database)
        // This is a placeholder for future implementation
        console.log(`Message ${messageId} read by ${socket.userId}`);

        // Notify the sender that the message was read
        const message = await prisma.chatMessage.findUnique({
          where: { id: messageId },
          select: { senderId: true },
        });

        if (message && message.senderId) {
          const senderSocketId = activeUsers.get(message.senderId);
          if (senderSocketId) {
            io?.to(senderSocketId).emit('message:receipt', {
              messageId,
              readBy: socket.userId,
              timestamp: new Date(),
            });
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Join a circle's chat room
    socket.on('circle:join', async ({ circleId }) => {
      if (!socket.userId) return;

      try {
        // Verify user is a member of the circle
        const membership = await prisma.circleMember.findUnique({
          where: {
            circleId_userId: {
              circleId,
              userId: socket.userId,
            },
          },
        });

        if (!membership) {
          socket.emit('error', { message: 'You are not a member of this circle' });
          return;
        }

        // Join the circle's room
        socket.join(`circle:${circleId}`);
        socket.emit('circle:joined', { circleId });
      } catch (error) {
        console.error('Error joining circle:', error);
        socket.emit('error', { message: 'Failed to join circle chat' });
      }
    });

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