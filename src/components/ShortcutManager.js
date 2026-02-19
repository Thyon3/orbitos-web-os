import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const ShortcutManager = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { shortcuts, registerShortcut, unregisterShortcut, saveShortcuts } = useKeyboardShortcuts();
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [newKeyCombo, setNewKeyCombo] = useState('');
  const [conflict, setConflict] = useState(null);

  // Categories of shortcuts
  const shortcutCategories = {
    'System': [
      'commandPalette', 'closeCurrentWindow', 'newWindow', 'closeWindow',
      'nextWindow', 'previousWindow', 'taskManager', 'lockScreen', 'logout'
    ],
    'Apps': [
      'openTerminal', 'openFileManager', 'openSettings', 'openNotes',
      'openBrowser', 'openCalculator'
    ],
    'Files': [
      'newFile', 'openFile', 'saveFile', 'saveAsFile', 'find', 'replace'
    ],
    'Navigation': [
      'goBack', 'goForward', 'goUp', 'goHome', 'refresh', 'hardRefresh'
    ],
    'Windows': [
      'minimizeWindow', 'maximizeWindow', 'toggleFullscreen',
      'snapLeft', 'snapRight', 'snapTop', 'snapBottom'
    ],
    'Themes': [
      'toggleTheme', 'darkTheme', 'lightTheme'
    ],
    'Search': [
      'globalSearch', 'searchFiles', 'searchGoogle'
    ],
    'Accessibility': [
      'zoomIn', 'zoomOut', 'resetZoom', 'increaseFontSize', 'decreaseFontSize'
    ],
    'Development': [
      'openDevTools', 'openConsole', 'inspectElement', 'toggleDevTools'
    ],
    'Media': [
      'playPause', 'seekBackward', 'seekForward', 'volumeUp', 'volumeDown', 'mute'
    ]
  };

  // Action descriptions
  const actionDescriptions = {
    commandPalette: 'Open command palette',
    closeCurrentWindow: 'Close current window',
    newWindow: 'Open new window',
    closeWindow: 'Close window',
    nextWindow: 'Switch to next window',
    previousWindow: 'Switch to previous window',
    openTerminal: 'Open terminal',
    openFileManager: 'Open file manager',
    openSettings: 'Open settings',
    openNotes: 'Open notes app',
    openBrowser: 'Open browser',
    openCalculator: 'Open calculator',
    taskManager: 'Open task manager',
    lockScreen: 'Lock screen',
    logout: 'Logout',
    newFile: 'Create new file',
    openFile: 'Open file',
    saveFile: 'Save file',
    saveAsFile: 'Save file as',
    find: 'Find text',
    replace: 'Find and replace',
    goBack: 'Go back',
    goForward: 'Go forward',
    goUp: 'Go up one level',
    goHome: 'Go to home',
    refresh: 'Refresh',
    hardRefresh: 'Hard refresh',
    minimizeWindow: 'Minimize window',
    maximizeWindow: 'Maximize window',
    toggleFullscreen: 'Toggle fullscreen',
    snapLeft: 'Snap window to left',
    snapRight: 'Snap window to right',
    snapTop: 'Snap window to top',
    snapBottom: 'Snap window to bottom',
    toggleTheme: 'Toggle theme',
    darkTheme: 'Switch to dark theme',
    lightTheme: 'Switch to light theme',
    globalSearch: 'Global search',
    searchFiles: 'Search files',
    searchGoogle: 'Search Google',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    increaseFontSize: 'Increase font size',
    decreaseFontSize: 'Decrease font size',
    openDevTools: 'Open developer tools',
    openConsole: 'Open console',
    inspectElement: 'Inspect element',
    toggleDevTools: 'Toggle developer tools',
    playPause: 'Play/Pause media',
    seekBackward: 'Seek backward',
    seekForward: 'Seek forward',
    volumeUp: 'Volume up',
    volumeDown: 'Volume down',
    mute: 'Mute/Unmute'
  };

  // Get key combination from event
  const getKeyCombo = (e) => {
    const parts = [];
    
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    if (e.metaKey) parts.push('Meta');
    
    const keyMap = {
      ' ': 'Space',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
      'Escape': 'Escape',
      'Enter': 'Enter',
      'Tab': 'Tab',
      'Backspace': 'Backspace',
      'Delete': 'Delete',
      'Insert': 'Insert',
      'Home': 'Home',
      'End': 'End',
      'PageUp': 'PageUp',
      'PageDown': 'PageDown',
      'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5',
      'F6': 'F6', 'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10',
      'F11': 'F11', 'F12': 'F12'
    };
    
    const key = keyMap[e.key] || e.key.toUpperCase();
    parts.push(key);
    
    return parts.join('+');
  };

  // Start editing shortcut
  const startEditing = (action) => {
    setEditingShortcut(action);
    setNewKeyCombo('');
    setConflict(null);
  };

  // Handle key press for new shortcut
  const handleKeyPress = (e) => {
    e.preventDefault();
    const keyCombo = getKeyCombo(e);
    setNewKeyCombo(keyCombo);
    
    // Check for conflicts
    const existingAction = shortcuts[keyCombo];
    if (existingAction && existingAction !== editingShortcut) {
      setConflict(existingAction);
    } else {
      setConflict(null);
    }
  };

  // Save new shortcut
  const saveShortcut = () => {
    if (newKeyCombo && !conflict) {
      // Remove old shortcut for this action
      const oldKeyCombo = Object.entries(shortcuts).find(([key, value]) => value === editingShortcut);
      if (oldKeyCombo) {
        const newShortcuts = { ...shortcuts };
        delete newShortcuts[oldKeyCombo[0]];
        saveShortcuts(newShortcuts);
      }
      
      // Add new shortcut
      registerShortcut(newKeyCombo, editingShortcut);
    }
    
    setEditingShortcut(null);
    setNewKeyCombo('');
    setConflict(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingShortcut(null);
    setNewKeyCombo('');
    setConflict(null);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all shortcuts to defaults?')) {
      const defaultShortcuts = {
        'Ctrl+K': 'commandPalette',
        'Ctrl+Shift+P': 'commandPalette',
        'Escape': 'closeCurrentWindow',
        'Ctrl+W': 'closeWindow',
        'Ctrl+Tab': 'nextWindow',
        'Ctrl+Shift+Tab': 'previousWindow',
        'Ctrl+Alt+T': 'openTerminal',
        'Ctrl+Alt+F': 'openFileManager',
        'Ctrl+Alt+S': 'openSettings',
        'Ctrl+Alt+N': 'openNotes',
        'Ctrl+Alt+B': 'openBrowser',
        'Ctrl+Alt+C': 'openCalculator',
        'Ctrl+N': 'newFile',
        'Ctrl+O': 'openFile',
        'Ctrl+S': 'saveFile',
        'Ctrl+Shift+S': 'saveAsFile',
        'Ctrl+F': 'find',
        'Ctrl+H': 'replace',
        'Ctrl+M': 'minimizeWindow',
        'Ctrl+Alt+L': 'lockScreen',
        'Ctrl+Shift+L': 'logout',
        'Ctrl+Plus': 'zoomIn',
        'Ctrl+Minus': 'zoomOut',
        'Ctrl+0': 'resetZoom',
        'Ctrl+Shift+T': 'toggleTheme',
        'Ctrl+Shift+F': 'globalSearch',
        'F12': 'toggleDevTools'
      };
      
      saveShortcuts(defaultShortcuts);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`w-full max-w-4xl h-3/4 ${theme.app.bg} rounded-lg shadow-2xl overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${theme.app.toolbar}`}>
              <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              <div className="flex space-x-2">
                <button
                  onClick={resetToDefaults}
                  className={`px-4 py-2 rounded ${theme.app.button}`}
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded ${theme.app.button}`}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {Object.entries(shortcutCategories).map(([category, actions]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">{category}</h3>
                  <div className="space-y-2">
                    {actions.map(action => {
                      const currentShortcut = Object.entries(shortcuts).find(([key, value]) => value === action);
                      const isEditing = editingShortcut === action;
                      
                      return (
                        <div
                          key={action}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isEditing ? theme.app.dropdown_item_hover : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex-1">
                            <div className={`font-medium ${theme.text.primary}`}>
                              {actionDescriptions[action] || action}
                            </div>
                            <div className={`text-sm ${theme.text.secondary}`}>
                              {action}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={newKeyCombo}
                                  onKeyDown={handleKeyPress}
                                  placeholder="Press keys..."
                                  className={`px-3 py-1 rounded ${theme.app.input} w-32`}
                                  autoFocus
                                />
                                {conflict && (
                                  <span className="text-red-500 text-sm">
                                    Conflicts with {actionDescriptions[conflict]}
                                  </span>
                                )}
                                <button
                                  onClick={saveShortcut}
                                  disabled={!newKeyCombo || conflict}
                                  className={`px-3 py-1 rounded ${theme.app.button} disabled:opacity-50`}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className={`px-3 py-1 rounded ${theme.app.button}`}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded ${theme.app.badge} font-mono text-sm`}>
                                  {currentShortcut ? currentShortcut[0] : 'Not set'}
                                </span>
                                <button
                                  onClick={() => startEditing(action)}
                                  className={`px-3 py-1 rounded ${theme.app.button}`}
                                >
                                  Edit
                                </button>
                                {currentShortcut && (
                                  <button
                                    onClick={() => {
                                      const newShortcuts = { ...shortcuts };
                                      delete newShortcuts[currentShortcut[0]];
                                      saveShortcuts(newShortcuts);
                                    }}
                                    className={`px-3 py-1 rounded bg-red-500 text-white`}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${theme.app.toolbar} text-sm ${theme.text.secondary}`}>
              <p>Click on any shortcut to edit it. Press the desired key combination to set a new shortcut.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShortcutManager;
