import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ClipboardContext = createContext();

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within ClipboardProvider');
  }
  return context;
};

export const ClipboardProvider = ({ children }) => {
  const [clipboardItems, setClipboardItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Load clipboard items from API
  const loadClipboardItems = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.pinned !== undefined) queryParams.append('pinned', filters.pinned);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const response = await fetch(`/api/clipboard?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClipboardItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading clipboard items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save new item to clipboard
  const saveToClipboard = useCallback(async (item) => {
    try {
      const response = await fetch('/api/clipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        const data = await response.json();
        setClipboardItems((prev) => [data.item, ...prev]);
        return data.item;
      }
    } catch (error) {
      console.error('Error saving to clipboard:', error);
      throw error;
    }
  }, []);

  // Delete clipboard item
  const deleteClipboardItem = useCallback(async (itemId) => {
    try {
      const response = await fetch(`/api/clipboard/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClipboardItems((prev) => prev.filter((item) => item._id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting clipboard item:', error);
      throw error;
    }
  }, []);

  // Toggle pin status
  const togglePin = useCallback(async (itemId) => {
    try {
      const item = clipboardItems.find((i) => i._id === itemId);
      if (!item) return;

      const response = await fetch(`/api/clipboard/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !item.isPinned }),
      });

      if (response.ok) {
        const data = await response.json();
        setClipboardItems((prev) =>
          prev.map((i) => (i._id === itemId ? data.item : i)),
        );
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  }, [clipboardItems]);

  // Clear clipboard (with option to keep pinned items)
  const clearClipboard = useCallback(async (keepPinned = true) => {
    try {
      const response = await fetch(`/api/clipboard/clear?keepPinned=${keepPinned}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (keepPinned) {
          setClipboardItems((prev) => prev.filter((item) => item.isPinned));
        } else {
          setClipboardItems([]);
        }
      }
    } catch (error) {
      console.error('Error clearing clipboard:', error);
      throw error;
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/clipboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading clipboard stats:', error);
    }
  }, []);

  // Copy to system clipboard
  const copyToSystemClipboard = useCallback(async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          textArea.remove();
          return true;
        } catch (err) {
          console.error('Fallback copy failed:', err);
          textArea.remove();
          return false;
        }
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadClipboardItems();
    loadStats();
  }, [loadClipboardItems, loadStats]);

  return (
    <ClipboardContext.Provider
      value={{
        clipboardItems,
        loading,
        stats,
        loadClipboardItems,
        saveToClipboard,
        deleteClipboardItem,
        togglePin,
        clearClipboard,
        loadStats,
        copyToSystemClipboard,
      }}
    >
      {children}
    </ClipboardContext.Provider>
  );
};
