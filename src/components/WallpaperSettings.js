import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Play, 
  Pause, 
  Clock,
  Shuffle,
  Monitor,
  Folder,
  Palette,
  Download,
  Bell
} from 'lucide-react';
import { useWallpaper } from '@/context/WallpaperContext';

export default function WallpaperSettings({ onClose }) {
  const { 
    slideshow, 
    startSlideshow, 
    stopSlideshow, 
    wallpapers 
  } = useWallpaper();

  const [settings, setSettings] = useState({
    // Slideshow Settings
    slideshow: {
      enabled: false,
      interval: 30, // minutes
      category: 'all',
      shuffle: true,
      includeFavorites: false,
      onlyFavorites: false,
      transition: 'fade',
      pauseOnHover: false,
    },
    
    // Display Settings
    display: {
      autoFit: true,
      defaultPosition: 'center',
      rememberSettings: true,
      applyToNewWallpapers: false,
    },
    
    // Storage Settings
    storage: {
      autoCleanup: true,
      maxWallpapers: 100,
      maxStorageSize: 500, // MB
      deleteAfterDays: 30,
      compressUploads: true,
      generateThumbnails: true,
    },
    
    // Notification Settings
    notifications: {
      slideshowChange: false,
      uploadComplete: true,
      lowStorage: true,
      newWallpapers: false,
    },
    
    // Performance Settings
    performance: {
      enableAnimations: true,
      preloadNext: true,
      lowQualityMode: false,
      limitConcurrentUploads: 3,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      slideshow: {
        ...prev.slideshow,
        enabled: slideshow.enabled,
        interval: slideshow.interval,
        category: slideshow.category,
        shuffle: slideshow.shuffle,
      },
    }));
  }, [slideshow]);

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSlideshowToggle = () => {
    const newEnabled = !settings.slideshow.enabled;
    updateSetting('slideshow', 'enabled', newEnabled);
    
    if (newEnabled) {
      startSlideshow({
        category: settings.slideshow.category,
        interval: settings.slideshow.interval,
        shuffle: settings.slideshow.shuffle,
      });
    } else {
      stopSlideshow();
    }
  };

  const handleSave = () => {
    // In a real app, this would save to user preferences API
    console.log('Saving wallpaper settings:', settings);
    
    // Apply slideshow settings
    if (settings.slideshow.enabled) {
      startSlideshow({
        category: settings.slideshow.category,
        interval: settings.slideshow.interval,
        shuffle: settings.slideshow.shuffle,
      });
    }
    
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Reset all wallpaper settings to defaults?')) {
      setSettings({
        slideshow: {
          enabled: false,
          interval: 30,
          category: 'all',
          shuffle: true,
          includeFavorites: false,
          onlyFavorites: false,
          transition: 'fade',
          pauseOnHover: false,
        },
        display: {
          autoFit: true,
          defaultPosition: 'center',
          rememberSettings: true,
          applyToNewWallpapers: false,
        },
        storage: {
          autoCleanup: true,
          maxWallpapers: 100,
          maxStorageSize: 500,
          deleteAfterDays: 30,
          compressUploads: true,
          generateThumbnails: true,
        },
        notifications: {
          slideshowChange: false,
          uploadComplete: true,
          lowStorage: true,
          newWallpapers: false,
        },
        performance: {
          enableAnimations: true,
          preloadNext: true,
          lowQualityMode: false,
          limitConcurrentUploads: 3,
        },
      });
      setHasChanges(true);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'nature', label: 'Nature' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'space', label: 'Space' },
    { value: 'technology', label: 'Technology' },
    { value: 'art', label: 'Art' },
    { value: 'photography', label: 'Photography' },
    { value: 'patterns', label: 'Patterns' },
    { value: 'solid', label: 'Solid Colors' },
    { value: 'custom', label: 'Custom' },
  ];

  const intervalOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 360, label: '6 hours' },
    { value: 720, label: '12 hours' },
    { value: 1440, label: '24 hours' },
  ];

  const positionOptions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-900">
            Wallpaper Settings
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-purple-700 text-sm">
            You have unsaved changes. Don't forget to save your settings.
          </p>
        </div>
      )}

      <div className="grid gap-8">
        {/* Slideshow Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-500" />
            Slideshow Settings
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Enable Slideshow</h3>
                <p className="text-sm text-gray-500">
                  Automatically change wallpapers at set intervals
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.slideshow.enabled}
                  onChange={handleSlideshowToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Interval
                </label>
                <select
                  value={settings.slideshow.interval}
                  onChange={(e) => updateSetting('slideshow', 'interval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {intervalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={settings.slideshow.category}
                  onChange={(e) => updateSetting('slideshow', 'category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.slideshow.shuffle}
                  onChange={(e) => updateSetting('slideshow', 'shuffle', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">
                    Shuffle Order
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.slideshow.onlyFavorites}
                  onChange={(e) => updateSetting('slideshow', 'onlyFavorites', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Only use favorite wallpapers
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.slideshow.pauseOnHover}
                  onChange={(e) => updateSetting('slideshow', 'pauseOnHover', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Pause slideshow when cursor is on desktop
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            Display Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Position
              </label>
              <select
                value={settings.display.defaultPosition}
                onChange={(e) => updateSetting('display', 'defaultPosition', e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {positionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.display.autoFit}
                  onChange={(e) => updateSetting('display', 'autoFit', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Automatically fit wallpapers to screen
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.display.rememberSettings}
                  onChange={(e) => updateSetting('display', 'rememberSettings', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Remember individual wallpaper settings
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.display.applyToNewWallpapers}
                  onChange={(e) => updateSetting('display', 'applyToNewWallpapers', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Apply current settings to new wallpapers
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Storage Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-orange-500" />
            Storage Settings
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Wallpapers
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={settings.storage.maxWallpapers}
                  onChange={(e) => updateSetting('storage', 'maxWallpapers', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Storage (MB)
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={settings.storage.maxStorageSize}
                  onChange={(e) => updateSetting('storage', 'maxStorageSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-delete after (days)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.storage.deleteAfterDays}
                onChange={(e) => updateSetting('storage', 'deleteAfterDays', parseInt(e.target.value))}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unused wallpapers will be automatically deleted after this period
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.storage.autoCleanup}
                  onChange={(e) => updateSetting('storage', 'autoCleanup', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable automatic cleanup
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.storage.compressUploads}
                  onChange={(e) => updateSetting('storage', 'compressUploads', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Compress uploaded images
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.storage.generateThumbnails}
                  onChange={(e) => updateSetting('storage', 'generateThumbnails', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Generate thumbnails for faster loading
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            Notification Settings
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Slideshow wallpaper changes
              </span>
              <input
                type="checkbox"
                checked={settings.notifications.slideshowChange}
                onChange={(e) => updateSetting('notifications', 'slideshowChange', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Upload completion
              </span>
              <input
                type="checkbox"
                checked={settings.notifications.uploadComplete}
                onChange={(e) => updateSetting('notifications', 'uploadComplete', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Low storage warnings
              </span>
              <input
                type="checkbox"
                checked={settings.notifications.lowStorage}
                onChange={(e) => updateSetting('notifications', 'lowStorage', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                New wallpaper recommendations
              </span>
              <input
                type="checkbox"
                checked={settings.notifications.newWallpapers}
                onChange={(e) => updateSetting('notifications', 'newWallpapers', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-green-500" />
            Performance Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concurrent Upload Limit
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.performance.limitConcurrentUploads}
                onChange={(e) => updateSetting('performance', 'limitConcurrentUploads', parseInt(e.target.value))}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.performance.enableAnimations}
                  onChange={(e) => updateSetting('performance', 'enableAnimations', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable animations and transitions
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.performance.preloadNext}
                  onChange={(e) => updateSetting('performance', 'preloadNext', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Preload next slideshow wallpaper
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.performance.lowQualityMode}
                  onChange={(e) => updateSetting('performance', 'lowQualityMode', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Low quality mode (faster loading)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}