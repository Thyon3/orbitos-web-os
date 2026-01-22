import React, { useState, useEffect, useRef } from 'react';
import { Save, X, AlertCircle, Keyboard } from 'lucide-react';
import { useShortcuts } from '@/context/ShortcutContext';

export default function ShortcutEditor({ shortcut, onClose, onSave }) {
  const { createShortcut, updateShortcut, checkConflict } = useShortcuts();
  
  const [formData, setFormData] = useState({
    shortcutId: '',
    category: 'custom',
    name: '',
    description: '',
    keys: [],
    keyCombination: '',
    action: '',
    appId: '',
  });
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedKeys, setCapturedKeys] = useState([]);
  const [conflict, setConflict] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  
  const keyInputRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    if (shortcut && !shortcut.isNew) {
      setFormData({
        shortcutId: shortcut.shortcutId || '',
        category: shortcut.category || 'custom',
        name: shortcut.name || '',
        description: shortcut.description || '',
        keys: shortcut.keys || [],
        keyCombination: shortcut.keyCombination || '',
        action: shortcut.action || '',
        appId: shortcut.appId || '',
      });
    } else {
      // Generate ID for new shortcut
      setFormData(prev => ({
        ...prev,
        shortcutId: `custom.${Date.now()}`,
      }));
    }
  }, [shortcut]);

  useEffect(() => {
    if (formData.keys.length > 0) {
      const combination = formData.keys.join('+');
      setFormData(prev => ({ ...prev, keyCombination: combination }));
      
      // Check for conflicts
      const conflictShortcut = checkConflict(combination, shortcut?._id);
      setConflict(conflictShortcut);
    }
  }, [formData.keys, checkConflict, shortcut]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleKeyCapture = (event) => {
    if (!isCapturing) return;
    
    event.preventDefault();
    event.stopPropagation();

    const keys = [];
    
    // Modifier keys
    if (event.ctrlKey || event.metaKey) keys.push(event.metaKey ? 'Cmd' : 'Ctrl');
    if (event.altKey) keys.push('Alt');
    if (event.shiftKey) keys.push('Shift');
    
    // Regular key
    const key = event.key;
    if (key !== 'Control' && key !== 'Alt' && key !== 'Shift' && key !== 'Meta') {
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

    if (keys.length > 0 && keys[keys.length - 1] !== 'Control' && keys[keys.length - 1] !== 'Alt' && keys[keys.length - 1] !== 'Shift') {
      setCapturedKeys(keys);
      setFormData(prev => ({ ...prev, keys }));
      setIsCapturing(false);
    }
  };

  const startCapture = () => {
    setIsCapturing(true);
    setCapturedKeys([]);
    if (captureRef.current) {
      captureRef.current.focus();
    }
  };

  const stopCapture = () => {
    setIsCapturing(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.keys.length === 0) {
      newErrors.keys = 'Key combination is required';
    }
    
    if (!formData.action.trim()) {
      newErrors.action = 'Action is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (conflict) return;
    
    setSaving(true);
    try {
      let savedShortcut;
      
      if (shortcut && !shortcut.isNew) {
        // Update existing shortcut
        savedShortcut = await updateShortcut(shortcut._id, {
          keys: formData.keys,
          keyCombination: formData.keyCombination,
          description: formData.description,
        });
      } else {
        // Create new shortcut
        savedShortcut = await createShortcut(formData);
      }
      
      onSave?.(savedShortcut);
      onClose();
    } catch (error) {
      console.error('Error saving shortcut:', error);
      setErrors({ general: error.message || 'Failed to save shortcut' });
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { value: 'system', label: '⚙️ System' },
    { value: 'navigation', label: '🧭 Navigation' },
    { value: 'window', label: '🪟 Window' },
    { value: 'apps', label: '📱 Apps' },
    { value: 'editing', label: '✏️ Editing' },
    { value: 'custom', label: '⭐ Custom' },
  ];

  const apps = [
    { value: '', label: 'None (Global)' },
    { value: 'notes', label: '📝 Notes' },
    { value: 'filemanager', label: '📂 File Manager' },
    { value: 'calculator', label: '🔢 Calculator' },
    { value: 'browser', label: '🌐 Browser' },
    { value: 'recyclebin', label: '🗑️ Recycle Bin' },
    { value: 'clipboard', label: '📋 Clipboard Manager' },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900">
                {shortcut?.isNew ? 'Create New Shortcut' : 'Edit Shortcut'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-auto">
          {/* General Error */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Conflict Warning */}
          {conflict && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              <span>
                Key combination conflicts with "{conflict.name}" shortcut
              </span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter shortcut name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={shortcut && !shortcut.isNew && !shortcut.isCustom}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe what this shortcut does"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Key Capture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Combination *
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div
                    ref={captureRef}
                    tabIndex={-1}
                    onKeyDown={handleKeyCapture}
                    className={`w-full px-3 py-3 border rounded-lg text-center cursor-pointer transition-colors ${
                      isCapturing
                        ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-500'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${errors.keys ? 'border-red-300' : ''}`}
                    onClick={startCapture}
                  >
                    {isCapturing ? (
                      <span className="text-purple-600 animate-pulse">
                        Press keys...
                      </span>
                    ) : formData.keys.length > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        {formData.keys.map((key, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded border"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        Click to capture key combination
                      </span>
                    )}
                  </div>
                </div>
                {isCapturing && (
                  <button
                    onClick={stopCapture}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {errors.keys && (
                <p className="text-red-500 text-xs">{errors.keys}</p>
              )}
              <p className="text-xs text-gray-500">
                Click the box above and press the key combination you want to use
              </p>
            </div>
          </div>

          {/* Action and App */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action *
              </label>
              <input
                type="text"
                value={formData.action}
                onChange={(e) => handleInputChange('action', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.action ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., openApp:notes, save, copy"
                disabled={shortcut && !shortcut.isNew && !shortcut.isCustom}
              />
              {errors.action && (
                <p className="text-red-500 text-xs mt-1">{errors.action}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App (Optional)
              </label>
              <select
                value={formData.appId}
                onChange={(e) => handleInputChange('appId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {apps.map((app) => (
                  <option key={app.value} value={app.value}>
                    {app.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !!conflict || Object.keys(errors).length > 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Shortcut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}