import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function NotificationSettings({ 
  settings = {}, 
  onSave, 
  onReset 
}) {
  const [localSettings, setLocalSettings] = useState({
    enabled: true,
    sound: true,
    browser: true,
    desktop: false,
    categories: {
      system: true,
      app: true,
      security: true,
      update: true,
      social: false,
      task: true,
      reminder: true,
      custom: true,
    },
    priorities: {
      low: false,
      normal: true,
      high: true,
      critical: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    autoRead: {
      enabled: false,
      delay: 5, // seconds
    },
    persistence: {
      maxAge: 30, // days
      maxCount: 1000,
      autoArchive: true,
    },
    display: {
      position: 'top-right',
      maxVisible: 5,
      duration: 5000,
      sticky: false,
    },
    ...settings,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    // Check browser notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, ...settings }));
  }, [settings]);

  const updateSetting = (path, value) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        newSettings[parent] = { ...newSettings[parent], [child]: value };
      } else {
        newSettings[path] = value;
      }
      
      return newSettings;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localSettings);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm('Reset all notification settings to defaults?')) {
      if (onReset) {
        onReset();
      }
      setHasChanges(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        updateSetting('browser', permission === 'granted');
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const testNotification = () => {
    if (onSave) {
      onSave(localSettings);
    }
    
    // Show test notification
    if (window.showNotification) {
      window.showNotification(
        'Test Notification',
        'info',
        3000
      );
    }
  };

  const positions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">
            Notification Settings
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testNotification}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Test Notification
          </button>
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            You have unsaved changes. Don't forget to save your settings.
          </p>
        </div>
      )}

      <div className="grid gap-8">
        {/* General Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            General Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Enable Notifications</p>
                  <p className="text-sm text-gray-500">
                    Turn notifications on or off completely
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.enabled}
                  onChange={(e) => updateSetting('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Sound</p>
                  <p className="text-sm text-gray-500">
                    Play sound for notifications
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.sound}
                  onChange={(e) => updateSetting('sound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Browser Notifications</p>
                  <p className="text-sm text-gray-500">
                    Show notifications outside the app
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {permissionStatus === 'denied' && (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                    Blocked
                  </span>
                )}
                {permissionStatus === 'default' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Allow
                  </button>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.browser && permissionStatus === 'granted'}
                    onChange={(e) => updateSetting('browser', e.target.checked)}
                    disabled={permissionStatus !== 'granted'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Categories
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(localSettings.categories).map(([category, enabled]) => (
              <label key={category} className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => updateSetting(`categories.${category}`, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors">
                    {enabled && <CheckSquare className="w-5 h-5 text-white absolute top-0 left-0" />}
                  </div>
                </div>
                <span className="text-gray-700 capitalize">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Priorities */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Priority Levels
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(localSettings.priorities).map(([priority, enabled]) => (
              <label key={priority} className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => updateSetting(`priorities.${priority}`, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors">
                    {enabled && <CheckSquare className="w-5 h-5 text-white absolute top-0 left-0" />}
                  </div>
                </div>
                <span className={`capitalize ${
                  priority === 'critical' ? 'text-red-600 font-medium' :
                  priority === 'high' ? 'text-orange-600' :
                  priority === 'normal' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {priority}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Display Settings
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toast Position
              </label>
              <select
                value={localSettings.display.position}
                onChange={(e) => updateSetting('display.position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {positions.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Visible Toasts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={localSettings.display.maxVisible}
                onChange={(e) => updateSetting('display.maxVisible', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-hide Duration (ms)
              </label>
              <input
                type="number"
                min="1000"
                max="30000"
                step="1000"
                value={localSettings.display.duration}
                onChange={(e) => updateSetting('display.duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.display.sticky}
                  onChange={(e) => updateSetting('display.sticky', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Sticky notifications (don't auto-hide)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Advanced Settings
          </h2>
          
          <div className="space-y-6">
            {/* Quiet Hours */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.quietHours.enabled}
                    onChange={(e) => updateSetting('quietHours.enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="font-medium text-gray-700">Quiet Hours</span>
              </div>
              
              {localSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-8">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start</label>
                    <input
                      type="time"
                      value={localSettings.quietHours.start}
                      onChange={(e) => updateSetting('quietHours.start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End</label>
                    <input
                      type="time"
                      value={localSettings.quietHours.end}
                      onChange={(e) => updateSetting('quietHours.end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Auto Read */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoRead.enabled}
                    onChange={(e) => updateSetting('autoRead.enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="font-medium text-gray-700">Auto-mark as read</span>
              </div>
              
              {localSettings.autoRead.enabled && (
                <div className="ml-8">
                  <label className="block text-sm text-gray-600 mb-1">
                    Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.autoRead.delay}
                    onChange={(e) => updateSetting('autoRead.delay', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}