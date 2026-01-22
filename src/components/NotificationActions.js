import React from 'react';
import { ExternalLink, Download, Settings, Bell, BellOff, Check, X, Archive } from 'lucide-react';

export default function NotificationActions({ 
  notification, 
  onAction, 
  onMarkAsRead, 
  onDismiss, 
  onArchive,
  compact = false 
}) {
  const handleAction = (actionId, actionData) => {
    if (onAction) {
      onAction(notification._id, actionId, actionData);
    }
  };

  const executeNotificationAction = (action) => {
    switch (action.action) {
      case 'openUrl':
        if (action.url || notification.metadata?.url) {
          window.open(action.url || notification.metadata.url, '_blank');
        }
        break;
        
      case 'openApp':
        const appId = action.appId || notification.metadata?.appId;
        if (appId && window.openApp) {
          window.openApp(appId);
        }
        break;
        
      case 'download':
        if (action.downloadUrl) {
          const link = document.createElement('a');
          link.href = action.downloadUrl;
          link.download = action.filename || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        break;
        
      case 'showModal':
        if (action.modalContent) {
          // This would need to be implemented with a modal system
          alert(action.modalContent);
        }
        break;
        
      case 'customFunction':
        if (action.functionName && window[action.functionName]) {
          window[action.functionName](action.parameters);
        }
        break;
        
      default:
        console.warn('Unknown action type:', action.action);
    }
    
    handleAction(action.id, action);
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'openUrl':
        return ExternalLink;
      case 'download':
        return Download;
      case 'openApp':
        return Settings;
      default:
        return Check;
    }
  };

  const getActionStyle = (style) => {
    const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5';
    
    switch (style) {
      case 'primary':
        return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600`;
      case 'success':
        return `${baseClasses} bg-green-500 text-white hover:bg-green-600`;
      case 'danger':
        return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
      case 'warning':
        return `${baseClasses} bg-orange-500 text-white hover:bg-orange-600`;
      default: // secondary
        return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50`;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {/* Quick Actions */}
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead?.(notification._id)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            title="Mark as read"
          >
            <Check className="w-3 h-3" />
          </button>
        )}
        
        <button
          onClick={() => onDismiss?.(notification._id)}
          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
        
        <button
          onClick={() => onArchive?.(notification._id)}
          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Archive"
        >
          <Archive className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Custom Actions */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {notification.actions.map((action) => {
            const IconComponent = getActionIcon(action.action);
            
            return (
              <button
                key={action.id}
                onClick={() => executeNotificationAction(action)}
                className={getActionStyle(action.style)}
              >
                <IconComponent className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Standard Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        {!notification.isRead ? (
          <button
            onClick={() => onMarkAsRead?.(notification._id)}
            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Mark as Read
          </button>
        ) : (
          <button
            onClick={() => onMarkAsRead?.(notification._id, false)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4" />
            Mark as Unread
          </button>
        )}
        
        <button
          onClick={() => onDismiss?.(notification._id)}
          className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <BellOff className="w-4 h-4" />
          Dismiss
        </button>
        
        <button
          onClick={() => onArchive?.(notification._id)}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Archive className="w-4 h-4" />
          Archive
        </button>
      </div>

      {/* Metadata Actions */}
      {notification.metadata?.url && (
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => window.open(notification.metadata.url, '_blank')}
            className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            Open Link
          </button>
        </div>
      )}
    </div>
  );
}