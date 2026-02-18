import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

const CollaborativeEditor = ({ documentId, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [cursors, setCursors] = useState({});
  const [selections, setSelections] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [version, setVersion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const socket = useSocket();

  useEffect(() => {
    if (!socket.socket || !documentId) return;

    // Join document room
    socket.joinDocument(documentId);

    // Listen for cursor updates
    socket.socket.on('cursor-update', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: { ...data, timestamp: Date.now() }
      }));
    });

    // Listen for selection updates
    socket.socket.on('selection-update', (data) => {
      setSelections(prev => ({
        ...prev,
        [data.userId]: data.selection
      }));
    });

    // Listen for text changes
    socket.socket.on('text-change', (data) => {
      if (data.userId !== socket.socket.userId) {
        // Apply operation to content
        setContent(prev => applyOperation(prev, data.operation));
        setVersion(data.version);
      }
    });

    // Listen for user joined/left
    socket.socket.on('user-joined-document', (userData) => {
      setActiveUsers(prev => [...prev, userData]);
    });

    socket.socket.on('user-left-document', (data) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
      setSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[data.userId];
        return newSelections;
      });
    });

    // Listen for typing indicators
    socket.socket.on('user-typing', (data) => {
      setActiveUsers(prev => 
        prev.map(u => 
          u.userId === data.userId 
            ? { ...u, isTyping: true }
            : u
        )
      );
    });

    socket.socket.on('user-stopped-typing', (data) => {
      setActiveUsers(prev => 
        prev.map(u => 
          u.userId === data.userId 
            ? { ...u, isTyping: false }
            : u
        )
      );
    });

    return () => {
      socket.leaveDocument(documentId);
      socket.socket.off('cursor-update');
      socket.socket.off('selection-update');
      socket.socket.off('text-change');
      socket.socket.off('user-joined-document');
      socket.socket.off('user-left-document');
      socket.socket.off('user-typing');
      socket.socket.off('user-stopped-typing');
    };
  }, [socket.socket, documentId]);

  const applyOperation = (text, operation) => {
    switch (operation.type) {
      case 'insert':
        return text.slice(0, operation.position) + operation.text + text.slice(operation.position);
      case 'delete':
        return text.slice(0, operation.position) + text.slice(operation.position + operation.length);
      case 'replace':
        return text.slice(0, operation.position) + operation.text + text.slice(operation.position + operation.length);
      default:
        return text;
    }
  };

  const handleTextChange = useCallback((e) => {
    const newContent = e.target.value;
    const operation = calculateOperation(content, newContent);
    
    setContent(newContent);
    setVersion(prev => prev + 1);
    
    // Send change to other users
    socket.sendTextChange(documentId, operation, version + 1);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socket.startTyping(documentId);
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.stopTyping(documentId);
    }, 1000);
  }, [content, version, socket, documentId, isTyping]);

  const calculateOperation = (oldText, newText) => {
    // Simple diff algorithm - in production, use a proper OT/CRDT library
    const minLength = Math.min(oldText.length, newText.length);
    let start = 0;
    let end = 0;
    
    // Find start of difference
    while (start < minLength && oldText[start] === newText[start]) {
      start++;
    }
    
    // Find end of difference
    while (end < minLength - start && oldText[oldText.length - 1 - end] === newText[newText.length - 1 - end]) {
      end++;
    }
    
    const oldEnd = oldText.length - end;
    const newEnd = newText.length - end;
    
    if (oldEnd === start) {
      // Insertion
      return {
        type: 'insert',
        position: start,
        text: newText.slice(start, newEnd)
      };
    } else if (newEnd === start) {
      // Deletion
      return {
        type: 'delete',
        position: start,
        length: oldEnd - start
      };
    } else {
      // Replacement
      return {
        type: 'replace',
        position: start,
        length: oldEnd - start,
        text: newText.slice(start, newEnd)
      };
    }
  };

  const handleCursorMove = useCallback(() => {
    if (!textareaRef.current) return;
    
    const position = textareaRef.current.selectionStart;
    socket.sendCursorMove(documentId, position);
  }, [socket, documentId]);

  const handleSelectionChange = useCallback(() => {
    if (!textareaRef.current) return;
    
    const selection = {
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd
    };
    socket.sendSelectionChange(documentId, selection);
  }, [socket, documentId]);

  const getUserColor = (userId) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="relative w-full h-full">
      {/* Active users indicator */}
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
        <AnimatePresence>
          {activeUsers.map((user) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getUserColor(user.userId) }}
              />
              <span className="text-xs font-medium truncate max-w-20">
                {user.username}
              </span>
              {user.isTyping && (
                <motion.div
                  className="flex space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="w-1 h-1 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                  <motion.div
                    className="w-1 h-1 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1 h-1 bg-gray-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        onSelect={handleSelectionChange}
        onClick={handleCursorMove}
        onKeyUp={handleCursorMove}
        className="w-full h-full p-4 text-base font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border border-gray-300"
        placeholder="Start typing..."
      />

      {/* Remote cursors */}
      <div className="absolute inset-0 pointer-events-none">
        {Object.values(cursors).map((cursor) => {
          const user = activeUsers.find(u => u.userId === cursor.userId);
          if (!user) return null;
          
          return (
            <motion.div
              key={cursor.userId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute flex items-center"
              style={{
                left: `${cursor.position * 8}px`, // Approximate character width
                top: '20px',
                backgroundColor: getUserColor(cursor.userId)
              }}
            >
              <div className="w-0.5 h-4" />
              <div className="px-1 py-0.5 text-xs text-white rounded">
                {user.username}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Version indicator */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500">
        Version: {version}
      </div>
    </div>
  );
};

export default CollaborativeEditor;
