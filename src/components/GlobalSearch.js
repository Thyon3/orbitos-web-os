import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, File, FileText, AppWindow, Loader } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { openApp } = useApp();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load search history
  useEffect(() => {
    if (isOpen) {
      loadSearchHistory();
    }
  }, [isOpen]);

  // Perform search when query changes
  useEffect(() => {
    if (query.trim().length > 0) {
      const debounceTimer = setTimeout(() => {
        performSearch(query);
      }, 300); // Debounce search
      return () => clearTimeout(debounceTimer);
    } else {
      setResults(null);
    }
  }, [query]);

  const loadSearchHistory = async () => {
    try {
      const response = await fetch('/api/search/history');
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveToHistory = async (searchQuery) => {
    try {
      await fetch('/api/search/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result) => {
    saveToHistory(query);

    if (result.type === 'app') {
      openApp(result.id);
    } else if (result.type === 'file' || result.type === 'document') {
      // Open file manager or notes app based on type
      if (result.type === 'file') {
        openApp('filemanager');
      } else {
        openApp('notes');
      }
    }

    onClose();
    setQuery('');
    setResults(null);
  };

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem.query);
    performSearch(historyItem.query);
  };

  const clearHistory = async () => {
    try {
      await fetch('/api/search/history', { method: 'DELETE' });
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (!results) return;

    const allResults = [
      ...(results.apps || []),
      ...(results.files || []),
      ...(results.documents || []),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const allResults = results
    ? [...(results.apps || []), ...(results.files || []), ...(results.documents || [])]
    : [];

  const getResultIcon = (type) => {
    switch (type) {
      case 'app':
        return <AppWindow className="w-5 h-5" />;
      case 'file':
        return <File className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files, documents, and apps..."
            className="flex-1 outline-none text-lg"
          />
          {loading && <Loader className="w-5 h-5 text-gray-400 animate-spin" />}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query && searchHistory.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Recent Searches</span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(-5).reverse().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <p className="text-sm text-gray-700">{item.query}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results && allResults.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {query && allResults.length > 0 && (
            <div className="p-2">
              {/* Apps Section */}
              {results.apps && results.apps.length > 0 && (
                <div className="mb-4">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Apps ({results.apps.length})
                  </p>
                  {results.apps.map((result, index) => {
                    const globalIndex = index;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                          selectedIndex === globalIndex
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">{result.icon}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{result.name}</p>
                          <p className="text-xs text-gray-500">Application</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Files Section */}
              {results.files && results.files.length > 0 && (
                <div className="mb-4">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Files ({results.files.length})
                  </p>
                  {results.files.map((result, index) => {
                    const globalIndex = (results.apps?.length || 0) + index;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                          selectedIndex === globalIndex
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {getResultIcon(result.type)}
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{result.name}</p>
                          {result.content && (
                            <p className="text-xs text-gray-500 truncate">
                              {result.content}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Documents Section */}
              {results.documents && results.documents.length > 0 && (
                <div className="mb-4">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Documents ({results.documents.length})
                  </p>
                  {results.documents.map((result, index) => {
                    const globalIndex =
                      (results.apps?.length || 0) +
                      (results.files?.length || 0) +
                      index;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                          selectedIndex === globalIndex
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {getResultIcon(result.type)}
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{result.name}</p>
                          {result.content && (
                            <p className="text-xs text-gray-500 truncate">
                              {result.content}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          {results && (
            <span className="font-medium">{results.total} results</span>
          )}
        </div>
      </div>
    </div>
  );
}
