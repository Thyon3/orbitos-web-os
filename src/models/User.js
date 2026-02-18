import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  avatar: {
    type: String,
    default: null,
  },
  roles: [
    {
      type: String,
      enum: ['user', 'admin', 'editor'],
      default: 'user',
    },
  ],
  permissions: {
    canEdit: { type: Boolean, default: true },
    canShare: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 10485760 }, // 10MB
    allowedFileTypes: [{ type: String }],
  },
  preferences: {
    theme: { type: String, default: 'light' },
    wallpaper: { type: String, default: '/backgrounds/orbitos-default.jpg' },
    notifications: { type: Boolean, default: true },
  },
  installedApps: [
    {
      appId: { type: String, required: true },
      manifest: { type: Object, required: true },
      downloadUrl: { type: String, required: true },
      installedAt: { type: Date, default: Date.now },
    },
  ],
  searchHistory: [
    {
      query: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  backupCodes: [{
    code: String,
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  googleId: {
    type: String,
    default: null,
  },
  githubId: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  sessions: [{
    sessionId: String,
    deviceInfo: String,
    ipAddress: String,
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  }],
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

userSchema.methods.addSession = function (sessionId, deviceInfo, ipAddress) {
  this.sessions.push({ sessionId, deviceInfo, ipAddress });
  return this.save();
};

userSchema.methods.removeSession = function (sessionId) {
  this.sessions = this.sessions.filter(session => session.sessionId !== sessionId);
  return this.save();
};

export default mongoose.models.User || mongoose.model('User', userSchema);
