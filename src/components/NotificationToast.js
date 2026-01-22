import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Settings } from 'lucide-react';

export default function NotificationToast({ 
  notification, 
  onRemove, 
  onAction 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-remove timer (if duration > 0)
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Match animation duration
  };

  const handleActionClick = (action) => {
    if (onAction) {
      onAction(notification.id, action);
    }
    handleClose();
  };

  const getTypeConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-500',
          titleColor: 'text-green-900',
          textColor: 'text-green-700',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-900',
          textColor: 'text-yellow-700',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-900',
          textColor: 'text-red-700',
        };
      case 'system':
        return {
          icon: Settings,
          bgColor: 'bg-purple-50 border-purple-200',
          iconColor: 'text-purple-500',
          titleColor: 'text-purple-900',
          textColor: 'text-purple-700',
        };
      default: // info
        return {
          icon: Info,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-900',
          textColor: 'text-blue-700',
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`
        fixed top-4 right-4 z-[9999] w-96 max-w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : isLeaving 
            ? 'translate-x-full opacity-0'
            : 'translate-x-full opacity-0'
        }
      `}
      style={{
        transform: `translateX(${isVisible && !isLeaving ? '0' : '100%'}) translateY(${notification.index * 80}px)`,
      }}
    >
      <div className={`
        border rounded-lg shadow-lg backdrop-blur-sm
        ${config.bgColor}
        p-4
      `}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {notification.icon ? (
              <span className="text-2xl">{notification.icon}</span>
            ) : (
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                {notification.title}
              </h4>
            )}
            <p className={`text-sm ${config.textColor}`}>
              {notification.message}
            </p>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {notification.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded transition-colors
                      ${action.style === 'primary' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                        action.style === 'success' ? 'bg-green-500 text-white hover:bg-green-600' :
                        action.style === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' :
                        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Progress Bar (for timed notifications) */}
            {notification.duration && notification.duration > 0 && (
              <div className="mt-3">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      notification.type === 'error' ? 'bg-red-400' :
                      notification.type === 'warning' ? 'bg-yellow-400' :
                      notification.type === 'success' ? 'bg-green-400' :
                      'bg-blue-400'
                    } transition-all duration-100 ease-linear`}
                    style={{
                      animation: `shrink ${notification.duration}ms linear`,
                      transformOrigin: 'left',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
}