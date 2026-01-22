import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Download, 
  Share2, 
  Eye, 
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  Info
} from 'lucide-react';
import { useWallpaper } from '@/context/WallpaperContext';

export default function WallpaperPreview({ wallpaper, isOpen, onClose, onEdit }) {
  const { activateWallpaper, toggleFavorite, applyWallpaperToDesktop } = useWallpaper();
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, mobile, tablet
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen || !wallpaper) return null;

  const handleActivate = async () => {
    try {
      await activateWallpaper(wallpaper._id);
      onClose();
    } catch (error) {
      console.error('Failed to activate wallpaper:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(wallpaper._id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = wallpaper.url;
    link.download = wallpaper.originalName || wallpaper.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const shareData = {
      title: wallpaper.name,
      text: wallpaper.description || `Check out this wallpaper: ${wallpaper.name}`,
      url: window.location.origin + wallpaper.url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Wallpaper URL copied to clipboard!');
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const getDeviceClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-32 h-64';
      case 'tablet':
        return 'w-64 h-48';
      default: // desktop
        return 'w-96 h-56';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-purple-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {wallpaper.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {wallpaper.resolution} • {formatFileSize(wallpaper.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-lg transition-colors ${
                  showInfo ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Toggle Info"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Preview Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            {/* Device Mode Selector */}
            <div className="flex items-center gap-2 mb-6 p-1 bg-white rounded-lg shadow-sm">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'desktop' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Desktop Preview"
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'tablet' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Tablet Preview"
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'mobile' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Mobile Preview"
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Device */}
            <div className={`${getDeviceClass()} bg-black rounded-lg shadow-xl overflow-hidden relative`}>
              <img
                src={wallpaper.url}
                alt={wallpaper.name}
                className="w-full h-full object-cover"
              />
              {wallpaper.isActive && (
                <div className="absolute top-2 left-2">
                  <div className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                    Active
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-4 capitalize">
              {previewMode} Preview
            </p>
          </div>

          {/* Info Sidebar */}
          {showInfo && (
            <div className="w-80 border-l border-gray-200 bg-white overflow-auto">
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolution:</span>
                      <span className="font-medium">{wallpaper.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{formatFileSize(wallpaper.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium uppercase">{wallpaper.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{wallpaper.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added:</span>
                      <span className="font-medium">{formatDate(wallpaper.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{wallpaper.viewCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {wallpaper.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-sm text-gray-700">
                      {wallpaper.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {wallpaper.tags && wallpaper.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {wallpaper.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {wallpaper.colors && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Colors
                    </h3>
                    {wallpaper.colors.dominant && (
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: wallpaper.colors.dominant }}
                        />
                        <span className="text-sm text-gray-700">
                          {wallpaper.colors.dominant}
                        </span>
                      </div>
                    )}
                    {wallpaper.colors.palette && wallpaper.colors.palette.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {wallpaper.colors.palette.slice(0, 10).map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  wallpaper.isFavorite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={wallpaper.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-5 h-5 ${wallpaper.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(wallpaper)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Edit Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleActivate}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  wallpaper.isActive
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {wallpaper.isActive ? 'Currently Active' : 'Set as Wallpaper'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}