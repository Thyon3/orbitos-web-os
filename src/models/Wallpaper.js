import mongoose from 'mongoose';

const WallpaperSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
    default: '',
  },
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  size: {
    type: Number,
    required: true, // Size in bytes
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  format: {
    type: String,
    required: true,
    enum: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  },
  category: {
    type: String,
    enum: ['nature', 'abstract', 'minimal', 'space', 'technology', 'art', 'photography', 'patterns', 'solid', 'custom'],
    default: 'custom',
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  colors: {
    dominant: { type: String }, // Hex color
    palette: [String], // Array of hex colors
    brightness: { type: Number, min: 0, max: 100 }, // Brightness percentage
  },
  metadata: {
    fileType: { type: String },
    compression: { type: Number },
    quality: { type: Number },
    source: { type: String }, // 'upload', 'url', 'default', 'generated'
    sourceUrl: { type: String }, // Original URL if downloaded
    author: { type: String },
    license: { type: String },
  },
  settings: {
    fit: {
      type: String,
      enum: ['cover', 'contain', 'fill', 'stretch', 'center'],
      default: 'cover',
    },
    position: {
      type: String,
      enum: ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
      default: 'center',
    },
    blur: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },
    opacity: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    brightness: {
      type: Number,
      min: 0,
      max: 200,
      default: 100,
    },
    contrast: {
      type: Number,
      min: 0,
      max: 200,
      default: 100,
    },
    saturation: {
      type: Number,
      min: 0,
      max: 200,
      default: 100,
    },
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 },
  },
  collections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WallpaperCollection',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
});

// Indexes for efficient queries
WallpaperSchema.index({ user: 1, category: 1, createdAt: -1 });
WallpaperSchema.index({ user: 1, isActive: 1 });
WallpaperSchema.index({ user: 1, isFavorite: 1, createdAt: -1 });
WallpaperSchema.index({ isPublic: 1, rating: -1, createdAt: -1 });
WallpaperSchema.index({ tags: 1 });
WallpaperSchema.index({ 'colors.dominant': 1 });

// Update timestamp on save
WallpaperSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted file size
WallpaperSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for aspect ratio
WallpaperSchema.virtual('aspectRatio').get(function() {
  return this.dimensions.width / this.dimensions.height;
});

// Virtual for resolution string
WallpaperSchema.virtual('resolution').get(function() {
  return `${this.dimensions.width}x${this.dimensions.height}`;
});

// Static method to get active wallpaper for user
WallpaperSchema.statics.getActiveWallpaper = function(userId) {
  return this.findOne({ user: userId, isActive: true });
};

// Instance method to set as active
WallpaperSchema.methods.setAsActive = async function() {
  // Deactivate all other wallpapers for this user
  await this.constructor.updateMany(
    { user: this.user, _id: { $ne: this._id } },
    { $set: { isActive: false } }
  );
  
  // Set this wallpaper as active
  this.isActive = true;
  this.lastUsedAt = new Date();
  await this.save();
  
  return this;
};

export default mongoose.models.Wallpaper ||
  mongoose.model('Wallpaper', WallpaperSchema);