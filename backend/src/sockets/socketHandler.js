import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

let ioInstance = null;

export const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(); // Allow anonymous connection, can authenticate later
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    // If authenticated via handshake
    if (socket.user?.userId) {
      socket.join(`user:${socket.user.userId}`);
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
      }
    }

    // Manual join room event
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  return ioInstance;
};

export const emitToUser = (userId, eventName, payload) => {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(eventName, payload);
  }
};

export const emitToRole = (role, eventName, payload) => {
  if (ioInstance && role) {
    ioInstance.to(`role:${role}`).emit(eventName, payload);
  }
};
