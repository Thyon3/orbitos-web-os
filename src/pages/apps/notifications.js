import React, { useState, useEffect, useCallback } from 'react';
import NotificationCenter from '@/components/NotificationCenter';
import NotificationSettings from '@/components/NotificationSettings';
import { Settings, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('center');
  const [notificationSettings, setNotificationSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Load notification settings from user preferences
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/users/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences?.notificationSettings) {
          setNotificationSettings(data.preferences.notificationSettings);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (newSettings) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationSettings: newSettings,
        }),
      });

      if (response.ok) {
        setNotificationSettings(newSettings);
        console.log('Notification settings saved:', newSettings);
      } else {
        console.error('Failed to save notification settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    const defaultSettings = {
      enabled: true,
      sound: true,
      desktop: true,
      email: false,
      categories: {
        system: true,
        app: true,
        security: true,
        update: true,
        social: true,
        task: true,
        reminder: true,
        custom: true,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
      },
    };

    setIsSaving(true);
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationSettings: defaultSettings,
        }),
      });

      if (response.ok) {
        setNotificationSettings(defaultSettings);
        console.log('Notification settings reset to defaults');
      } else {
        console.error('Failed to reset notification settings');
      }
    } catch (error) {
      console.error('Error resetting notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('center')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'center'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
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
      <div className="flex-1 overflow-hidden">
        {activeTab === 'center' ? (
          <NotificationCenter />
        ) : (
          <div className="h-full overflow-auto">
            <NotificationSettings
              settings={notificationSettings}
              onSave={handleSaveSettings}
              onReset={handleResetSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
}