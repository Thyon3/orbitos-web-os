import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image, 
  File, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Plus,
  Tag
} from 'lucide-react';
import { useWallpaper } from '@/context/WallpaperContext';

export default function WallpaperUpload({ isOpen, onClose, onSuccess }) {
  const { uploadWallpaper, uploadProgress } = useWallpaper();
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: [],
    isPublic: false,
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'nature', label: 'Nature', icon: '🌿' },
    { value: 'abstract', label: 'Abstract', icon: '🎨' },
    { value: 'minimal', label: 'Minimal', icon: '⚪' },
    { value: 'space', label: 'Space', icon: '🌌' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'art', label: 'Art', icon: '🖼️' },
    { value: 'photography', label: 'Photography', icon: '📸' },
    { value: 'patterns', label: 'Patterns', icon: '🔲' },
    { value: 'solid', label: 'Solid Colors', icon: '🎨' },
    { value: 'custom', label: 'Custom', icon: '⭐' },
  ];

  const validateFile = (file) => {
    const errors = {};
    
    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.file = 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }
    
    // File size validation (10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.file = 'File size must be less than 10MB';
    }
    
    return errors;
  };

  const handleFileSelect = useCallback((file) => {
    const fileErrors = validateFile(file);
    
    if (Object.keys(fileErrors).length > 0) {
      setErrors(fileErrors);
      return;
    }
    
    setErrors({});
    setSelectedFile(file);
    
    // Auto-generate name from filename
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
    setMetadata(prev => ({
      ...prev,
      name: prev.name || nameWithoutExtension,
    }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleTagAdd = (tag) => {
    if (tag.trim() && !metadata.tags.includes(tag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateMetadata = () => {
    const errors = {};
    
    if (!metadata.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (metadata.name.length > 100) {
      errors.name = 'Name must be 100 characters or less';
    }
    
    if (metadata.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }
    
    return errors;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrors({ file: 'Please select a file' });
      return;
    }
    
    const metadataErrors = validateMetadata();
    if (Object.keys(metadataErrors).length > 0) {
      setErrors(metadataErrors);
      return;
    }
    
    setUploading(true);
    setErrors({});
    
    try {
      const uploadedWallpaper = await uploadWallpaper(selectedFile, metadata);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setMetadata({
        name: '',
        description: '',
        category: 'custom',
        tags: [],
        isPublic: false,
      });
      
      if (onSuccess) {
        onSuccess(uploadedWallpaper);
      }
      
      onClose();
    } catch (error) {
      setErrors({ upload: error.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setMetadata({
      name: '',
      description: '',
      category: 'custom',
      tags: [],
      isPublic: false,
    });
    setErrors({});
    setUploading(false);
  };

  if (!isOpen) return null;

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
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Upload Wallpaper
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
        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-3">
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-purple-400 bg-purple-50'
                      : errors.file
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                  onDrop={handleDrop}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                >
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your wallpaper here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400 mt-4">
                    Supported formats: JPEG, PNG, GIF, WebP (max 10MB)
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <File className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.file && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.file}</span>
                </div>
              )}
            </div>

            {/* Metadata Form */}
            {selectedFile && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Wallpaper Details
                </h3>
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={metadata.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter wallpaper name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe this wallpaper (optional)"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={metadata.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            onClick={() => handleTagRemove(tag)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a tag and press Enter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTagAdd(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Public Sharing */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metadata.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Make this wallpaper public
                      </span>
                      <p className="text-xs text-gray-500">
                        Other users will be able to view and download this wallpaper
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Uploading...</span>
                  <span className="text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Error */}
            {errors.upload && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{errors.upload}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Wallpaper
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}