import React, { useState } from 'react';
import NotificationCenter from '@/components/NotificationCenter';
import NotificationSettings from '@/components/NotificationSettings';
import { Settings, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('center');
  const [notificationSettings, setNotificationSettings] = useState({});

  const handleSaveSettings = (newSettings) => {
    setNotificationSettings(newSettings);
    // TODO: Save to user preferences API
    console.log('Notification settings saved:', newSettings);
  };

  const handleResetSettings = () => {
    setNotificationSettings({});
    // TODO: Reset to default settings
    console.log('Notification settings reset');
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