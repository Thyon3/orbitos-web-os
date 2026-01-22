import mongoose from 'mongoose';

const KeyboardShortcutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  shortcutId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['system', 'navigation', 'editing', 'apps', 'window', 'custom'],
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  keys: {
    type: [String], // Array of keys like ['Ctrl', 'Shift', 'S']
    required: true,
  },
  keyCombination: {
    type: String, // Human-readable like "Ctrl+Shift+S"
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  appId: {
    type: String, // For app-specific shortcuts
    default: null,
  },
  metadata: {
    platform: {
      type: String,
      enum: ['windows', 'mac', 'linux', 'all'],
      default: 'all',
    },
    scope: {
      type: String,
      enum: ['global', 'app', 'window'],
      default: 'global',
    },
  },
  lastUsed: {
    type: Date,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for user and shortcut lookup
KeyboardShortcutSchema.index({ user: 1, shortcutId: 1 }, { unique: true });
KeyboardShortcutSchema.index({ user: 1, category: 1 });
KeyboardShortcutSchema.index({ user: 1, keyCombination: 1 });

// Update timestamp on save
KeyboardShortcutSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.KeyboardShortcut ||
  mongoose.model('KeyboardShortcut', KeyboardShortcutSchema);
