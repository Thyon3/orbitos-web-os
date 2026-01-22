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
      const { 
        hours = 24, 
        type = 'latest',
        limit = 100 
      } = req.query;

      if (type === 'latest') {
        // Get latest metrics
        const metrics = await SystemMetrics.getLatestMetrics(user.id);
        return res.status(200).json({ metrics });
      } else if (type === 'trend') {
        // Get metrics trend
        const trend = await SystemMetrics.getMetricsTrend(user.id, parseInt(hours));
        return res.status(200).json({ trend });
      } else if (type === 'average') {
        // Get average metrics
        const [average] = await SystemMetrics.getAverageMetrics(user.id, parseInt(hours));
        return res.status(200).json({ average });
      }

      return res.status(400).json({ error: 'Invalid type parameter' });
    } else if (req.method === 'POST') {
      // Record new metrics
      const metricsData = req.body;

      // Validate required fields
      if (!metricsData) {
        return res.status(400).json({ error: 'Metrics data is required' });
      }

      // Add calculated fields
      const enhancedData = {
        ...metricsData,
        metadata: {
          ...metricsData.metadata,
          timestamp: new Date(),
          userAgent: req.headers['user-agent'],
        }
      };

      const metrics = await SystemMetrics.recordMetrics(user.id, enhancedData);
      
      // Calculate health score
      const healthScore = metrics.calculateHealthScore();
      await metrics.save();

      return res.status(201).json({
        message: 'Metrics recorded successfully',
        metrics: {
          id: metrics._id,
          healthScore,
          timestamp: metrics.timestamp,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Metrics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}