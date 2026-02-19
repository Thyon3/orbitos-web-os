import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const SmartFileOrganizer = ({ files = [], onOrganize }) => {
  const { theme } = useTheme();
  const [organizationRules, setOrganizationRules] = useState([
    { id: 'images', pattern: /\.(jpg|jpeg|png|gif|svg|webp)$/i, destination: '/Pictures', enabled: true },
    { id: 'documents', pattern: /\.(pdf|doc|docx|txt|rtf)$/i, destination: '/Documents', enabled: true },
    { id: 'spreadsheets', pattern: /\.(xls|xlsx|csv)$/i, destination: '/Documents/Spreadsheets', enabled: true },
    { id: 'presentations', pattern: /\.(ppt|pptx)$/i, destination: '/Documents/Presentations', enabled: true },
    { id: 'videos', pattern: /\.(mp4|avi|mov|wmv|flv|webm)$/i, destination: '/Videos', enabled: true },
    { id: 'audio', pattern: /\.(mp3|wav|flac|aac|ogg)$/i, destination: '/Music', enabled: true },
    { id: 'archives', pattern: /\.(zip|rar|7z|tar|gz)$/i, destination: '/Archives', enabled: true },
    { id: 'code', pattern: /\.(js|ts|jsx|tsx|py|java|cpp|c|h|css|html)$/i, destination: '/Projects', enabled: true },
    { id: 'executables', pattern: /\.(exe|msi|dmg|pkg|deb|rpm)$/i, destination: '/Applications', enabled: true },
    { id: 'fonts', pattern: /\.(ttf|otf|woff|woff2|eot)$/i, destination: '/Fonts', enabled: true }
  ]);
  const [suggestedOrganization, setSuggestedOrganization] = useState({});
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizationHistory, setOrganizationHistory] = useState([]);

  // Analyze files and suggest organization
  const analyzeFiles = useCallback(() => {
    const suggestions = {};
    
    files.forEach(file => {
      // Check each rule
      organizationRules.forEach(rule => {
        if (rule.enabled && rule.pattern.test(file.name)) {
          if (!suggestions[rule.id]) {
            suggestions[rule.id] = {
              rule,
              files: [],
              destination: rule.destination,
              spaceSaved: 0
            };
          }
          suggestions[rule.id].files.push(file);
          suggestions[rule.id].spaceSaved += file.size || 0;
        }
      });
    });

    // Add uncategorized files
    const uncategorized = files.filter(file => 
      !organizationRules.some(rule => rule.enabled && rule.pattern.test(file.name))
    );
    
    if (uncategorized.length > 0) {
      suggestions.uncategorized = {
        rule: { id: 'uncategorized', destination: '/Uncategorized' },
        files: uncategorized,
        destination: '/Uncategorized',
        spaceSaved: uncategorized.reduce((sum, file) => sum + (file.size || 0), 0)
      };
    }

    setSuggestedOrganization(suggestions);
  }, [files, organizationRules]);

  // Analyze files when they change
  useEffect(() => {
    analyzeFiles();
  }, [files, analyzeFiles]);

  // Organize files
  const organizeFiles = useCallback(async () => {
    setIsOrganizing(true);
    
    const organizationActions = [];
    
    Object.entries(suggestedOrganization).forEach(([ruleId, suggestion]) => {
      if (ruleId === 'uncategorized') return;
      
      suggestion.files.forEach(file => {
        organizationActions.push({
          file,
          from: file.path,
          to: `${suggestion.destination}/${file.name}`,
          action: 'move',
          ruleId,
          timestamp: new Date().toISOString()
        });
      });
    });

    try {
      // Simulate organization process
      for (const action of organizationActions) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate file operation
      }

      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        filesMoved: organizationActions.length,
        spaceFreed: Object.values(suggestedOrganization)
          .filter(s => s.ruleId !== 'uncategorized')
          .reduce((sum, s) => sum + s.spaceSaved, 0),
        rules: Object.keys(suggestedOrganization).filter(id => id !== 'uncategorized')
      };

      setOrganizationHistory(prev => [historyEntry, ...prev]);
      
      if (onOrganize) {
        onOrganize(organizationActions);
      }
    } catch (error) {
      console.error('Organization failed:', error);
    } finally {
      setIsOrganizing(false);
    }
  }, [suggestedOrganization, onOrganize]);

  // Toggle rule
  const toggleRule = (ruleId) => {
    setOrganizationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  // Add custom rule
  const addCustomRule = () => {
    const name = prompt('Enter rule name:');
    const pattern = prompt('Enter file pattern (regex):');
    const destination = prompt('Enter destination path:');
    
    if (name && pattern && destination) {
      const newRule = {
        id: `custom-${Date.now()}`,
        name,
        pattern: new RegExp(pattern, 'i'),
        destination,
        enabled: true,
        isCustom: true
      };
      
      setOrganizationRules(prev => [...prev, newRule]);
    }
  };

  // Delete rule
  const deleteRule = (ruleId) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setOrganizationRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">Smart File Organizer</h2>
        <div className="flex space-x-2">
          <button
            onClick={analyzeFiles}
            className={`px-3 py-1 rounded ${theme.app.button}`}
          >
            Analyze
          </button>
          <button
            onClick={organizeFiles}
            disabled={isOrganizing || Object.keys(suggestedOrganization).length === 0}
            className={`px-3 py-1 rounded ${
              isOrganizing 
                ? 'bg-gray-400 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:opacity-50`}
          >
            {isOrganizing ? 'Organizing...' : 'Organize Files'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Organization Rules */}
        <div className="w-1/3 border-r border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Organization Rules</h3>
          <div className="space-y-2">
            {organizationRules.map(rule => (
              <div
                key={rule.id}
                className={`p-3 rounded-lg border ${theme.app.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`w-5 h-5 rounded-full transition-colors ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        rule.enabled ? 'translate-x-0.5' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="font-medium">
                      {rule.name || rule.id.charAt(0).toUpperCase() + rule.id.slice(1)}
                    </span>
                  </div>
                  {rule.isCustom && (
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div className={`text-sm ${theme.text.secondary}`}>
                  Destination: {rule.destination}
                </div>
                {rule.isCustom && (
                  <div className={`text-xs ${theme.text.secondary} mt-1`}>
                    Pattern: {rule.pattern.source}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={addCustomRule}
            className={`w-full mt-4 px-3 py-2 rounded ${theme.app.button}`}
          >
            + Add Custom Rule
          </button>
        </div>

        {/* Suggested Organization */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold mb-4">Suggested Organization</h3>
          
          {Object.keys(suggestedOrganization).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📁</div>
              <p>No files to organize</p>
              <p className="text-sm">Add files or adjust rules to see suggestions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(suggestedOrganization).map(([ruleId, suggestion]) => (
                <motion.div
                  key={ruleId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border ${theme.app.border}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">
                          {ruleId === 'images' && '🖼️'}
                          {ruleId === 'documents' && '📄'}
                          {ruleId === 'spreadsheets' && '📊'}
                          {ruleId === 'presentations' && '📽️'}
                          {ruleId === 'videos' && '🎥'}
                          {ruleId === 'audio' && '🎵'}
                          {ruleId === 'archives' && '📦'}
                          {ruleId === 'code' && '💻'}
                          {ruleId === 'executables' && '⚙️'}
                          {ruleId === 'fonts' && '🔤'}
                          {ruleId === 'uncategorized' && '❓'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {suggestion.rule.name || suggestion.rule.id.charAt(0).toUpperCase() + suggestion.rule.id.slice(1)}
                        </div>
                        <div className={`text-sm ${theme.text.secondary}`}>
                          {suggestion.files.length} files • {formatFileSize(suggestion.spaceSaved)}
                        </div>
                      </div>
                    </div>
                    {ruleId !== 'uncategorized' && (
                      <div className={`text-sm ${theme.text.secondary}`}>
                        → {suggestion.destination}
                      </div>
                    )}
                  </div>
                  
                  {/* File list */}
                  <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                    {suggestion.files.slice(0, 5).map((file, index) => (
                      <div key={index} className={`text-sm ${theme.text.secondary} flex items-center space-x-2`}>
                        <span>📄</span>
                        <span className="flex-1 truncate">{file.name}</span>
                        <span>{formatFileSize(file.size || 0)}</span>
                      </div>
                    ))}
                    {suggestion.files.length > 5 && (
                      <div className={`text-xs ${theme.text.secondary} text-center`}>
                        ... and {suggestion.files.length - 5} more files
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {organizationHistory.length > 0 && (
        <div className={`border-t ${theme.app.border} p-4`}>
          <h3 className="font-semibold mb-3">Organization History</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {organizationHistory.slice(0, 5).map((entry, index) => (
              <div key={index} className={`flex items-center justify-between text-sm ${theme.text.secondary}`}>
                <div>
                  {entry.filesMoved} files organized • {formatFileSize(entry.spaceFreed)} freed
                </div>
                <div>
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartFileOrganizer;
