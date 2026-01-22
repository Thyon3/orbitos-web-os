/**
 * Utility functions for notifications
 */

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(quietHours) {
  if (!quietHours || !quietHours.enabled) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const { start, end } = quietHours;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  }
  
  // Handle same-day quiet hours (e.g., 12:00 to 14:00)
  return currentTime >= start && currentTime <= end;
}

/**
 * Generate notification ID
 */
export function generateNotificationId() {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format notification for display
 */
export function formatNotification(notification) {
  return {
    ...notification,
    id: notification.id || generateNotificationId(),
    timestamp: notification.createdAt || new Date().toISOString(),
    formattedTime: formatRelativeTime(notification.createdAt || new Date()),
  };
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  return 'Just now';
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type, category) {
  if (type === 'system') {
    return '⚙️';
  }
  
  if (category) {
    const categoryIcons = {
      security: '🔒',
      update: '🔄',
      social: '👥',
      task: '✅',
      reminder: '⏰',
      app: '📱',
      custom: '⭐',
    };
    
    if (categoryIcons[category]) {
      return categoryIcons[category];
    }
  }

  const typeIcons = {
    info: '💬',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    system: '⚙️',
  };

  return typeIcons[type] || '📄';
}

/**
 * Validate notification data
 */
export function validateNotification(notification) {
  const errors = [];

  if (!notification.title || notification.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!notification.message || notification.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (notification.title && notification.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  if (notification.message && notification.message.length > 1000) {
    errors.push('Message must be 1000 characters or less');
  }

  const validTypes = ['info', 'success', 'warning', 'error', 'system'];
  if (notification.type && !validTypes.includes(notification.type)) {
    errors.push(`Type must be one of: ${validTypes.join(', ')}`);
  }

  const validCategories = ['system', 'app', 'security', 'update', 'social', 'task', 'reminder', 'custom'];
  if (notification.category && !validCategories.includes(notification.category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  const validPriorities = ['low', 'normal', 'high', 'critical'];
  if (notification.priority && !validPriorities.includes(notification.priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create notification object with defaults
 */
export function createNotificationData(options) {
  return {
    id: generateNotificationId(),
    title: options.title,
    message: options.message,
    type: options.type || 'info',
    category: options.category || 'system',
    priority: options.priority || 'normal',
    icon: options.icon || getNotificationIcon(options.type, options.category),
    image: options.image,
    actions: options.actions || [],
    metadata: options.metadata || {},
    isPersistent: options.isPersistent !== false, // Default to true
    isSticky: options.isSticky || false,
    scheduledFor: options.scheduledFor,
    expiresAt: options.expiresAt,
    ...options,
  };
}

/**
 * Filter notifications based on settings
 */
export function shouldShowNotification(notification, settings) {
  if (!settings.enabled) return false;

  // Check quiet hours
  if (isQuietHours(settings.quietHours)) {
    return notification.priority === 'critical';
  }

  // Check category filter
  if (settings.categories && !settings.categories[notification.category]) {
    return false;
  }

  // Check priority filter
  if (settings.priorities && !settings.priorities[notification.priority]) {
    return false;
  }

  return true;
}