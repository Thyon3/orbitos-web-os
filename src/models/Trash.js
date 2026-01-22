import mongoose from 'mongoose';

const TrashSchema = new mongoose.Schema({
  originalFileId: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, default: '' },
  fileType: { type: String, default: 'file' }, // 'file', 'folder', 'document'
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalPath: { type: String, default: '/' }, // Path where file was originally located
  deletedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 }, // 30 days
  size: { type: Number, default: 0 }, // File size in bytes
  metadata: {
    lastModified: { type: Date },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: {
          type: String,
          enum: ['view', 'comment', 'edit'],
          default: 'view',
        },
      },
    ],
    isPublic: { type: Boolean, default: false },
  },
});

// Index for automatic cleanup of expired items
TrashSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for user queries
TrashSchema.index({ owner: 1, deletedAt: -1 });

export default mongoose.models.Trash || mongoose.model('Trash', TrashSchema);
