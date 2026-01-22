import React, { useState, useEffect } from 'react';
import { Clipboard, Trash2, Pin, RefreshCw, Filter, Search, X } from 'lucide-react';
import { useClipboard } from '@/context/ClipboardContext';
import ClipboardItemPreview from './ClipboardItemPreview';

export default function ClipboardManager() {
  const {
    clipboardItems,
    loading,
    stats,
    loadClipboardItems,
    deleteClipboardItem,
    togglePin,
    clearClipboard,
    loadStats,
  } = useClipboard();

  const [filterType, setFilterType] = useState('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    // Reload items when filters change
    const filters = {};
    if (filterType !== 'all') {
      filters.type = filterType;
    }
    if (showPinnedOnly) {
      filters.pinned = true;
    }
    loadClipboardItems(filters);
  }, [filterType, showPinnedOnly, loadClipboardItems]);

  // Filter items based on search query
  const filteredItems = clipboardItems.filter((item) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const contentMatch = item.content?.toLowerCase().includes(query);
    const previewMatch = item.preview?.toLowerCase().includes(query);
    const typeMatch = item.type?.toLowerCase().includes(query);
    const languageMatch = item.language?.toLowerCase().includes(query);
    const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(query));
    
    return contentMatch || previewMatch || typeMatch || languageMatch || tagsMatch;
  });

  const handleClearClipboard = async () => {
    if (confirm('Clear clipboard history? Pinned items will be kept.')) {
      await clearClipboard(true);
      loadStats();
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Delete ALL clipboard items including pinned ones?')) {
      await clearClipboard(false);
      loadStats();
    }
  };

  const handleDelete = async (itemId) => {
    await deleteClipboardItem(itemId);
    loadStats();
  };

  const handleTogglePin = async (itemId) => {
    await togglePin(itemId);
    loadStats();
  };

  const getTypeIcon = (type) => {
    const icons = {
      text: '📝',
      code: '💻',
      image: '🖼️',
      link: '🔗',
      file: '📎',
    };
    return icons[type] || '📋';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading && clipboardItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Clipboard className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading clipboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clipboard className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Clipboard Manager
              </h1>
              {stats && (
                <p className="text-sm text-gray-500">
                  {stats.totalItems} items • {stats.pinnedItems} pinned
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadClipboardItems();
                loadStats();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleClearClipboard}
              disabled={clipboardItems.length === 0}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clipboard items..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="code">Code</option>
              <option value="image">Image</option>
              <option value="link">Link</option>
              <option value="file">File</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPinnedOnly}
              onChange={(e) => setShowPinnedOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Pinned only</span>
          </label>
          {searchQuery && (
            <span className="text-sm text-gray-500">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredItems.length === 0 && !searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Clipboard className="w-24 h-24 mb-4" />
            <p className="text-lg">No clipboard items</p>
            <p className="text-sm">
              Items you copy will appear here automatically
            </p>
          </div>
        ) : filteredItems.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Search className="w-24 h-24 mb-4" />
            <p className="text-lg">No results found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                  item.isPinned ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setPreviewItem(item)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {item.type}
                        </span>
                        {item.language && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                            {item.language}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(item.copiedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 font-mono break-all">
                        {item.preview || item.content}
                      </p>
                      {item.accessCount > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Used {item.accessCount} times
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(item._id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isPinned
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={item.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <ClipboardItemPreview
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* Stats Footer */}
      {stats && clipboardItems.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            {Object.entries(stats.itemsByType).map(([type, count]) => (
              <div key={type}>
                <div className="text-2xl mb-1">{getTypeIcon(type)}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {count}
                </div>
                <div className="text-xs text-gray-500 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
