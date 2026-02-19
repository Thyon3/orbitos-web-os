import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export const useKeyboardShortcuts = () => {
  const { state, dispatch } = useApp();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState({});

  // Default shortcuts configuration
  const defaultShortcuts = {
    // System shortcuts
    'Ctrl+K': 'commandPalette',
    'Ctrl+Shift+P': 'commandPalette',
    'Escape': 'closeCurrentWindow',
    'Ctrl+Shift+N': 'newWindow',
    'Ctrl+W': 'closeWindow',
    'Ctrl+Tab': 'nextWindow',
    'Ctrl+Shift+Tab': 'previousWindow',
    'Ctrl+Alt+T': 'openTerminal',
    'Ctrl+Alt+F': 'openFileManager',
    'Ctrl+Alt+S': 'openSettings',
    'Ctrl+Alt+N': 'openNotes',
    'Ctrl+Alt+B': 'openBrowser',
    'Ctrl+Alt+C': 'openCalculator',
    
    // App-specific shortcuts
    'Ctrl+N': 'newFile',
    'Ctrl+O': 'openFile',
    'Ctrl+S': 'saveFile',
    'Ctrl+Shift+S': 'saveAsFile',
    'Ctrl+F': 'find',
    'Ctrl+H': 'replace',
    'Ctrl+G': 'goToLine',
    'Ctrl+Z': 'undo',
    'Ctrl+Y': 'redo',
    'Ctrl+X': 'cut',
    'Ctrl+C': 'copy',
    'Ctrl+V': 'paste',
    'Ctrl+A': 'selectAll',
    'Ctrl+Shift+A': 'deselectAll',
    
    // Navigation shortcuts
    'Alt+Left': 'goBack',
    'Alt+Right': 'goForward',
    'Alt+Up': 'goUp',
    'Alt+Home': 'goHome',
    'F5': 'refresh',
    'Ctrl+F5': 'hardRefresh',
    
    // Window management
    'Ctrl+M': 'minimizeWindow',
    'Ctrl+Shift+M': 'maximizeWindow',
    'Ctrl+Space': 'toggleFullscreen',
    'Ctrl+Alt+Left': 'snapLeft',
    'Ctrl+Alt+Right': 'snapRight',
    'Ctrl+Alt+Up': 'snapTop',
    'Ctrl+Alt+Down': 'snapBottom',
    
    // Theme shortcuts
    'Ctrl+Shift+T': 'toggleTheme',
    'Ctrl+Alt+D': 'darkTheme',
    'Ctrl+Alt+L': 'lightTheme',
    
    // Search shortcuts
    'Ctrl+Shift+F': 'globalSearch',
    'Ctrl+Shift+E': 'searchFiles',
    'Ctrl+Shift+G': 'searchGoogle',
    
    // System utilities
    'Ctrl+Alt+Delete': 'taskManager',
    'Ctrl+Alt+L': 'lockScreen',
    'Ctrl+Shift+L': 'logout',
    'PrintScreen': 'screenshot',
    'Ctrl+PrintScreen': 'screenshotRegion',
    
    // Accessibility
    'Ctrl+Plus': 'zoomIn',
    'Ctrl+Minus': 'zoomOut',
    'Ctrl+0': 'resetZoom',
    'Ctrl+Alt+Plus': 'increaseFontSize',
    'Ctrl+Alt+Minus': 'decreaseFontSize',
    
    // Development shortcuts
    'Ctrl+Shift+I': 'openDevTools',
    'Ctrl+Shift+J': 'openConsole',
    'Ctrl+Shift+C': 'inspectElement',
    'F12': 'toggleDevTools',
    
    // Media shortcuts
    'Space': 'playPause',
    'ArrowLeft': 'seekBackward',
    'ArrowRight': 'seekForward',
    'ArrowUp': 'volumeUp',
    'ArrowDown': 'volumeDown',
    'M': 'mute',
    
    // Tab management (for browser app)
    'Ctrl+T': 'newTab',
    'Ctrl+Shift+T': 'reopenClosedTab',
    'Ctrl+1': 'switchToTab1',
    'Ctrl+2': 'switchToTab2',
    'Ctrl+3': 'switchToTab3',
    'Ctrl+4': 'switchToTab4',
    'Ctrl+5': 'switchToTab5',
    'Ctrl+6': 'switchToTab6',
    'Ctrl+7': 'switchToTab7',
    'Ctrl+8': 'switchToTab8',
    'Ctrl+9': 'switchToTab9',
    'Ctrl+0': 'switchToTab10',
  };

  // Initialize shortcuts from localStorage or defaults
  useEffect(() => {
    const savedShortcuts = localStorage.getItem('orbitos-shortcuts');
    if (savedShortcuts) {
      setShortcuts(JSON.parse(savedShortcuts));
    } else {
      setShortcuts(defaultShortcuts);
    }
  }, []);

  // Save shortcuts to localStorage
  const saveShortcuts = useCallback((newShortcuts) => {
    setShortcuts(newShortcuts);
    localStorage.setItem('orbitos-shortcuts', JSON.stringify(newShortcuts));
  }, []);

  // Get key combination string
  const getKeyString = useCallback((e) => {
    const parts = [];
    
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    if (e.metaKey) parts.push('Meta');
    
    // Handle special keys
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
  }, []);

  // Execute shortcut action
  const executeAction = useCallback((action, e) => {
    // Prevent default behavior for most shortcuts
    if (!['Tab', 'Enter', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }

    switch (action) {
      // System actions
      case 'commandPalette':
        setIsCommandPaletteOpen(true);
        break;
      case 'closeCurrentWindow':
        if (state.activeApp) {
          dispatch({ type: 'CLOSE_APP', payload: state.activeApp });
        }
        break;
      case 'newWindow':
        // Open new desktop window
        window.open(window.location.href, '_blank');
        break;
      case 'closeWindow':
        if (state.activeApp) {
          dispatch({ type: 'CLOSE_APP', payload: state.activeApp });
        }
        break;
      case 'nextWindow':
        const openApps = state.openApps;
        if (openApps.length > 1) {
          const currentIndex = openApps.findIndex(app => app.id === state.activeApp);
          const nextIndex = (currentIndex + 1) % openApps.length;
          dispatch({ type: 'SET_ACTIVE_APP', payload: openApps[nextIndex].id });
        }
        break;
      case 'previousWindow':
        const apps = state.openApps;
        if (apps.length > 1) {
          const currentIndex = apps.findIndex(app => app.id === state.activeApp);
          const prevIndex = currentIndex === 0 ? apps.length - 1 : currentIndex - 1;
          dispatch({ type: 'SET_ACTIVE_APP', payload: apps[prevIndex].id });
        }
        break;

      // App launcher shortcuts
      case 'openTerminal':
        dispatch({ type: 'OPEN_APP', payload: { id: 'terminal', name: 'Terminal' } });
        break;
      case 'openFileManager':
        dispatch({ type: 'OPEN_APP', payload: { id: 'filemanager', name: 'File Manager' } });
        break;
      case 'openSettings':
        dispatch({ type: 'OPEN_APP', payload: { id: 'settings', name: 'Settings' } });
        break;
      case 'openNotes':
        dispatch({ type: 'OPEN_APP', payload: { id: 'notes', name: 'Notes' } });
        break;
      case 'openBrowser':
        dispatch({ type: 'OPEN_APP', payload: { id: 'browser', name: 'Browser' } });
        break;
      case 'openCalculator':
        dispatch({ type: 'OPEN_APP', payload: { id: 'calculator', name: 'Calculator' } });
        break;

      // Theme shortcuts
      case 'toggleTheme':
        setTheme(theme.id === 'dark' ? 'light' : 'dark');
        break;
      case 'darkTheme':
        setTheme('dark');
        break;
      case 'lightTheme':
        setTheme('light');
        break;

      // File operations
      case 'newFile':
        // Trigger new file action in current app
        window.dispatchEvent(new CustomEvent('new-file'));
        break;
      case 'openFile':
        // Trigger open file action
        window.dispatchEvent(new CustomEvent('open-file'));
        break;
      case 'saveFile':
        // Trigger save action
        window.dispatchEvent(new CustomEvent('save-file'));
        break;
      case 'saveAsFile':
        // Trigger save as action
        window.dispatchEvent(new CustomEvent('save-as-file'));
        break;
      case 'find':
        // Trigger find action
        window.dispatchEvent(new CustomEvent('find'));
        break;
      case 'replace':
        // Trigger replace action
        window.dispatchEvent(new CustomEvent('replace'));
        break;

      // Search shortcuts
      case 'globalSearch':
        // Open global search
        window.dispatchEvent(new CustomEvent('open-global-search'));
        break;
      case 'searchFiles':
        // Open file search
        window.dispatchEvent(new CustomEvent('search-files'));
        break;
      case 'searchGoogle':
        // Search Google
        const query = prompt('Search Google:');
        if (query) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
        break;

      // Window management
      case 'minimizeWindow':
        if (state.activeApp) {
          dispatch({ type: 'MINIMIZE_APP', payload: { appId: state.activeApp } });
        }
        break;
      case 'maximizeWindow':
        // Toggle maximize functionality
        window.dispatchEvent(new CustomEvent('maximize-window'));
        break;
      case 'toggleFullscreen':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
        break;

      // System utilities
      case 'taskManager':
        dispatch({ type: 'OPEN_APP', payload: { id: 'monitor', name: 'Task Manager' } });
        break;
      case 'lockScreen':
        // Lock screen functionality
        window.dispatchEvent(new CustomEvent('lock-screen'));
        break;
      case 'logout':
        logout();
        break;
      case 'screenshot':
        // Take screenshot
        window.dispatchEvent(new CustomEvent('take-screenshot'));
        break;
      case 'screenshotRegion':
        // Take screenshot of region
        window.dispatchEvent(new CustomEvent('take-screenshot-region'));
        break;

      // Accessibility
      case 'zoomIn':
        document.body.style.zoom = `${(parseFloat(document.body.style.zoom || 1) + 0.1)}`;
        break;
      case 'zoomOut':
        document.body.style.zoom = `${Math.max(0.5, parseFloat(document.body.style.zoom || 1) - 0.1)}`;
        break;
      case 'resetZoom':
        document.body.style.zoom = '1';
        break;

      // Development
      case 'openDevTools':
        // Open browser dev tools
        window.dispatchEvent(new CustomEvent('open-dev-tools'));
        break;
      case 'openConsole':
        // Open console
        window.dispatchEvent(new CustomEvent('open-console'));
        break;
      case 'inspectElement':
        // Inspect element mode
        window.dispatchEvent(new CustomEvent('inspect-element'));
        break;
      case 'toggleDevTools':
        // Toggle dev tools
        window.dispatchEvent(new CustomEvent('toggle-dev-tools'));
        break;

      default:
        console.log(`Unknown action: ${action}`);
    }
  }, [state, dispatch, theme, setTheme, logout]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      const activeElement = document.activeElement;
      const isInputElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );

      // Allow certain shortcuts in input fields
      const allowedInInput = [
        'Ctrl+A', 'Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z', 'Ctrl+Y',
        'Ctrl+F', 'Ctrl+H', 'Ctrl+G', 'Escape', 'Tab', 'Enter'
      ];

      const keyString = getKeyString(e);
      const action = shortcuts[keyString];

      if (action) {
        if (isInputElement && !allowedInInput.includes(keyString)) {
          return; // Don't trigger shortcuts when typing
        }
        executeAction(action, e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, getKeyString, executeAction]);

  // Custom shortcut registration
  const registerShortcut = useCallback((keyCombo, action) => {
    const newShortcuts = { ...shortcuts, [keyCombo]: action };
    saveShortcuts(newShortcuts);
  }, [shortcuts, saveShortcuts]);

  // Unregister shortcut
  const unregisterShortcut = useCallback((keyCombo) => {
    const newShortcuts = { ...shortcuts };
    delete newShortcuts[keyCombo];
    saveShortcuts(newShortcuts);
  }, [shortcuts, saveShortcuts]);

  // Get all shortcuts
  const getAllShortcuts = useCallback(() => {
    return shortcuts;
  }, [shortcuts]);

  // Get shortcuts for action
  const getShortcutsForAction = useCallback((action) => {
    return Object.entries(shortcuts)
      .filter(([key, value]) => value === action)
      .map(([key]) => key);
  }, [shortcuts]);

  return {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    getAllShortcuts,
    getShortcutsForAction,
    saveShortcuts
  };
};

export default useKeyboardShortcuts;
