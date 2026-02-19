import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const CommandPalette = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { state, dispatch } = useApp();
  const { getShortcutsForAction } = useKeyboardShortcuts();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Available commands
  const commands = [
    // System commands
    { id: 'new-note', name: 'New Note', description: 'Create a new note', icon: '📝', action: 'openNotes', category: 'Apps' },
    { id: 'open-browser', name: 'Open Browser', description: 'Launch web browser', icon: '🌐', action: 'openBrowser', category: 'Apps' },
    { id: 'open-files', name: 'File Manager', description: 'Manage files', icon: '📁', action: 'openFileManager', category: 'Apps' },
    { id: 'open-settings', name: 'Settings', description: 'System settings', icon: '⚙️', action: 'openSettings', category: 'Apps' },
    { id: 'open-calculator', name: 'Calculator', description: 'Open calculator', icon: '🧮', action: 'openCalculator', category: 'Apps' },
    { id: 'open-terminal', name: 'Terminal', description: 'Open terminal', icon: '💻', action: 'openTerminal', category: 'Apps' },
    { id: 'task-manager', name: 'Task Manager', description: 'Monitor system performance', icon: '📊', action: 'taskManager', category: 'System' },
    { id: 'global-search', name: 'Global Search', description: 'Search everything', icon: '🔍', action: 'globalSearch', category: 'Search' },
    { id: 'screenshot', name: 'Screenshot', description: 'Take a screenshot', icon: '📸', action: 'screenshot', category: 'System' },
    
    // Theme commands
    { id: 'toggle-theme', name: 'Toggle Theme', description: 'Switch between light and dark', icon: '🎨', action: 'toggleTheme', category: 'Appearance' },
    { id: 'dark-theme', name: 'Dark Theme', description: 'Switch to dark theme', icon: '🌙', action: 'darkTheme', category: 'Appearance' },
    { id: 'light-theme', name: 'Light Theme', description: 'Switch to light theme', icon: '☀️', action: 'lightTheme', category: 'Appearance' },
    
    // Window commands
    { id: 'minimize-all', name: 'Minimize All Windows', description: 'Minimize all open windows', icon: '📉', action: 'minimizeAll', category: 'Windows' },
    { id: 'close-all', name: 'Close All Windows', description: 'Close all open windows', icon: '❌', action: 'closeAll', category: 'Windows' },
    { id: 'show-desktop', name: 'Show Desktop', description: 'Minimize all windows and show desktop', icon: '🖥️', action: 'showDesktop', category: 'Windows' },
    
    // File commands
    { id: 'new-file', name: 'New File', description: 'Create a new file', icon: '📄', action: 'newFile', category: 'Files' },
    { id: 'open-file', name: 'Open File', description: 'Open an existing file', icon: '📂', action: 'openFile', category: 'Files' },
    { id: 'save-file', name: 'Save File', description: 'Save current file', icon: '💾', action: 'saveFile', category: 'Files' },
    { id: 'save-as', name: 'Save As', description: 'Save file with new name', icon: '💾', action: 'saveAsFile', category: 'Files' },
    
    // Search commands
    { id: 'find', name: 'Find', description: 'Find text in current document', icon: '🔎', action: 'find', category: 'Search' },
    { id: 'replace', name: 'Replace', description: 'Find and replace text', icon: '🔄', action: 'replace', category: 'Search' },
    { id: 'search-google', name: 'Search Google', description: 'Search the web', icon: '🌍', action: 'searchGoogle', category: 'Search' },
    
    // System commands
    { id: 'lock-screen', name: 'Lock Screen', description: 'Lock the computer', icon: '🔒', action: 'lockScreen', category: 'System' },
    { id: 'logout', name: 'Logout', description: 'Sign out of your account', icon: '🚪', action: 'logout', category: 'System' },
    { id: 'restart', name: 'Restart', description: 'Restart the system', icon: '🔄', action: 'restart', category: 'System' },
    { id: 'shutdown', name: 'Shutdown', description: 'Turn off the system', icon: '⏻', action: 'shutdown', category: 'System' },
    
    // Accessibility
    { id: 'zoom-in', name: 'Zoom In', description: 'Increase zoom level', icon: '🔍+', action: 'zoomIn', category: 'Accessibility' },
    { id: 'zoom-out', name: 'Zoom Out', description: 'Decrease zoom level', icon: '🔍-', action: 'zoomOut', category: 'Accessibility' },
    { id: 'reset-zoom', name: 'Reset Zoom', description: 'Reset zoom to default', icon: '🔍', action: 'resetZoom', category: 'Accessibility' },
    
    // Development
    { id: 'dev-tools', name: 'Developer Tools', description: 'Open browser developer tools', icon: '🛠️', action: 'openDevTools', category: 'Development' },
    { id: 'console', name: 'Console', description: 'Open browser console', icon: '💬', action: 'openConsole', category: 'Development' },
    { id: 'inspect', name: 'Inspect Element', description: 'Inspect page elements', icon: '🔍', action: 'inspectElement', category: 'Development' },
  ];

  // Filter commands based on query
  const filteredCommands = commands.filter(command => {
    const searchTerm = query.toLowerCase();
    return (
      command.name.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.category.toLowerCase().includes(searchTerm)
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((groups, command) => {
    if (!groups[command.category]) {
      groups[command.category] = [];
    }
    groups[command.category].push(command);
    return groups;
  }, {});

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  // Execute command
  const executeCommand = (command) => {
    // Dispatch custom event for the action
    window.dispatchEvent(new CustomEvent('execute-command', {
      detail: { action: command.action, command }
    }));
    
    // Handle some commands directly
    switch (command.action) {
      case 'openNotes':
      case 'openBrowser':
      case 'openFileManager':
      case 'openSettings':
      case 'openCalculator':
      case 'openTerminal':
      case 'taskManager':
        const appMap = {
          openNotes: { id: 'notes', name: 'Notes' },
          openBrowser: { id: 'browser', name: 'Browser' },
          openFileManager: { id: 'filemanager', name: 'File Manager' },
          openSettings: { id: 'settings', name: 'Settings' },
          openCalculator: { id: 'calculator', name: 'Calculator' },
          openTerminal: { id: 'terminal', name: 'Terminal' },
          taskManager: { id: 'monitor', name: 'Task Manager' }
        };
        dispatch({ type: 'OPEN_APP', payload: appMap[command.action] });
        break;
      case 'minimizeAll':
        state.openApps.forEach(app => {
          dispatch({ type: 'MINIMIZE_APP', payload: { appId: app.id } });
        });
        break;
      case 'closeAll':
        state.openApps.forEach(app => {
          dispatch({ type: 'CLOSE_APP', payload: app.id });
        });
        break;
      case 'showDesktop':
        state.openApps.forEach(app => {
          dispatch({ type: 'MINIMIZE_APP', payload: { appId: app.id } });
        });
        break;
    }
    
    onClose();
  };

  // Get shortcut for command
  const getShortcutForCommand = (action) => {
    const shortcuts = getShortcutsForAction(action);
    return shortcuts.length > 0 ? shortcuts[0] : null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className={`w-full max-w-2xl ${theme.app.bg} rounded-lg shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className={`w-full px-4 py-3 pl-12 ${theme.app.input} text-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="absolute left-4 top-3.5 text-2xl">
                  🔍
                </div>
              </div>
            </div>

            {/* Command list */}
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category} className="mb-4">
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${theme.text.secondary}`}>
                    {category}
                  </div>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;
                    const shortcut = getShortcutForCommand(command.action);
                    
                    return (
                      <motion.div
                        key={command.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                          isSelected ? theme.app.dropdown_item_hover : 'hover:bg-gray-100'
                        }`}
                        onClick={() => executeCommand(command)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="flex items-center flex-1">
                          <div className="text-2xl mr-3">{command.icon}</div>
                          <div className="flex-1">
                            <div className={`font-medium ${theme.text.primary}`}>
                              {command.name}
                            </div>
                            <div className={`text-sm ${theme.text.secondary}`}>
                              {command.description}
                            </div>
                          </div>
                        </div>
                        {shortcut && (
                          <div className={`text-xs px-2 py-1 rounded ${theme.app.badge}`}>
                            {shortcut}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              
              {filteredCommands.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No commands found for "{query}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-4 py-2 border-t border-gray-200 text-xs ${theme.text.secondary}`}>
              <div className="flex justify-between">
                <span>↑↓ Navigate • Enter Execute • Esc Close</span>
                <span>{filteredCommands.length} commands</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
