import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';

export default function RecycleBinApp() {
  const [trashItems, setTrashItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    loadTrashItems();
    loadStats();
  }, []);

  const loadTrashItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trash');
      const data = await response.json();
      if (response.ok) {
        setTrashItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading trash items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/trash/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRestore = async (itemId) => {
    try {
      const response = await fetch(`/api/trash/${itemId}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Item restored successfully!');
        loadTrashItems();
        loadStats();
      } else {
        alert('Failed to restore item');
      }
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Error restoring item');
    }
  };

  const handlePermanentDelete = async (itemId) => {
    if (!confirm('Are you sure? This action cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(`/api/trash/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Item permanently deleted');
        loadTrashItems();
        loadStats();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const handleEmptyTrash = async () => {
    if (
      !confirm(
        'Are you sure you want to empty the entire trash? This action cannot be undone!',
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/trash', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Trash emptied successfully');
        loadTrashItems();
        loadStats();
      } else {
        alert('Failed to empty trash');
      }
    } catch (error) {
      console.error('Error emptying trash:', error);
      alert('Error emptying trash');
    }
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDaysRemaining = (expiresAt) => {
    const days = Math.ceil(
      (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading trash...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Recycle Bin</h1>
              {stats && (
                <p className="text-sm text-gray-500">
                  {stats.totalItems} items • {formatSize(stats.totalSize)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleEmptyTrash}
            disabled={trashItems.length === 0}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Empty Trash
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {trashItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Trash2 className="w-24 h-24 mb-4" />
            <p className="text-lg">Recycle Bin is empty</p>
            <p className="text-sm">Deleted items will appear here</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {trashItems.map((item) => (
              <div
                key={item._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {item.fileType}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>Deleted: {formatDate(item.deletedAt)}</p>
                      <p>Original path: {item.originalPath}</p>
                      <p>Size: {formatSize(item.size)}</p>
                      <p className="text-orange-600 font-medium">
                        Expires in {getDaysRemaining(item.expiresAt)} days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(item._id)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title="Restore"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete Permanently"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
