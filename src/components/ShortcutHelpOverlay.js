import React, { useState, useEffect } from 'react';
import { X, Search, Keyboard, HelpCircle } from 'lucide-react';
import { useShortcuts } from '@/context/ShortcutContext';

export default function ShortcutHelpOverlay({ isOpen, onClose }) {
  const { shortcuts, groupedShortcuts, formatKeys } = useShortcuts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter shortcuts for help display
  const filteredShortcuts = shortcuts.filter((shortcut) => {
    if (!shortcut.isEnabled) return false;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      shortcut.name?.toLowerCase().includes(query) ||
      shortcut.description?.toLowerCase().includes(query) ||
      shortcut.keyCombination?.toLowerCase().includes(query);

    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

  const getCategoryDescription = (category) => {
    const descriptions = {
      system: 'System-wide shortcuts for core functionality',
      navigation: 'Navigate between windows and desktop areas',
      window: 'Manage window states and switching',
      apps: 'Quick access to applications',
      editing: 'Text editing and document manipulation',
      custom: 'User-defined custom shortcuts',
    };
    return descriptions[category] || 'Keyboard shortcuts';
  };

  const handleKeyDown = (event) => {
    // Close on Escape
    if (event.key === 'Escape') {
      onClose();
    }
    // Prevent shortcuts from executing while help is open
    event.stopPropagation();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Object.keys(groupedShortcuts);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                <p className="text-purple-100">
                  Quick reference for all available shortcuts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-200" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <option value="all" className="text-gray-900">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category} className="text-gray-900">
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
          {filteredShortcuts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Keyboard className="w-16 h-16 mb-4" />
              <p className="text-lg">No shortcuts found</p>
              <p className="text-sm">Try a different search term or category</p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.filter(category => 
                selectedCategory === 'all' || category === selectedCategory
              ).map((category) => {
                const categoryShortcuts = filteredShortcuts.filter(s => s.category === category);
                if (categoryShortcuts.length === 0) return null;

                return (
                  <div key={category} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                      <span className="text-3xl">{getCategoryIcon(category)}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 capitalize">
                          {category}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getCategoryDescription(category)}
                        </p>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {categoryShortcuts.length} shortcuts
                      </span>
                    </div>

                    {/* Shortcuts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categoryShortcuts.map((shortcut) => (
                        <div
                          key={shortcut._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {shortcut.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {shortcut.description}
                            </p>
                            {shortcut.appId && (
                              <p className="text-xs text-purple-600 mt-1">
                                App: {shortcut.appId}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {shortcut.keys?.map((key, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-mono rounded shadow-sm"
                              >
                                {key}
                              </span>
                            ))}
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
            <div className="flex items-center gap-6">
              <span>Total: {shortcuts.filter(s => s.isEnabled).length} shortcuts</span>
              <span>Categories: {categories.length}</span>
              {searchQuery && (
                <span>Showing: {filteredShortcuts.length} results</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> Close
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-200 rounded">F1</kbd> Show this help
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}