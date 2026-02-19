import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';

const AISmartAssistant = () => {
  const { theme } = useTheme();
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with tasks, answer questions, and control your OrbitOS system. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Open a new application',
        'Help me organize my files',
        'What\'s my system status?',
        'Set a reminder'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [context, setContext] = useState({});
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // AI Commands and capabilities
  const aiCommands = {
    // Application control
    'open': {
      patterns: ['open', 'launch', 'start'],
      action: (params) => {
        const appMap = {
          'notes': { id: 'notes', name: 'Notes' },
          'browser': { id: 'browser', name: 'Browser' },
          'calculator': { id: 'calculator', name: 'Calculator' },
          'terminal': { id: 'terminal', name: 'Terminal' },
          'settings': { id: 'settings', name: 'Settings' },
          'files': { id: 'filemanager', name: 'File Manager' },
          'monitor': { id: 'monitor', name: 'Task Manager' }
        };
        
        const appName = params.toLowerCase();
        const app = appMap[appName];
        
        if (app) {
          dispatch({ type: 'OPEN_APP', payload: app });
          return `Opened ${app.name}`;
        } else {
          return `I don't know how to open "${appName}". Available apps: ${Object.keys(appMap).join(', ')}`;
        }
      }
    },
    
    // Window management
    'close': {
      patterns: ['close', 'exit'],
      action: (params) => {
        const appName = params.toLowerCase();
        const app = state.openApps.find(app => app.name.toLowerCase() === appName);
        
        if (app) {
          dispatch({ type: 'CLOSE_APP', payload: app.id });
          return `Closed ${app.name}`;
        } else {
          return `I don't see "${appName}" open. Current apps: ${state.openApps.map(app => app.name).join(', ')}`;
        }
      }
    },
    
    // System information
    'status': {
      patterns: ['status', 'how', 'what'],
      action: (params) => {
        if (params.includes('system') || params.includes('performance')) {
          return `System Status:
• CPU Usage: ${Math.round(Math.random() * 100)}%
• Memory Usage: ${Math.round(Math.random() * 100)}%
• Active Apps: ${state.openApps.length}
• Uptime: ${Math.floor(Date.now() / 1000 / 60)} minutes`;
        }
        
        if (params.includes('apps') || params.includes('applications')) {
          const appList = state.openApps.map(app => `• ${app.name}`).join('\n');
          return `Currently open applications:\n${appList}`;
        }
        
        return 'I can help you check system status, performance, or running apps. What would you like to know?';
      }
    },
    
    // File operations
    'file': {
      patterns: ['file', 'document', 'folder'],
      action: (params) => {
        if (params.includes('create') || params.includes('new')) {
          return 'I can help you create files. What type of file would you like to create? (document, note, spreadsheet, etc.)';
        }
        
        if (params.includes('find') || params.includes('search')) {
          return 'I can search your files. What are you looking for?';
        }
        
        if (params.includes('organize') || params.includes('clean')) {
          return 'I can help organize your files. Would you like me to suggest a folder structure or help you move files around?';
        }
        
        return 'I can help with file operations like creating, finding, organizing, and managing files. What would you like to do?';
      }
    },
    
    // Reminders and tasks
    'remind': {
      patterns: ['remind', 'reminder', 'task', 'todo'],
      action: (params) => {
        if (params.includes('set') || params.includes('create')) {
          return 'I can set reminders for you. What would you like to be reminded about and when?';
        }
        
        if (params.includes('show') || params.includes('list')) {
          return 'You have no active reminders. Would you like to create one?';
        }
        
        return 'I can help you manage reminders and tasks. What would you like to do?';
      }
    },
    
    // Help and assistance
    'help': {
      patterns: ['help', 'how to', 'what can'],
      action: (params) => {
        return `I can help you with:
• Opening and closing applications
• Managing windows and files
• Checking system status
• Setting reminders
• Answering questions about OrbitOS
• Providing suggestions and recommendations

Try asking me to "open notes", "check system status", or "help me organize files"`;
      }
    },
    
    // Theme and appearance
    'theme': {
      patterns: ['theme', 'dark', 'light', 'appearance'],
      action: (params) => {
        if (params.includes('dark')) {
          // Switch to dark theme
          return 'Switched to dark theme';
        }
        
        if (params.includes('light')) {
          // Switch to light theme
          return 'Switched to light theme';
        }
        
        return 'I can help you change themes. Would you like to switch to dark or light theme?';
      }
    },
    
    // Search and web
    'search': {
      patterns: ['search', 'find', 'look up', 'google'],
      action: (params) => {
        const query = params.replace(/search|find|look up|google/gi, '').trim();
        if (query) {
          return `I can search for "${query}". Would you like me to open a browser and search the web, or search your local files?`;
        }
        return 'What would you like me to search for?';
      }
    },
    
    // Calculations
    'calculate': {
      patterns: ['calculate', 'math', 'compute'],
      action: (params) => {
        const expression = params.replace(/calculate|math|compute/gi, '').trim();
        try {
          // Simple calculation (in production, use a proper math library)
          const result = eval(expression);
          return `${expression} = ${result}`;
        } catch {
          return 'I couldn\'t calculate that. Please provide a valid mathematical expression.';
        }
      }
    }
  };

  // Process user input
  const processInput = (userInput) => {
    const input = userInput.toLowerCase().trim();
    
    // Find matching command
    for (const [commandName, command] of Object.entries(aiCommands)) {
      for (const pattern of command.patterns) {
        if (input.includes(pattern)) {
          return command.action(input);
        }
      }
    }
    
    // Default response
    return `I'm not sure how to help with "${userInput}". Try asking me to open an app, check system status, or type "help" for more options.`;
  };

  // Generate suggestions based on context
  const generateSuggestions = (input) => {
    if (!input) {
      return [
        'Open notes',
        'Check system status',
        'Create a new file',
        'Set a reminder',
        'Search the web',
        'Help with files'
      ];
    }
    
    const inputLower = input.toLowerCase();
    const suggestions = [];
    
    if (inputLower.includes('open')) {
      suggestions.push('Open notes', 'Open browser', 'Open terminal', 'Open settings');
    } else if (inputLower.includes('close')) {
      const openApps = state.openApps.map(app => `Close ${app.name}`);
      suggestions.push(...openApps.slice(0, 3));
    } else if (inputLower.includes('help')) {
      suggestions.push('Help with apps', 'Help with files', 'Help with system');
    } else if (inputLower.includes('search')) {
      suggestions.push('Search files', 'Search web', 'Search for images');
    }
    
    return suggestions.slice(0, 4);
  };

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const response = processInput(input);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: generateSuggestions(input)
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // Handle voice input
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser');
      return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update suggestions when input changes
  useEffect(() => {
    setSuggestions(generateSuggestions(input));
  }, [input, state.openApps]);

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h2 className="font-semibold">AI Assistant</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-xs text-gray-500">
                {isTyping ? 'Thinking...' : 'Online'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded ${voiceEnabled ? 'bg-blue-500 text-white' : theme.app.button}`}
          >
            🎤
          </button>
          <button
            onClick={() => setMessages([messages[0]])}
            className={`p-2 rounded ${theme.app.button}`}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${
                message.type === 'user' 
                  ? `bg-blue-500 text-white` 
                  : `${theme.app.bg} border ${theme.app.border}`
              } rounded-lg p-4`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(suggestion)}
                        className={`w-full text-left p-2 rounded text-sm ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : theme.app.button_subtle_hover
                        }`}
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className={`${theme.app.bg} border ${theme.app.border} rounded-lg p-4`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className={`border-t ${theme.app.border} p-4`}>
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className={`px-3 py-1 rounded-full text-sm ${theme.app.button_subtle_hover}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className={`flex-1 px-4 py-2 rounded ${theme.app.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          
          {voiceEnabled && (
            <button
              onClick={startVoiceInput}
              disabled={isListening}
              className={`px-4 py-2 rounded ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : theme.app.button
              } disabled:opacity-50`}
            >
              {isListening ? '🎙️' : '🎤'}
            </button>
          )}
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className={`px-4 py-2 rounded ${theme.app.button} disabled:opacity-50`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISmartAssistant;
