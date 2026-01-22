import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Eye, 
  Save, 
  X,
  Sliders,
  Monitor,
  Palette,
  Filter
} from 'lucide-react';
import { useWallpaper } from '@/context/WallpaperContext';

export default function WallpaperEffects({ wallpaper, isOpen, onClose, onSave }) {
  const { updateWallpaper, applyWallpaperToDesktop } = useWallpaper();
  
  const [settings, setSettings] = useState({
    fit: 'cover',
    position: 'center',
    blur: 0,
    opacity: 100,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    ...wallpaper?.settings,
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (wallpaper?.settings) {
      setSettings(prev => ({ ...prev, ...wallpaper.settings }));
    }
  }, [wallpaper]);

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Apply preview if enabled
      if (isPreviewMode) {
        applyPreview(newSettings);
      }
      
      setHasChanges(true);
      return newSettings;
    });
  };

  const applyPreview = (previewSettings) => {
    const tempWallpaper = {
      ...wallpaper,
      settings: previewSettings,
    };
    applyWallpaperToDesktop(tempWallpaper);
  };

  const handlePreviewToggle = () => {
    if (!isPreviewMode) {
      // Start preview
      setIsPreviewMode(true);
      applyPreview(settings);
    } else {
      // Stop preview - revert to original
      setIsPreviewMode(false);
      if (wallpaper) {
        applyWallpaperToDesktop(wallpaper);
      }
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      fit: 'cover',
      position: 'center',
      blur: 0,
      opacity: 100,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      sepia: 0,
      grayscale: 0,
      invert: 0,
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
    
    if (isPreviewMode) {
      applyPreview(defaultSettings);
    }
  };

  const handleSave = async () => {
    try {
      const updatedWallpaper = await updateWallpaper(wallpaper._id, { settings });
      
      // Apply the settings to desktop
      applyWallpaperToDesktop(updatedWallpaper);
      
      if (onSave) {
        onSave(updatedWallpaper);
      }
      
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save wallpaper settings:', error);
    }
  };

  const handleClose = () => {
    // If in preview mode, revert to original settings
    if (isPreviewMode && wallpaper) {
      applyWallpaperToDesktop(wallpaper);
    }
    setIsPreviewMode(false);
    onClose();
  };

  const fitOptions = [
    { value: 'cover', label: 'Cover', description: 'Scale to cover entire screen' },
    { value: 'contain', label: 'Contain', description: 'Scale to fit within screen' },
    { value: 'fill', label: 'Fill', description: 'Stretch to fill screen' },
    { value: 'stretch', label: 'Stretch', description: 'Distort to fill screen' },
    { value: 'center', label: 'Center', description: 'Center without scaling' },
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

  const getPreviewStyle = () => {
    const filters = [];
    
    if (settings.blur > 0) filters.push(`blur(${settings.blur}px)`);
    if (settings.brightness !== 100) filters.push(`brightness(${settings.brightness}%)`);
    if (settings.contrast !== 100) filters.push(`contrast(${settings.contrast}%)`);
    if (settings.saturation !== 100) filters.push(`saturate(${settings.saturation}%)`);
    if (settings.hue !== 0) filters.push(`hue-rotate(${settings.hue}deg)`);
    if (settings.sepia > 0) filters.push(`sepia(${settings.sepia}%)`);
    if (settings.grayscale > 0) filters.push(`grayscale(${settings.grayscale}%)`);
    if (settings.invert > 0) filters.push(`invert(${settings.invert}%)`);

    return {
      backgroundImage: `url(${wallpaper?.url})`,
      backgroundSize: {
        cover: 'cover',
        contain: 'contain',
        fill: '100% 100%',
        stretch: '100% 100%',
        center: 'auto',
      }[settings.fit],
      backgroundPosition: {
        center: 'center center',
        top: 'center top',
        bottom: 'center bottom',
        left: 'left center',
        right: 'right center',
        'top-left': 'left top',
        'top-right': 'right top',
        'bottom-left': 'left bottom',
        'bottom-right': 'right bottom',
      }[settings.position],
      backgroundRepeat: 'no-repeat',
      filter: filters.join(' '),
      opacity: settings.opacity / 100,
    };
  };

  if (!isOpen || !wallpaper) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-purple-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Wallpaper Effects
                </h2>
                <p className="text-sm text-gray-500">
                  {wallpaper.name} • {wallpaper.resolution}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviewToggle}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                  isPreviewMode
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                {isPreviewMode ? 'Previewing' : 'Preview'}
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Settings Panel */}
          <div className="w-80 border-r border-gray-200 overflow-auto p-6 space-y-6">
            {/* Position and Fit */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Display
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fit
                  </label>
                  <select
                    value={settings.fit}
                    onChange={(e) => updateSetting('fit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {fitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {fitOptions.find(o => o.value === settings.fit)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={settings.position}
                    onChange={(e) => updateSetting('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {positionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Basic Adjustments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Adjustments
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Opacity</label>
                    <span className="text-sm text-gray-500">{settings.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.opacity}
                    onChange={(e) => updateSetting('opacity', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Brightness</label>
                    <span className="text-sm text-gray-500">{settings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.brightness}
                    onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Contrast</label>
                    <span className="text-sm text-gray-500">{settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.contrast}
                    onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Saturation</label>
                    <span className="text-sm text-gray-500">{settings.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.saturation}
                    onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Blur</label>
                    <span className="text-sm text-gray-500">{settings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={settings.blur}
                    onChange={(e) => updateSetting('blur', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Color Effects */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Effects
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Hue</label>
                    <span className="text-sm text-gray-500">{settings.hue}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.hue}
                    onChange={(e) => updateSetting('hue', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Sepia</label>
                    <span className="text-sm text-gray-500">{settings.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sepia}
                    onChange={(e) => updateSetting('sepia', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Grayscale</label>
                    <span className="text-sm text-gray-500">{settings.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.grayscale}
                    onChange={(e) => updateSetting('grayscale', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Invert</label>
                    <span className="text-sm text-gray-500">{settings.invert}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.invert}
                    onChange={(e) => updateSetting('invert', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center gap-2">
                <Filter className="w-5 h-5" />
                Preview
              </h3>
              
              <div 
                className="w-full h-48 rounded-lg border border-gray-300 shadow-lg"
                style={getPreviewStyle()}
              />
              
              <div className="mt-4 text-center text-sm text-gray-500">
                {isPreviewMode ? (
                  <span className="text-green-600 font-medium">
                    Live preview active on desktop
                  </span>
                ) : (
                  'Enable preview to see changes on desktop'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hasChanges && 'You have unsaved changes'}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}