import React, { useState, useEffect } from 'react';
import { 
  Keyboard, 
  Search, 
  Filter, 
  RefreshCw, 
  RotateCcw, 
  Plus, 
  Edit3, 
  Trash2,
  Power,
  PowerOff,
  X
} from 'lucide-react';
import { useShortcuts } from '@/context/ShortcutContext';

export default function KeyboardShortcutPanel({ onEditShortcut }) {
  const {
    shortcuts,
    groupedShortcuts,
    loading,
    loadShortcuts,
    updateShortcut,
    deleteShortcut,
    resetShortcuts,
  } = useShortcuts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);

  useEffect(() => {
    loadShortcuts();
  }, [loadShortcuts]);

  // Filter shortcuts based on search and filters
  const filteredShortcuts = shortcuts.filter((shortcut) => {
    if (!shortcut) return false;

    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      shortcut.name?.toLowerCase().includes(query) ||
      shortcut.description?.toLowerCase().includes(query) ||
      shortcut.keyCombination?.toLowerCase().includes(query) ||
      shortcut.action?.toLowerCase().includes(query);

    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    const matchesEnabled = !showEnabledOnly || shortcut.isEnabled;

    return matchesSearch && matchesCategory && matchesEnabled;
  });

  const handleToggleEnabled = async (shortcut) => {
    try {
      await updateShortcut(shortcut._id, { isEnabled: !shortcut.isEnabled });
    } catch (error) {
      console.error('Failed to toggle shortcut:', error);
    }
  };

  const handleReset = async (category = null) => {
    if (confirm(`Reset ${category || 'all'} shortcuts to defaults?`)) {
      try {
        await resetShortcuts(category, 'defaults');
      } catch (error) {
        console.error('Failed to reset shortcuts:', error);
      }
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      system: '⚙️',
      navigation: '🧭',
      window: '🪟',
      apps: '📱',
      editing: '✏️',
      custom: '⭐',
    };
    return icons[category] || '⌨️';
  };

  const getCategoryColor = (category) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      navigation: 'bg-green-100 text-green-800',
      window: 'bg-purple-100 text-purple-800',
      apps: 'bg-orange-100 text-orange-800',
      editing: 'bg-pink-100 text-pink-800',
      custom: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const categories = Object.keys(groupedShortcuts);

  if (loading && shortcuts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Keyboard className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading shortcuts...</p>
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
            <Keyboard className="w-6 h-6 text-purple-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Keyboard Shortcuts
              </h1>
              <p className="text-sm text-gray-500">
                {filteredShortcuts.length} shortcuts • {categories.length} categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadShortcuts()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => handleReset()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts by name, description, or keys..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEnabledOnly}
                onChange={(e) => setShowEnabledOnly(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enabled only</span>
            </label>
            {searchQuery && (
              <span className="text-sm text-gray-500">
                {filteredShortcuts.length} result{filteredShortcuts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredShortcuts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            {searchQuery ? (
              <>
                <Search className="w-24 h-24 mb-4" />
                <p className="text-lg">No shortcuts found</p>
                <p className="text-sm">Try a different search term</p>
              </>
            ) : (
              <>
                <Keyboard className="w-24 h-24 mb-4" />
                <p className="text-lg">No shortcuts available</p>
                <p className="text-sm">Shortcuts will appear here when loaded</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group by category */}
            {categories.filter(category => 
              selectedCategory === 'all' || category === selectedCategory
            ).map((category) => {
              const categoryShortcuts = filteredShortcuts.filter(s => s.category === category);
              if (categoryShortcuts.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {category} Shortcuts
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(category)}`}>
                        {categoryShortcuts.length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleReset(category)}
                      className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>

                  {/* Shortcuts Grid */}
                  <div className="grid gap-3">
                    {categoryShortcuts.map((shortcut) => (
                      <div
                        key={shortcut._id}
                        className={`border rounded-lg p-4 transition-all ${
                          shortcut.isEnabled 
                            ? 'border-gray-200 bg-white' 
                            : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {shortcut.name}
                              </h4>
                              <div className="flex items-center gap-1">
                                {shortcut.keys?.map((key, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border"
                                  >
                                    {key}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {shortcut.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Action: {shortcut.action}</span>
                              {shortcut.appId && (
                                <span>• App: {shortcut.appId}</span>
                              )}
                              {shortcut.usageCount > 0 && (
                                <span>• Used {shortcut.usageCount} times</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleToggleEnabled(shortcut)}
                              className={`p-2 rounded-lg transition-colors ${
                                shortcut.isEnabled
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title={shortcut.isEnabled ? 'Disable' : 'Enable'}
                            >
                              {shortcut.isEnabled ? (
                                <Power className="w-4 h-4" />
                              ) : (
                                <PowerOff className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => onEditShortcut?.(shortcut)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {shortcut.isCustom && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this custom shortcut?')) {
                                    deleteShortcut(shortcut._id);
                                  }
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Total: {shortcuts.length} shortcuts</span>
            <span>Enabled: {shortcuts.filter(s => s.isEnabled).length}</span>
            <span>Custom: {shortcuts.filter(s => s.isCustom).length}</span>
          </div>
          <button
            onClick={() => onEditShortcut?.({ isNew: true })}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>
      </div>
    </div>
  );
}