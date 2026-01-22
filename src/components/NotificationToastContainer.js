import React from 'react';
import NotificationToast from './NotificationToast';

export default function NotificationToastContainer({ 
  notifications, 
  onRemove, 
  onAction 
}) {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              notification={{
                ...notification,
                index, // For stacking positioning
              }}
              onRemove={onRemove}
              onAction={onAction}
            />
          </div>
        ))}
      </div>
    </div>
  );
}