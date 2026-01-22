import { useEffect, useCallback } from 'react';
import { useShortcuts } from '@/context/ShortcutContext';
import { useApp } from '@/context/AppContext';
import { useSearch } from '@/context/SearchContext';

/**
 * Global keyboard shortcut handler
 * Listens for keyboard events and executes corresponding actions
 */
export function useGlobalShortcuts(options = {}) {
  const { enabled = true } = options;
  const { getShortcutByKeys, recordUsage } = useShortcuts();
  const { openApp, closeApp, minimizeApp, maximizeApp } = useApp();
  const { openSearch } = useSearch();

  const executeAction = useCallback(async (shortcut) => {
    try {
      const { action, appId, _id } = shortcut;

      // Record usage
      if (_id) {
        await recordUsage(_id);
      }

      // Execute action based on type
      if (action.startsWith('openApp:')) {
        const targetAppId = action.split(':')[1] || appId;
        if (targetAppId) {
          openApp(targetAppId);
        }
      } else {
        switch (action) {
          case 'openGlobalSearch':
            openSearch();
            break;

          case 'showHelp':
            // This will be implemented with help overlay
            console.log('Show help overlay');
            break;

          case 'openSettings':
            openApp('settings');
            break;

          case 'showDesktop':
            // Minimize all windows
            // This would need to be implemented in AppContext
            console.log('Show desktop - minimize all windows');
            break;

          case 'focusTaskbar':
            // Focus taskbar for keyboard navigation
            const taskbar = document.querySelector('[data-taskbar]');
            if (taskbar) {
              taskbar.focus();
            }
            break;

          case 'closeWindow':
            // Close active window
            // This would need current window context
            console.log('Close active window');
            break;

          case 'maximizeWindow':
            // Maximize active window
            console.log('Maximize active window');
            break;

          case 'minimizeWindow':
            // Minimize active window
            console.log('Minimize active window');
            break;

          case 'nextWindow':
            // Switch to next window (Alt+Tab functionality)
            console.log('Switch to next window');
            break;

          // Editing actions (these work with browser default behavior)
          case 'copy':
          case 'paste':
          case 'cut':
          case 'undo':
          case 'redo':
          case 'selectAll':
          case 'find':
          case 'save':
            // Let browser handle these naturally
            return false; // Don't prevent default
            
          default:
            console.warn(`Unknown action: ${action}`);
            break;
        }
      }

      return true; // Prevent default browser behavior
    } catch (error) {
      console.error('Error executing shortcut action:', error);
      return false;
    }
  }, [openApp, closeApp, minimizeApp, maximizeApp, openSearch, recordUsage]);

  const handleKeyDown = useCallback(async (event) => {
    if (!enabled) return;

    // Don't interfere with input elements unless it's a global shortcut
    const activeElement = document.activeElement;
    const isInputElement = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );

    // Build key combination string
    const keys = [];
    
    // Add modifier keys
    if (event.ctrlKey || event.metaKey) {
      keys.push(event.metaKey ? 'Cmd' : 'Ctrl');
    }
    if (event.altKey) {
      keys.push('Alt');
    }
    if (event.shiftKey) {
      keys.push('Shift');
    }

    // Add the main key
    const key = event.key;
    if (key && key !== 'Control' && key !== 'Alt' && key !== 'Shift' && key !== 'Meta') {
      if (key.length === 1) {
        keys.push(key.toUpperCase());
      } else if (['Enter', 'Space', 'Tab', 'Escape', 'Backspace', 'Delete'].includes(key)) {
        keys.push(key);
      } else if (key.startsWith('F') && key.length <= 3) {
        keys.push(key);
      } else if (key.startsWith('Arrow')) {
        keys.push(key.replace('Arrow', ''));
      }
    }

    if (keys.length === 0) return;

    const keyCombination = keys.join('+');
    const shortcut = getShortcutByKeys(keyCombination);

    if (shortcut && shortcut.isEnabled) {
      // Check if this is a global shortcut or if we should respect input focus
      const isGlobalShortcut = shortcut.metadata?.scope === 'global';
      const isSystemShortcut = shortcut.category === 'system';
      
      if (isGlobalShortcut || isSystemShortcut || !isInputElement) {
        const shouldPreventDefault = await executeAction(shortcut);
        
        if (shouldPreventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
  }, [enabled, getShortcutByKeys, executeAction]);

  const handleKeyUp = useCallback((event) => {
    // Handle key up events if needed
    // For now, we only handle key down events
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Add global event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  // Return utilities if needed
  return {
    executeAction,
  };
}