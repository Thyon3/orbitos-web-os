import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'system'],
    default: 'info',
  },
  category: {
    type: String,
    enum: ['system', 'app', 'security', 'update', 'social', 'task', 'reminder', 'custom'],
    default: 'system',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal',
  },
  icon: {
    type: String,
    default: null, // Emoji or icon identifier
  },
  image: {
    type: String,
    default: null, // URL to image
  },
  actions: [
    {
      id: { type: String, required: true },
      label: { type: String, required: true },
      action: { type: String, required: true }, // Function or URL to execute
      style: {
        type: String,
        enum: ['primary', 'secondary', 'success', 'danger'],
        default: 'primary',
      },
    },
  ],
  metadata: {
    appId: { type: String }, // Source app
    sourceId: { type: String }, // Reference to source object
    url: { type: String }, // URL to navigate to
    data: { type: mongoose.Schema.Types.Mixed }, // Additional data
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'dismissed', 'archived'],
    default: 'unread',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isDismissed: {
    type: Boolean,
    default: false,
  },
  isPersistent: {
    type: Boolean,
    default: false, // Persistent notifications stay until dismissed
  },
  isSticky: {
    type: Boolean,
    default: false, // Sticky notifications don't auto-hide
  },
  scheduledFor: {
    type: Date,
    default: null, // For future notifications
  },
  expiresAt: {
    type: Date,
    default: null, // When notification expires
  },
  readAt: {
    type: Date,
    default: null,
  },
  dismissedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
NotificationSchema.index({ user: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, category: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, priority: 1, createdAt: -1 });
NotificationSchema.index({ scheduledFor: 1 }); // For scheduled notifications
NotificationSchema.index({ expiresAt: 1 }); // For cleanup

// Auto-delete expired notifications
NotificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Update timestamp on save
NotificationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  // Update read/dismissed timestamps
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  if (this.isDismissed && !this.dismissedAt) {
    this.dismissedAt = new Date();
  }
  
  next();
});

// Virtual for age calculation
NotificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for formatted time
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

export default mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);