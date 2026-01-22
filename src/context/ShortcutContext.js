import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ShortcutContext = createContext();

export const useShortcuts = () => {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error('useShortcuts must be used within ShortcutProvider');
  }
  return context;
};

export const ShortcutProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = useState([]);
  const [groupedShortcuts, setGroupedShortcuts] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeShortcuts, setActiveShortcuts] = useState(new Map());

  // Load shortcuts from API
  const loadShortcuts = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.enabled !== undefined) queryParams.append('enabled', filters.enabled);
      if (filters.scope) queryParams.append('scope', filters.scope);

      const response = await fetch(`/api/shortcuts?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setShortcuts(data.shortcuts || []);
        setGroupedShortcuts(data.groupedShortcuts || {});
        
        // Build active shortcuts map for quick lookup
        const activeMap = new Map();
        data.shortcuts
          ?.filter(shortcut => shortcut.isEnabled)
          .forEach(shortcut => {
            activeMap.set(shortcut.keyCombination, shortcut);
          });
        setActiveShortcuts(activeMap);
      }
    } catch (error) {
      console.error('Error loading shortcuts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new shortcut
  const createShortcut = useCallback(async (shortcutData) => {
    try {
      const response = await fetch('/api/shortcuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shortcutData),
      });

      const data = await response.json();

      if (response.ok) {
        setShortcuts(prev => [...prev, data.shortcut]);
        await loadShortcuts(); // Reload to get updated groupings
        return data.shortcut;
      } else {
        throw new Error(data.error || 'Failed to create shortcut');
      }
    } catch (error) {
      console.error('Error creating shortcut:', error);
      throw error;
    }
  }, [loadShortcuts]);

  // Update shortcut
  const updateShortcut = useCallback(async (shortcutId, updates) => {
    try {
      const response = await fetch(`/api/shortcuts/${shortcutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setShortcuts(prev => 
          prev.map(shortcut => 
            shortcut._id === shortcutId ? data.shortcut : shortcut
          )
        );
        await loadShortcuts(); // Reload to get updated active shortcuts
        return data.shortcut;
      } else {
        throw new Error(data.error || 'Failed to update shortcut');
      }
    } catch (error) {
      console.error('Error updating shortcut:', error);
      throw error;
    }
  }, [loadShortcuts]);

  // Delete shortcut
  const deleteShortcut = useCallback(async (shortcutId) => {
    try {
      const response = await fetch(`/api/shortcuts/${shortcutId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShortcuts(prev => prev.filter(shortcut => shortcut._id !== shortcutId));
        await loadShortcuts(); // Reload to update groupings
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete shortcut');
      }
    } catch (error) {
      console.error('Error deleting shortcut:', error);
      throw error;
    }
  }, [loadShortcuts]);

  // Reset shortcuts
  const resetShortcuts = useCallback(async (category = null, resetType = 'defaults') => {
    try {
      const response = await fetch('/api/shortcuts/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, resetType }),
      });

      if (response.ok) {
        await loadShortcuts(); // Reload all shortcuts
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset shortcuts');
      }
    } catch (error) {
      console.error('Error resetting shortcuts:', error);
      throw error;
    }
  }, [loadShortcuts]);

  // Check for shortcut conflicts
  const checkConflict = useCallback((keyCombination, excludeId = null) => {
    return shortcuts.find(shortcut => 
      shortcut.keyCombination === keyCombination && 
      shortcut.isEnabled && 
      shortcut._id !== excludeId
    );
  }, [shortcuts]);

  // Get shortcut by key combination
  const getShortcutByKeys = useCallback((keyCombination) => {
    return activeShortcuts.get(keyCombination);
  }, [activeShortcuts]);

  // Record shortcut usage
  const recordUsage = useCallback(async (shortcutId) => {
    try {
      // Update local state immediately for better UX
      setShortcuts(prev =>
        prev.map(shortcut =>
          shortcut._id === shortcutId
            ? { 
                ...shortcut, 
                usageCount: (shortcut.usageCount || 0) + 1,
                lastUsed: new Date().toISOString()
              }
            : shortcut
        )
      );

      // Update on server
      await updateShortcut(shortcutId, {
        usageCount: shortcuts.find(s => s._id === shortcutId)?.usageCount + 1 || 1,
        lastUsed: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error recording shortcut usage:', error);
    }
  }, [shortcuts, updateShortcut]);

  // Format keys for display
  const formatKeys = useCallback((keys) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return keys.map(key => {
      switch (key.toLowerCase()) {
        case 'ctrl':
        case 'control':
          return isMac ? '⌘' : 'Ctrl';
        case 'alt':
          return isMac ? '⌥' : 'Alt';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        case 'meta':
        case 'cmd':
          return isMac ? '⌘' : 'Win';
        default:
          return key;
      }
    }).join(isMac ? '' : '+');
  }, []);

  // Initialize shortcuts on mount
  useEffect(() => {
    loadShortcuts();
  }, [loadShortcuts]);

  return (
    <ShortcutContext.Provider
      value={{
        shortcuts,
        groupedShortcuts,
        activeShortcuts,
        loading,
        loadShortcuts,
        createShortcut,
        updateShortcut,
        deleteShortcut,
        resetShortcuts,
        checkConflict,
        getShortcutByKeys,
        recordUsage,
        formatKeys,
      }}
    >
      {children}
    </ShortcutContext.Provider>
  );
};