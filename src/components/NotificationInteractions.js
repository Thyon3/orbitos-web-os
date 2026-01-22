import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

export default function NotificationInteractions({ 
  notification, 
  onInteraction,
  showSocial = false 
}) {
  const [isLiked, setIsLiked] = useState(notification.metadata?.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(notification.metadata?.isBookmarked || false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    if (onInteraction) {
      onInteraction(notification._id, 'like', { isLiked: newLikedState });
    }
  };

  const handleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    if (onInteraction) {
      onInteraction(notification._id, 'bookmark', { isBookmarked: newBookmarkState });
    }
  };

  const handleShare = () => {
    const shareData = {
      title: notification.title,
      text: notification.message,
      url: notification.metadata?.url || window.location.href,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const textToCopy = `${notification.title}\n${notification.message}${
        shareData.url ? `\n${shareData.url}` : ''
      }`;
      
      navigator.clipboard?.writeText(textToCopy).then(() => {
        // Show toast notification that it was copied
        if (window.showNotification) {
          window.showNotification('Copied to clipboard', 'success', 2000);
        }
      }).catch(console.error);
    }

    if (onInteraction) {
      onInteraction(notification._id, 'share', shareData);
    }
  };

  const handleReply = () => {
    // This would open a reply dialog or interface
    if (onInteraction) {
      onInteraction(notification._id, 'reply', {});
    }
  };

  if (!showSocial && !notification.actions?.length) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
      {/* Social Interactions */}
      {showSocial && (
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-lg transition-colors ${
              isLiked 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {notification.category === 'social' && (
            <button
              onClick={handleReply}
              className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-500 rounded-lg transition-colors"
              title="Reply"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-green-500 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked 
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-yellow-500'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      {/* More Actions */}
      <div className="relative">
        <button
          onClick={() => setShowMoreActions(!showMoreActions)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMoreActions && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  if (onInteraction) {
                    onInteraction(notification._id, 'copyText', {
                      text: `${notification.title}\n${notification.message}`
                    });
                  }
                  navigator.clipboard?.writeText(`${notification.title}\n${notification.message}`);
                  setShowMoreActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Copy text
              </button>
              
              {notification.metadata?.url && (
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(notification.metadata.url);
                    setShowMoreActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy link
                </button>
              )}
              
              <button
                onClick={() => {
                  if (onInteraction) {
                    onInteraction(notification._id, 'reportSpam', {});
                  }
                  setShowMoreActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Report as spam
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside handler for more actions */}
      {showMoreActions && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowMoreActions(false)}
        />
      )}
    </div>
  );
}