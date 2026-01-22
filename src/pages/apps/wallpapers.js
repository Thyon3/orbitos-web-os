import React, { useState } from 'react';
import WallpaperManager from '@/components/WallpaperManager';
import WallpaperUpload from '@/components/WallpaperUpload';
import WallpaperPreview from '@/components/WallpaperPreview';
import WallpaperEffects from '@/components/WallpaperEffects';
import WallpaperSettings from '@/components/WallpaperSettings';
import { Image, Upload, Settings, Plus } from 'lucide-react';

export default function WallpapersPage() {
  const [activeTab, setActiveTab] = useState('manager');
  const [showUpload, setShowUpload] = useState(false);
  const [previewWallpaper, setPreviewWallpaper] = useState(null);
  const [editWallpaper, setEditWallpaper] = useState(null);

  const handleUploadSuccess = (wallpaper) => {
    console.log('Wallpaper uploaded successfully:', wallpaper);
    // Optionally switch to manager tab to show the new wallpaper
    setActiveTab('manager');
  };

  const handlePreviewWallpaper = (wallpaper) => {
    setPreviewWallpaper(wallpaper);
  };

  const handleEditWallpaper = (wallpaper) => {
    setEditWallpaper(wallpaper);
  };

  const handleEffectsSave = (wallpaper) => {
    console.log('Wallpaper effects saved:', wallpaper);
    // Refresh the manager view
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('manager')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'manager'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Wallpapers
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'manager' ? (
          <div className="h-full relative">
            <WallpaperManager 
              onPreview={handlePreviewWallpaper}
              onEdit={handleEditWallpaper}
            />
            
            {/* Floating Upload Button */}
            <button
              onClick={() => setShowUpload(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors flex items-center justify-center z-50"
              title="Upload Wallpaper"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <WallpaperSettings onClose={() => setActiveTab('manager')} />
          </div>
        )}
      </div>

      {/* Modals */}
      <WallpaperUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={handleUploadSuccess}
      />

      <WallpaperPreview
        wallpaper={previewWallpaper}
        isOpen={!!previewWallpaper}
        onClose={() => setPreviewWallpaper(null)}
        onEdit={handleEditWallpaper}
      />

      <WallpaperEffects
        wallpaper={editWallpaper}
        isOpen={!!editWallpaper}
        onClose={() => setEditWallpaper(null)}
        onSave={handleEffectsSave}
      />
    </div>
  );
}