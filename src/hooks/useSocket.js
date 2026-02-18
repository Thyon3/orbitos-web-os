import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('user-online', (userData) => {
      setActiveUsers(prev => [...prev.filter(u => u.userId !== userData.userId), userData]);
    });

    newSocket.on('user-offline', (userData) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== userData.userId));
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  const joinDocument = (documentId) => {
    if (socket) {
      socket.emit('join-document', { documentId });
    }
  };

  const leaveDocument = (documentId) => {
    if (socket) {
      socket.emit('leave-document', { documentId });
    }
  };

  const sendCursorMove = (documentId, position) => {
    if (socket) {
      socket.emit('cursor-move', { documentId, position });
    }
  };

  const sendTextChange = (documentId, operation, version) => {
    if (socket) {
      socket.emit('text-change', { documentId, operation, version });
    }
  };

  const sendSelectionChange = (documentId, selection) => {
    if (socket) {
      socket.emit('selection-change', { documentId, selection });
    }
  };

  const joinCall = (roomId) => {
    if (socket) {
      socket.emit('join-call', { roomId });
    }
  };

  const leaveCall = (roomId) => {
    if (socket) {
      socket.emit('leave-call', { roomId });
    }
  };

  const sendCallSignal = (roomId, signal, targetUserId) => {
    if (socket) {
      socket.emit('call-signal', { roomId, signal, targetUserId });
    }
  };

  const startScreenShare = (roomId) => {
    if (socket) {
      socket.emit('start-screen-share', { roomId });
    }
  };

  const stopScreenShare = (roomId) => {
    if (socket) {
      socket.emit('stop-screen-share', { roomId });
    }
  };

  const shareFile = (roomId, file) => {
    if (socket) {
      socket.emit('share-file', { roomId, file });
    }
  };

  const sendChatMessage = (roomId, message) => {
    if (socket) {
      socket.emit('chat-message', { roomId, message });
    }
  };

  const startTyping = (roomId) => {
    if (socket) {
      socket.emit('typing-start', { roomId });
    }
  };

  const stopTyping = (roomId) => {
    if (socket) {
      socket.emit('typing-stop', { roomId });
    }
  };

  return {
    socket,
    connected,
    activeUsers,
    notifications,
    joinDocument,
    leaveDocument,
    sendCursorMove,
    sendTextChange,
    sendSelectionChange,
    joinCall,
    leaveCall,
    sendCallSignal,
    startScreenShare,
    stopScreenShare,
    shareFile,
    sendChatMessage,
    startTyping,
    stopTyping
  };
};
