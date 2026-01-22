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

      // Get health trends
      const healthTrend = await SystemMetrics.find({
        user: user.id,
        timestamp: { $gte: startTime }
      })
      .select('timestamp health.score trends system.cpuUsage system.memoryUsage.percentage')
      .sort({ timestamp: 1 })
      .lean();

      // Get current health status
      const latestMetrics = await SystemMetrics.getLatestMetrics(user.id);
      
      // Get active issues
      const activeIssues = latestMetrics?.health?.issues?.filter(
        issue => Date.now() - new Date(issue.timestamp).getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
      ) || [];

      // Calculate health statistics
      const healthStats = await SystemMetrics.aggregate([
        {
          $match: {
            user: user.id,
            timestamp: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            avgHealthScore: { $avg: '$health.score' },
            minHealthScore: { $min: '$health.score' },
            maxHealthScore: { $max: '$health.score' },
            avgPerformanceScore: { $avg: '$trends.performanceScore' },
            avgResponsiveness: { $avg: '$trends.responsiveness' },
            avgStability: { $avg: '$trends.stability' },
            avgEfficiency: { $avg: '$trends.efficiency' },
            totalUptime: { $sum: '$health.uptime' },
            totalCrashes: { $sum: '$health.crashCount' },
            avgErrorRate: { $avg: '$health.errorRate' },
            dataPoints: { $sum: 1 }
          }
        }
      ]);

      // Get issue distribution
      const issueStats = await SystemMetrics.aggregate([
        {
          $match: {
            user: user.id,
            timestamp: { $gte: startTime }
          }
        },
        {
          $unwind: { 
            path: '$health.issues',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: {
              type: '$health.issues.type',
              severity: '$health.issues.severity'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.type',
            severities: {
              $push: {
                severity: '$_id.severity',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);

      // Calculate system reliability
      const reliability = calculateReliability(healthStats[0], healthTrend);

      return res.status(200).json({
        current: {
          healthScore: latestMetrics?.health?.score || 100,
          performanceScore: latestMetrics?.trends?.performanceScore || 100,
          responsiveness: latestMetrics?.trends?.responsiveness || 100,
          stability: latestMetrics?.trends?.stability || 100,
          efficiency: latestMetrics?.trends?.efficiency || 100,
          uptime: latestMetrics?.health?.uptime || 0,
          issues: activeIssues,
        },
        trends: healthTrend,
        statistics: healthStats[0] || {
          avgHealthScore: 100,
          minHealthScore: 100,
          maxHealthScore: 100,
          avgPerformanceScore: 100,
          avgResponsiveness: 100,
          avgStability: 100,
          avgEfficiency: 100,
          totalUptime: 0,
          totalCrashes: 0,
          avgErrorRate: 0,
          dataPoints: 0
        },
        issues: issueStats,
        reliability,
        period,
      });
    } else if (req.method === 'POST') {
      // Report health issue
      const { type, severity, message, suggestion } = req.body;

      if (!type || !severity || !message) {
        return res.status(400).json({ 
          error: 'type, severity, and message are required' 
        });
      }

      const validTypes = ['performance', 'memory', 'storage', 'network', 'security', 'compatibility'];
      const validSeverities = ['low', 'medium', 'high', 'critical'];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
        });
      }

      if (!validSeverities.includes(severity)) {
        return res.status(400).json({ 
          error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` 
        });
      }

      // Get or create today's metrics
      let metrics = await SystemMetrics.getLatestMetrics(user.id);
      
      if (!metrics) {
        metrics = new SystemMetrics({
          user: user.id,
          health: { issues: [], score: 100 }
        });
      } else {
        metrics = new SystemMetrics(metrics);
      }

      // Add health issue
      metrics.addHealthIssue(type, severity, message, suggestion);
      
      // Recalculate health score
      metrics.calculateHealthScore();
      
      await metrics.save();

      return res.status(200).json({
        message: 'Health issue reported successfully',
        healthScore: metrics.health.score,
        issueCount: metrics.health.issues.length,
      });
    } else if (req.method === 'DELETE') {
      // Clear resolved issues
      const { issueIds } = req.body;

      if (!issueIds || !Array.isArray(issueIds)) {
        return res.status(400).json({ error: 'issueIds array is required' });
      }

      const metrics = await SystemMetrics.getLatestMetrics(user.id);
      
      if (metrics) {
        const updatedMetrics = new SystemMetrics(metrics);
        
        // Remove specified issues
        updatedMetrics.health.issues = updatedMetrics.health.issues.filter(
          (issue, index) => !issueIds.includes(index.toString())
        );
        
        // Recalculate health score
        updatedMetrics.calculateHealthScore();
        
        await updatedMetrics.save();

        return res.status(200).json({
          message: 'Issues resolved successfully',
          healthScore: updatedMetrics.health.score,
          remainingIssues: updatedMetrics.health.issues.length,
        });
      }

      return res.status(404).json({ error: 'No metrics found' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Health API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function calculateReliability(stats, trend) {
  if (!stats || !trend || trend.length === 0) {
    return { score: 100, rating: 'Excellent' };
  }

  const { avgHealthScore, totalCrashes, avgErrorRate } = stats;
  
  let reliability = avgHealthScore;
  
  // Penalize for crashes and errors
  if (totalCrashes > 0) reliability -= totalCrashes * 5;
  if (avgErrorRate > 1) reliability -= avgErrorRate * 2;
  
  // Bonus for consistency
  const healthScores = trend.map(t => t.health?.score || 100);
  const variance = calculateVariance(healthScores);
  if (variance < 100) reliability += 5; // Bonus for stable performance
  
  const finalScore = Math.max(0, Math.min(100, reliability));
  
  let rating;
  if (finalScore >= 90) rating = 'Excellent';
  else if (finalScore >= 75) rating = 'Good';
  else if (finalScore >= 60) rating = 'Fair';
  else if (finalScore >= 40) rating = 'Poor';
  else rating = 'Critical';
  
  return { score: Math.round(finalScore), rating };
}

function calculateVariance(numbers) {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}