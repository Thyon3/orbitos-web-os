import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import CloudStorageManager from '@/lib/cloudStorage';

const AdvancedFileManager = () => {
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, details
  const [sortBy, setSortBy] = useState('name'); // name, size, modifiedTime
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showCloudSettings, setShowCloudSettings] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  
  const cloudStorage = new CloudStorageManager();

  useEffect(() => {
    loadFiles();
  }, [currentPath, sortBy]);

  const loadFiles = async () => {
    try {
      const allFiles = await cloudStorage.listAllFiles();
      const filteredFiles = allFiles.filter(file => 
        file.id.startsWith(currentPath) && 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const sortedFiles = filteredFiles.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'size':
            return (b.size || 0) - (a.size || 0);
          case 'modifiedTime':
            return new Date(b.modifiedTime) - new Date(a.modifiedTime);
          default:
            return 0;
        }
      });
      
      setFiles(sortedFiles.filter(f => f.type === 'file'));
      setFolders(sortedFiles.filter(f => f.type === 'folder'));
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setIsUploading(true);
    
    try {
      for (const file of uploadedFiles) {
        const fileData = {
          path: URL.createObjectURL(file),
          type: file.type,
          name: file.name
        };
        
        // Upload to all connected providers
        for (const provider of connectedProviders) {
          await cloudStorage[`uploadTo${provider.charAt(0).toUpperCase() + provider.slice(1)}`](
            fileData,
            file.name,
            currentPath
          );
        }
      }
      
      await loadFiles();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (fileId, multiSelect = false) => {
    if (multiSelect) {
      setSelectedFiles(prev => 
        prev.includes(fileId) 
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      );
    } else {
      setSelectedFiles([fileId]);
    }
  };

  const handleFileDelete = async (fileId, provider) => {
    try {
      await cloudStorage.deleteFile(fileId, provider);
      await loadFiles();
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFilePreview = async (file) => {
    try {
      const preview = await cloudStorage.getFilePreview(file.id, file.provider);
      setFilePreview({
        ...file,
        content: preview
      });
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      file
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') return '📁';
    
    const extension = file.name.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      mp3: '🎵',
      zip: '📦',
      rar: '📦'
    };
    
    return iconMap[extension] || '📄';
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <div className="flex items-center space-x-4">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPath('')}
              className={`p-2 rounded ${theme.app.toolbarButton}`}
            >
              🏠
            </button>
            <button
              onClick={() => setCurrentPath(prev => prev.split('/').slice(0, -1).join('/'))}
              className={`p-2 rounded ${theme.app.toolbarButton}`}
              disabled={!currentPath}
            >
              ⬅️
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-4 py-2 rounded ${theme.app.input} w-64`}
            />
            <span className="absolute right-3 top-2.5">🔍</span>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? theme.app.toolbar_button_active : theme.app.toolbarButton}`}
            >
              ⚏
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? theme.app.toolbar_button_active : theme.app.toolbarButton}`}
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`p-2 rounded ${viewMode === 'details' ? theme.app.toolbar_button_active : theme.app.toolbarButton}`}
            >
              📊
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded ${theme.app.input}`}
          >
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="modifiedTime">Modified</option>
          </select>

          {/* Cloud Settings */}
          <button
            onClick={() => setShowCloudSettings(!showCloudSettings)}
            className={`p-2 rounded ${theme.app.toolbarButton}`}
          >
            ☁️
          </button>

          {/* Upload */}
          <label className={`px-4 py-2 rounded ${theme.app.button} cursor-pointer`}>
            📤 Upload
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Cloud Settings Panel */}
      <AnimatePresence>
        {showCloudSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-b ${theme.app.toolbar} p-4`}
          >
            <div className="flex items-center space-x-4">
              <span className="font-medium">Connected Services:</span>
              {['google', 'dropbox', 'aws'].map(provider => (
                <button
                  key={provider}
                  className={`px-3 py-1 rounded ${
                    connectedProviders.includes(provider)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Browser */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {folders.map(folder => (
              <motion.div
                key={folder.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer ${theme.app.button_subtle_hover}`}
                onClick={() => setCurrentPath(`${currentPath}/${folder.name}`)}
                onContextMenu={(e) => handleContextMenu(e, folder)}
              >
                <div className="text-4xl mb-2">{getFileIcon(folder)}</div>
                <span className="text-sm text-center truncate w-full">{folder.name}</span>
              </motion.div>
            ))}
            {files.map(file => (
              <motion.div
                key={`${file.provider}-${file.id}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                } ${theme.app.button_subtle_hover}`}
                onClick={() => handleFileSelect(file.id)}
                onDoubleClick={() => handleFilePreview(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                <div className="text-4xl mb-2">{getFileIcon(file)}</div>
                <span className="text-sm text-center truncate w-full">{file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              </motion.div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-2">
            {folders.map(folder => (
              <motion.div
                key={folder.id}
                whileHover={{ x: 5 }}
                className={`flex items-center p-3 rounded-lg cursor-pointer ${theme.app.button_subtle_hover}`}
                onClick={() => setCurrentPath(`${currentPath}/${folder.name}`)}
                onContextMenu={(e) => handleContextMenu(e, folder)}
              >
                <span className="text-2xl mr-3">{getFileIcon(folder)}</span>
                <span className="flex-1">{folder.name}</span>
                <span className="text-sm text-gray-500">Folder</span>
              </motion.div>
            ))}
            {files.map(file => (
              <motion.div
                key={`${file.provider}-${file.id}`}
                whileHover={{ x: 5 }}
                className={`flex items-center p-3 rounded-lg cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                } ${theme.app.button_subtle_hover}`}
                onClick={() => handleFileSelect(file.id)}
                onDoubleClick={() => handleFilePreview(file)}
                onContextMenu={(e) => handleContextMenu(e, file)}
              >
                <span className="text-2xl mr-3">{getFileIcon(file)}</span>
                <span className="flex-1">{file.name}</span>
                <span className="text-sm text-gray-500 mr-4">{formatFileSize(file.size)}</span>
                <span className="text-sm text-gray-500 mr-4">{file.provider}</span>
                <span className="text-sm text-gray-500">{formatDate(file.modifiedTime)}</span>
              </motion.div>
            ))}
          </div>
        )}

        {viewMode === 'details' && (
          <table className={`w-full ${theme.app.table}`}>
            <thead>
              <tr className={theme.app.tableHeader}>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Size</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Provider</th>
                <th className="text-left p-2">Modified</th>
              </tr>
            </thead>
            <tbody>
              {folders.map(folder => (
                <tr
                  key={folder.id}
                  className={`cursor-pointer ${theme.app.tableCell} ${theme.app.button_subtle_hover}`}
                  onClick={() => setCurrentPath(`${currentPath}/${folder.name}`)}
                  onContextMenu={(e) => handleContextMenu(e, folder)}
                >
                  <td className="p-2 flex items-center">
                    <span className="text-xl mr-2">{getFileIcon(folder)}</span>
                    {folder.name}
                  </td>
                  <td className="p-2">-</td>
                  <td className="p-2">Folder</td>
                  <td className="p-2">{folder.provider}</td>
                  <td className="p-2">{formatDate(folder.modifiedTime)}</td>
                </tr>
              ))}
              {files.map(file => (
                <tr
                  key={`${file.provider}-${file.id}`}
                  className={`cursor-pointer ${theme.app.tableCell} ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                  } ${theme.app.button_subtle_hover}`}
                  onClick={() => handleFileSelect(file.id)}
                  onDoubleClick={() => handleFilePreview(file)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <td className="p-2 flex items-center">
                    <span className="text-xl mr-2">{getFileIcon(file)}</span>
                    {file.name}
                  </td>
                  <td className="p-2">{formatFileSize(file.size)}</td>
                  <td className="p-2">{file.mimeType || 'Unknown'}</td>
                  <td className="p-2">{file.provider}</td>
                  <td className="p-2">{formatDate(file.modifiedTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed ${theme.app.dropdown_bg} rounded-lg shadow-xl py-2 z-50`}
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
            onClick={() => setContextMenu(null)}
          >
            <button
              className={`w-full text-left px-4 py-2 ${theme.app.dropdown_item_hover}`}
              onClick={() => {
                handleFilePreview(contextMenu.file);
                setContextMenu(null);
              }}
            >
              👁️ Preview
            </button>
            <button
              className={`w-full text-left px-4 py-2 ${theme.app.dropdown_item_hover}`}
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.file.url);
                setContextMenu(null);
              }}
            >
              📋 Copy Link
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-red-500 ${theme.app.dropdown_item_hover}`}
              onClick={() => {
                handleFileDelete(contextMenu.file.id, contextMenu.file.provider);
                setContextMenu(null);
              }}
            >
              🗑️ Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <AnimatePresence>
        {filePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setFilePreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`${theme.app.bg} rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{filePreview.name}</h2>
                <button
                  onClick={() => setFilePreview(null)}
                  className="text-2xl hover:bg-gray-200 rounded p-1"
                >
                  ✕
                </button>
              </div>
              
              {filePreview.mimeType?.startsWith('image/') ? (
                <img
                  src={filePreview.url}
                  alt={filePreview.name}
                  className="max-w-full h-auto"
                />
              ) : filePreview.mimeType?.startsWith('text/') ? (
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {filePreview.content}
                </pre>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">{getFileIcon(filePreview)}</div>
                  <p>Preview not available for this file type</p>
                  <a
                    href={filePreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFileManager;
