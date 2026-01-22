import mongoose from 'mongoose';

const SystemMetricsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // System Performance Metrics
  system: {
    cpuUsage: { type: Number, min: 0, max: 100 }, // Percentage
    memoryUsage: {
      used: { type: Number }, // MB
      total: { type: Number }, // MB
      percentage: { type: Number, min: 0, max: 100 },
    },
    diskUsage: {
      used: { type: Number }, // MB
      total: { type: Number }, // MB
      percentage: { type: Number, min: 0, max: 100 },
    },
    networkActivity: {
      upload: { type: Number, default: 0 }, // KB/s
      download: { type: Number, default: 0 }, // KB/s
    },
    loadAverage: [Number], // 1, 5, 15 minute averages
  },
  
  // Browser Performance Metrics
  browser: {
    heapUsed: { type: Number }, // MB
    heapTotal: { type: Number }, // MB
    connectionType: { type: String }, // 4g, wifi, ethernet, etc.
    effectiveType: { type: String }, // slow-2g, 2g, 3g, 4g
    downlink: { type: Number }, // Mbps
    rtt: { type: Number }, // ms
  },
  
  // Application Usage Metrics
  applications: {
    activeApps: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    averageSessionTime: { type: Number, default: 0 }, // minutes
    mostUsedApps: [{
      appId: String,
      name: String,
      usage: Number, // minutes
      sessions: Number,
      lastUsed: Date,
    }],
    appPerformance: [{
      appId: String,
      name: String,
      loadTime: Number, // ms
      memoryUsage: Number, // MB
      errors: Number,
    }],
  },
  
  // User Activity Metrics
  activity: {
    sessionDuration: { type: Number, default: 0 }, // minutes
    clicksPerMinute: { type: Number, default: 0 },
    keystrokesPerMinute: { type: Number, default: 0 },
    idleTime: { type: Number, default: 0 }, // minutes
    activeTime: { type: Number, default: 0 }, // minutes
    screenshotsTaken: { type: Number, default: 0 },
    filesCreated: { type: Number, default: 0 },
    filesModified: { type: Number, default: 0 },
  },
  
  // Resource Usage
  resources: {
    notifications: {
      sent: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      dismissed: { type: Number, default: 0 },
    },
    clipboard: {
      itemsStored: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 }, // MB
      mostUsedType: String,
    },
    shortcuts: {
      totalExecuted: { type: Number, default: 0 },
      mostUsed: [{
        shortcutId: String,
        name: String,
        count: Number,
      }],
    },
    wallpapers: {
      totalWallpapers: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 }, // MB
      slideshowChanges: { type: Number, default: 0 },
    },
  },
  
  // System Health Indicators
  health: {
    score: { type: Number, min: 0, max: 100, default: 100 },
    issues: [{
      type: {
        type: String,
        enum: ['performance', 'memory', 'storage', 'network', 'security', 'compatibility'],
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      message: String,
      suggestion: String,
      timestamp: { type: Date, default: Date.now },
    }],
    uptime: { type: Number, default: 0 }, // minutes
    crashCount: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 }, // errors per hour
  },
  
  // Performance Trends
  trends: {
    performanceScore: { type: Number, min: 0, max: 100 },
    responsiveness: { type: Number, min: 0, max: 100 },
    stability: { type: Number, min: 0, max: 100 },
    efficiency: { type: Number, min: 0, max: 100 },
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    screenResolution: String,
    colorDepth: Number,
    timezone: String,
    language: String,
    platform: String,
    version: String,
  },
});

// Indexes for efficient queries
SystemMetricsSchema.index({ user: 1, timestamp: -1 });
SystemMetricsSchema.index({ timestamp: -1 });
SystemMetricsSchema.index({ 'health.score': 1 });
SystemMetricsSchema.index({ user: 1, 'health.issues.severity': 1 });

// Auto-delete old metrics (keep 30 days)
SystemMetricsSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

// Static methods for data collection
SystemMetricsSchema.statics.recordMetrics = async function(userId, metricsData) {
  const metrics = new this({
    user: userId,
    ...metricsData,
  });
  
  return await metrics.save();
};

SystemMetricsSchema.statics.getLatestMetrics = function(userId) {
  return this.findOne({ user: userId })
    .sort({ timestamp: -1 })
    .lean();
};

SystemMetricsSchema.statics.getMetricsTrend = function(userId, hours = 24) {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    user: userId,
    timestamp: { $gte: startTime }
  })
  .sort({ timestamp: 1 })
  .lean();
};

SystemMetricsSchema.statics.getAverageMetrics = function(userId, hours = 24) {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startTime }
      }
    },
    {
      $group: {
        _id: null,
        avgCpuUsage: { $avg: '$system.cpuUsage' },
        avgMemoryUsage: { $avg: '$system.memoryUsage.percentage' },
        avgDiskUsage: { $avg: '$system.diskUsage.percentage' },
        avgPerformanceScore: { $avg: '$trends.performanceScore' },
        avgHealthScore: { $avg: '$health.score' },
        totalUptime: { $sum: '$health.uptime' },
        totalErrors: { $sum: '$health.crashCount' },
        totalSessions: { $avg: '$applications.totalSessions' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance methods
SystemMetricsSchema.methods.calculateHealthScore = function() {
  let score = 100;
  
  // Deduct points for high resource usage
  if (this.system?.cpuUsage > 80) score -= 15;
  else if (this.system?.cpuUsage > 60) score -= 8;
  
  if (this.system?.memoryUsage?.percentage > 85) score -= 15;
  else if (this.system?.memoryUsage?.percentage > 70) score -= 8;
  
  if (this.system?.diskUsage?.percentage > 90) score -= 20;
  else if (this.system?.diskUsage?.percentage > 80) score -= 10;
  
  // Deduct points for errors and crashes
  if (this.health?.crashCount > 0) score -= this.health.crashCount * 5;
  if (this.health?.errorRate > 10) score -= 10;
  
  // Deduct points for active issues
  if (this.health?.issues?.length > 0) {
    this.health.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });
  }
  
  this.health = this.health || {};
  this.health.score = Math.max(0, Math.min(100, score));
  
  return this.health.score;
};

SystemMetricsSchema.methods.addHealthIssue = function(type, severity, message, suggestion) {
  this.health = this.health || { issues: [] };
  this.health.issues = this.health.issues || [];
  
  // Check if this issue already exists
  const existingIssue = this.health.issues.find(
    issue => issue.type === type && issue.message === message
  );
  
  if (!existingIssue) {
    this.health.issues.push({
      type,
      severity,
      message,
      suggestion,
      timestamp: new Date(),
    });
  }
};

export default mongoose.models.SystemMetrics ||
  mongoose.model('SystemMetrics', SystemMetricsSchema);