import mongoose from 'mongoose';

const ClipboardItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['text', 'code', 'image', 'link', 'file'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  preview: {
    type: String,
    default: '',
  },
  language: {
    type: String, // For code snippets (e.g., 'javascript', 'python')
    default: null,
  },
  metadata: {
    fileName: { type: String },
    fileType: { type: String },
    imageUrl: { type: String },
    linkTitle: { type: String },
    linkUrl: { type: String },
    size: { type: Number }, // Size in bytes
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  copiedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
});

// Index for efficient queries
ClipboardItemSchema.index({ user: 1, copiedAt: -1 });
ClipboardItemSchema.index({ user: 1, isPinned: 1, copiedAt: -1 });

// Auto-delete old items after 30 days (unless pinned)
ClipboardItemSchema.index(
  { copiedAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
    partialFilterExpression: { isPinned: false },
  },
);

export default mongoose.models.ClipboardItem ||
  mongoose.model('ClipboardItem', ClipboardItemSchema);
