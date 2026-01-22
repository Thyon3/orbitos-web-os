import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  CheckCheck, 
  Trash2, 
  X, 
  Filter, 
  Search,
  Archive,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNotification } from '@/system/services/NotificationRegistry';

export default function NotificationCenter() {
  const {
    persistentNotifications,
    unreadCount,
    loading,
    loadNotifications,
    updateNotification,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
  } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Filter notifications
  const filteredNotifications = persistentNotifications.filter((notification) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      notification.title?.toLowerCase().includes(query) ||
      notification.message?.toLowerCase().includes(query) ||
      notification.category?.toLowerCase().includes(query);

    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || notification.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || notification.status === selectedStatus;
    const matchesUnread = !showOnlyUnread || !notification.isRead;

    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesUnread;
  });

  const handleMarkAsRead = async (notificationId, isCurrentlyRead) => {
    try {
      await updateNotification(notificationId, { isRead: !isCurrentlyRead });
    } catch (error) {
      console.error('Failed to update notification:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (confirm('Delete this notification?')) {
      try {
        await deleteNotification(notificationId);
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Clear all notifications? This action cannot be undone.')) {
      try {
        await clearAllNotifications();
      } catch (error) {
        console.error('Failed to clear notifications:', error);
      }
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: '💬',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      system: '⚙️',
    };
    return icons[type] || '📄';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      system: '⚙️',
      app: '📱',
      security: '🔒',
      update: '🔄',
      social: '👥',
      task: '✅',
      reminder: '⏰',
      custom: '⭐',
    };
    return icons[category] || '📄';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'border-gray-200 bg-gray-50',
      normal: 'border-blue-200 bg-blue-50',
      high: 'border-orange-200 bg-orange-50',
      critical: 'border-red-200 bg-red-50',
    };
    return colors[priority] || colors.normal;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading && persistentNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Notification Center
              </h1>
              <p className="text-sm text-gray-500">
                {filteredNotifications.length} notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadNotifications()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              disabled={filteredNotifications.length === 0}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="info">💬 Info</option>
                <option value="success">✅ Success</option>
                <option value="warning">⚠️ Warning</option>
                <option value="error">❌ Error</option>
                <option value="system">⚙️ System</option>
              </select>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="system">⚙️ System</option>
              <option value="app">📱 App</option>
              <option value="security">🔒 Security</option>
              <option value="update">🔄 Update</option>
              <option value="social">👥 Social</option>
              <option value="task">✅ Task</option>
              <option value="reminder">⏰ Reminder</option>
              <option value="custom">⭐ Custom</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="dismissed">Dismissed</option>
              <option value="archived">Archived</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUnread}
                onChange={(e) => setShowOnlyUnread(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Unread only</span>
            </label>

            {searchQuery && (
              <span className="text-sm text-gray-500">
                {filteredNotifications.length} result{filteredNotifications.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            {searchQuery ? (
              <>
                <Search className="w-24 h-24 mb-4" />
                <p className="text-lg">No notifications found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <BellOff className="w-24 h-24 mb-4" />
                <p className="text-lg">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  notification.isRead
                    ? 'border-gray-200 bg-white opacity-75'
                    : getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {notification.icon || getTypeIcon(notification.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        notification.type === 'error' ? 'bg-red-100 text-red-600' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        notification.type === 'success' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {notification.type}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {getCategoryIcon(notification.category)} {notification.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatTime(notification.createdAt)}</span>
                        {notification.priority !== 'normal' && (
                          <span className={`px-2 py-0.5 rounded ${
                            notification.priority === 'critical' ? 'bg-red-100 text-red-600' :
                            notification.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {notification.priority} priority
                          </span>
                        )}
                        {notification.metadata?.appId && (
                          <span>From: {notification.metadata.appId}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            notification.isRead
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                          title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {notification.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}