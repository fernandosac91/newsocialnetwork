import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const initSocketServer = (server: HTTPServer) => {
  const io = new SocketIOServer(server);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};