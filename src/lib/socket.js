import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';

class SocketManager {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
        methods: ["GET", "POST"]
      }
    });
    
    this.activeUsers = new Map();
    this.documentSessions = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        
        if (!user) {
          return next(new Error('User not found'));
        }
        
        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.username} connected`);
      
      // Add user to active users
      this.activeUsers.set(socket.userId, {
        socketId: socket.id,
        user: socket.user,
        lastSeen: new Date()
      });

      // Broadcast user presence
      socket.broadcast.emit('user-online', {
        userId: socket.userId,
        username: socket.user.username,
        avatar: socket.user.avatar
      });

      // Handle document collaboration
      socket.on('join-document', async (data) => {
        const { documentId } = data;
        
        socket.join(documentId);
        
        if (!this.documentSessions.has(documentId)) {
          this.documentSessions.set(documentId, new Set());
        }
        
        this.documentSessions.get(documentId).add(socket.userId);
        
        // Notify others in the document
        socket.to(documentId).emit('user-joined-document', {
          userId: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar
        });

        // Send current document state
        socket.emit('document-users', Array.from(this.documentSessions.get(documentId)));
      });

      socket.on('leave-document', (data) => {
        const { documentId } = data;
        socket.leave(documentId);
        
        if (this.documentSessions.has(documentId)) {
          this.documentSessions.get(documentId).delete(socket.userId);
          if (this.documentSessions.get(documentId).size === 0) {
            this.documentSessions.delete(documentId);
          }
        }
        
        socket.to(documentId).emit('user-left-document', {
          userId: socket.userId
        });
      });

      // Handle real-time cursor movements
      socket.on('cursor-move', (data) => {
        const { documentId, position } = data;
        socket.to(documentId).emit('cursor-update', {
          userId: socket.userId,
          username: socket.user.username,
          position
        });
      });

      // Handle text changes
      socket.on('text-change', (data) => {
        const { documentId, operation, version } = data;
        socket.to(documentId).emit('text-change', {
          userId: socket.userId,
          operation,
          version
        });
      });

      // Handle selection changes
      socket.on('selection-change', (data) => {
        const { documentId, selection } = data;
        socket.to(documentId).emit('selection-update', {
          userId: socket.userId,
          selection
        });
      });

      // Handle video calls
      socket.on('join-call', (data) => {
        const { roomId } = data;
        socket.join(roomId);
        
        socket.to(roomId).emit('user-joined-call', {
          userId: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar
        });
      });

      socket.on('leave-call', (data) => {
        const { roomId } = data;
        socket.leave(roomId);
        socket.to(roomId).emit('user-left-call', {
          userId: socket.userId
        });
      });

      socket.on('call-signal', (data) => {
        const { roomId, signal, targetUserId } = data;
        this.io.to(roomId).emit('call-signal', {
          fromUserId: socket.userId,
          signal
        });
      });

      // Handle screen sharing
      socket.on('start-screen-share', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('screen-share-started', {
          userId: socket.userId,
          username: socket.user.username
        });
      });

      socket.on('stop-screen-share', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('screen-share-stopped', {
          userId: socket.userId
        });
      });

      // Handle file sharing
      socket.on('share-file', (data) => {
        const { roomId, file } = data;
        socket.to(roomId).emit('file-shared', {
          userId: socket.userId,
          username: socket.user.username,
          file
        });
      });

      // Handle chat messages
      socket.on('chat-message', (data) => {
        const { roomId, message } = data;
        const messageData = {
          id: Date.now().toString(),
          userId: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar,
          message,
          timestamp: new Date()
        };
        
        this.io.to(roomId).emit('chat-message', messageData);
      });

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          username: socket.user.username
        });
      });

      socket.on('typing-stop', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('user-stopped-typing', {
          userId: socket.userId
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.username} disconnected`);
        
        // Remove from active users
        this.activeUsers.delete(socket.userId);
        
        // Remove from all document sessions
        this.documentSessions.forEach((users, documentId) => {
          if (users.has(socket.userId)) {
            users.delete(socket.userId);
            socket.to(documentId).emit('user-left-document', {
              userId: socket.userId
            });
          }
        });
        
        // Broadcast user offline
        socket.broadcast.emit('user-offline', {
          userId: socket.userId
        });
      });
    });
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.values()).map(user => ({
      userId: user.socketId,
      username: user.user.username,
      avatar: user.user.avatar,
      lastSeen: user.lastSeen
    }));
  }

  getDocumentUsers(documentId) {
    if (!this.documentSessions.has(documentId)) {
      return [];
    }
    
    const userIds = Array.from(this.documentSessions.get(documentId));
    return userIds.map(userId => {
      const user = this.activeUsers.get(userId);
      return user ? {
        userId: userId,
        username: user.user.username,
        avatar: user.user.avatar
      } : null;
    }).filter(Boolean);
  }

  sendNotification(userId, notification) {
    const user = this.activeUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit('notification', notification);
    }
  }
}

export default SocketManager;
