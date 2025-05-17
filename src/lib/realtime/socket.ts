import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

let io: SocketIOServer | null = null;

export const config = {
  api: {
    bodyParser: false,
  },
};

export function getSocketServer() {
  return io;
}

export default async function initSocketServer(req: NextApiRequest, res: NextApiResponse) {
  if (io) {
    // Socket.IO server already initialized
    res.end();
    return;
  }

  // Verify session
  const session = await getServerSession(authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  const httpServer: NetServer = res.socket?.server as any;
  
  io = new SocketIOServer(httpServer, {
    path: '/api/socketio',
    // Add authentication with JWT check
    async beforeHandle(req, next) {
      try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
          return next(new Error('Not authenticated'));
        }
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    },
  });

  // Socket.IO connection event
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join user to a room based on their ID
    if (session?.user?.id) {
      socket.join(`user:${session.user.id}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  res.end();
} 