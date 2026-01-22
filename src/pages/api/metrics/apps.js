import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SystemMetrics from '@/models/SystemMetrics';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      const { period = 'week' } = req.query;
      
      let hours;
      switch (period) {
        case 'day': hours = 24; break;
        case 'week': hours = 24 * 7; break;
        case 'month': hours = 24 * 30; break;
        default: hours = 24 * 7;
      }

      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      // Get app usage analytics
      const metrics = await SystemMetrics.aggregate([
        {
          $match: {
            user: user.id,
            timestamp: { $gte: startTime }
          }
        },
        {
          $unwind: { 
            path: '$applications.mostUsedApps',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$applications.mostUsedApps.appId',
            appName: { $first: '$applications.mostUsedApps.name' },
            totalUsage: { $sum: '$applications.mostUsedApps.usage' },
            totalSessions: { $sum: '$applications.mostUsedApps.sessions' },
            lastUsed: { $max: '$applications.mostUsedApps.lastUsed' },
            avgSessionTime: { $avg: '$applications.averageSessionTime' },
            dataPoints: { $sum: 1 }
          }
        },
        {
          $sort: { totalUsage: -1 }
        },
        {
          $limit: 20
        }
      ]);

      // Get app performance data
      const performanceMetrics = await SystemMetrics.aggregate([
        {
          $match: {
            user: user.id,
            timestamp: { $gte: startTime }
          }
        },
        {
          $unwind: { 
            path: '$applications.appPerformance',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$applications.appPerformance.appId',
            appName: { $first: '$applications.appPerformance.name' },
            avgLoadTime: { $avg: '$applications.appPerformance.loadTime' },
            avgMemoryUsage: { $avg: '$applications.appPerformance.memoryUsage' },
            totalErrors: { $sum: '$applications.appPerformance.errors' },
            dataPoints: { $sum: 1 }
          }
        },
        {
          $sort: { avgLoadTime: 1 }
        }
      ]);

      // Get overall app statistics
      const overallStats = await SystemMetrics.aggregate([
        {
          $match: {
            user: user.id,
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            avgActiveApps: { $avg: '$applications.activeApps' },
            avgTotalSessions: { $avg: '$applications.totalSessions' },
            avgSessionTime: { $avg: '$applications.averageSessionTime' },
            maxActiveApps: { $max: '$applications.activeApps' },
            totalDataPoints: { $sum: 1 }
          }
        }
      ]);

      return res.status(200).json({
        usage: metrics.filter(m => m._id), // Filter out null app IDs
        performance: performanceMetrics.filter(m => m._id),
        stats: overallStats[0] || {
          avgActiveApps: 0,
          avgTotalSessions: 0,
          avgSessionTime: 0,
          maxActiveApps: 0,
          totalDataPoints: 0
        },
        period,
      });
    } else if (req.method === 'POST') {
      // Record app usage metrics
      const { appId, appName, action, metadata = {} } = req.body;

      if (!appId || !appName || !action) {
        return res.status(400).json({ 
          error: 'appId, appName, and action are required' 
        });
      }

      // Get or create today's metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let metrics = await SystemMetrics.findOne({
        user: user.id,
        timestamp: { $gte: today }
      }).sort({ timestamp: -1 });

      if (!metrics) {
        // Create new metrics entry for today
        metrics = new SystemMetrics({
          user: user.id,
          applications: {
            activeApps: 0,
            totalSessions: 0,
            averageSessionTime: 0,
            mostUsedApps: [],
            appPerformance: [],
          }
        });
      }

      // Update app usage based on action
      switch (action) {
        case 'open':
          updateAppUsage(metrics, appId, appName, 'open', metadata);
          break;
        case 'close':
          updateAppUsage(metrics, appId, appName, 'close', metadata);
          break;
        case 'performance':
          updateAppPerformance(metrics, appId, appName, metadata);
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      await metrics.save();

      return res.status(200).json({
        message: 'App metrics updated successfully',
        timestamp: metrics.timestamp,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('App metrics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function updateAppUsage(metrics, appId, appName, action, metadata) {
  const apps = metrics.applications.mostUsedApps;
  let app = apps.find(a => a.appId === appId);

  if (!app) {
    app = {
      appId,
      name: appName,
      usage: 0,
      sessions: 0,
      lastUsed: new Date(),
    };
    apps.push(app);
  }

  if (action === 'open') {
    app.sessions += 1;
    app.lastUsed = new Date();
    metrics.applications.activeApps += 1;
    metrics.applications.totalSessions += 1;
  } else if (action === 'close') {
    if (metadata.sessionDuration) {
      app.usage += metadata.sessionDuration; // minutes
      
      // Update average session time
      const totalUsage = apps.reduce((sum, a) => sum + a.usage, 0);
      const totalSessions = apps.reduce((sum, a) => sum + a.sessions, 0);
      metrics.applications.averageSessionTime = totalSessions > 0 ? totalUsage / totalSessions : 0;
    }
    metrics.applications.activeApps = Math.max(0, metrics.applications.activeApps - 1);
  }
}

function updateAppPerformance(metrics, appId, appName, metadata) {
  const performance = metrics.applications.appPerformance;
  let app = performance.find(a => a.appId === appId);

  if (!app) {
    app = {
      appId,
      name: appName,
      loadTime: 0,
      memoryUsage: 0,
      errors: 0,
    };
    performance.push(app);
  }

  if (metadata.loadTime !== undefined) {
    app.loadTime = metadata.loadTime;
  }
  
  if (metadata.memoryUsage !== undefined) {
    app.memoryUsage = metadata.memoryUsage;
  }
  
  if (metadata.errorOccurred) {
    app.errors += 1;
  }
}