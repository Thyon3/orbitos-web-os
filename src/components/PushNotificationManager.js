import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { usePWA } from '@/hooks/usePWA';

const PushNotificationManager = () => {
  const { theme } = useTheme();
  const { 
    requestNotificationPermission, 
    showNotification, 
    subscribeToPush,
    unsubscribeFromPush 
  } = usePWA();
  
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState({
    system: true,
    apps: true,
    messages: true,
    files: true,
    security: true,
    updates: true
  });

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request permission
  const requestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    
    if (result === 'granted') {
      // Subscribe to push notifications
      const sub = await subscribeToPush();
      setSubscription(sub);
    }
  };

  // Send test notification
  const sendTestNotification = () => {
    showNotification('Test Notification', {
      body: 'This is a test notification from OrbitOS',
      icon: '/icons/icon-192x192.png',
      tag: 'test',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open OrbitOS'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  };

  // Toggle notification type
  const toggleNotificationType = (type) => {
    setNotificationTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Unsubscribe from push
  const handleUnsubscribe = async () => {
    await unsubscribeFromPush();
    setSubscription(null);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">Push Notifications</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-3 py-1 rounded ${theme.app.button}`}
        >
          {showSettings ? 'Done' : 'Settings'}
        </button>
      </div>

      {/* Permission Status */}
      <div className="p-4">
        <div className={`p-4 rounded-lg border ${theme.app.border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                permission === 'granted' ? 'bg-green-500' :
                permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="font-medium">
                {permission === 'granted' ? 'Notifications Enabled' :
                 permission === 'denied' ? 'Notifications Blocked' : 'Notifications Not Requested'}
              </span>
            </div>
            
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Enable Notifications
              </button>
            )}
          </div>
          
          {permission === 'granted' && (
            <div className="text-sm text-gray-600">
              Push notifications are enabled. You'll receive alerts for system events, app updates, and important messages.
            </div>
          )}
          
          {permission === 'denied' && (
            <div className="text-sm text-red-600">
              Notifications are blocked in your browser settings. You'll need to enable them in your browser preferences.
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className={`p-4 rounded-lg border ${theme.app.border}`}>
              <h3 className="font-semibold mb-4">Notification Types</h3>
              <div className="space-y-3">
                {Object.entries(notificationTypes).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium capitalize">{type}</div>
                      <div className="text-sm text-gray-500">
                        {type === 'system' && 'System updates and maintenance'}
                        {type === 'apps' && 'App notifications and updates'}
                        {type === 'messages' && 'Chat and messaging alerts'}
                        {type === 'files' && 'File operations and sharing'}
                        {type === 'security' && 'Security alerts and login attempts'}
                        {type === 'updates' && 'Software updates and patches'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotificationType(type)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        enabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Section */}
      {permission === 'granted' && (
        <div className="p-4">
          <div className={`p-4 rounded-lg border ${theme.app.border}`}>
            <h3 className="font-semibold mb-3">Test Notifications</h3>
            <div className="flex space-x-2">
              <button
                onClick={sendTestNotification}
                className={`px-4 py-2 rounded ${theme.app.button}`}
              >
                Send Test
              </button>
              {subscription && (
                <button
                  onClick={handleUnsubscribe}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Unsubscribe
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="flex-1 p-4">
        <div className={`p-4 rounded-lg border ${theme.app.border} h-full`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className={`px-3 py-1 rounded text-sm ${theme.app.button}`}
              >
                Clear All
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${theme.app.bg} border ${theme.app.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600">{notification.body}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PushNotificationManager;
