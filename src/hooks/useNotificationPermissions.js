import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing browser notification permissions
 */
export function useNotificationPermissions() {
  const [permission, setPermission] = useState('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    } else {
      setSupported(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }, [supported]);

  const showBrowserNotification = useCallback(async (title, options = {}) => {
    if (!supported) {
      throw new Error('Notifications are not supported');
    }

    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const notification = new Notification(title, {
        body: options.message || options.body,
        icon: options.icon || '/icons/notification-icon.png',
        badge: options.badge || '/icons/notification-badge.png',
        image: options.image,
        tag: options.tag || 'orbitos-notification',
        silent: options.silent || false,
        requireInteraction: options.requireInteraction || false,
        data: options.data,
        actions: options.actions,
        ...options,
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        
        // Focus the window
        window.focus();
        
        // Close the notification
        notification.close();
        
        // Execute custom click handler
        if (options.onClick) {
          options.onClick(event);
        }
      };

      // Handle notification close
      notification.onclose = (event) => {
        if (options.onClose) {
          options.onClose(event);
        }
      };

      // Handle notification error
      notification.onerror = (error) => {
        console.error('Browser notification error:', error);
        if (options.onError) {
          options.onError(error);
        }
      };

      // Auto-close after specified duration
      if (options.duration && options.duration > 0) {
        setTimeout(() => {
          notification.close();
        }, options.duration);
      }

      return notification;
    } catch (error) {
      console.error('Error showing browser notification:', error);
      throw error;
    }
  }, [supported, permission]);

  const getPermissionStatus = useCallback(() => {
    if (!supported) return 'unsupported';
    return permission;
  }, [supported, permission]);

  const isPermissionGranted = useCallback(() => {
    return supported && permission === 'granted';
  }, [supported, permission]);

  const canRequestPermission = useCallback(() => {
    return supported && permission === 'default';
  }, [supported, permission]);

  const isPermissionDenied = useCallback(() => {
    return supported && permission === 'denied';
  }, [supported, permission]);

  return {
    supported,
    permission,
    requestPermission,
    showBrowserNotification,
    getPermissionStatus,
    isPermissionGranted,
    canRequestPermission,
    isPermissionDenied,
  };
}