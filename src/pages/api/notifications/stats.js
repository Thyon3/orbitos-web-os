import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      // Get notification statistics
      const notifications = await Notification.find({ user: user.id });

      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        dismissed: notifications.filter(n => n.isDismissed).length,
        archived: notifications.filter(n => n.status === 'archived').length,
        byType: notifications.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {}),
        byCategory: notifications.reduce((acc, n) => {
          acc[n.category] = (acc[n.category] || 0) + 1;
          return acc;
        }, {}),
        byPriority: notifications.reduce((acc, n) => {
          acc[n.priority] = (acc[n.priority] || 0) + 1;
          return acc;
        }, {}),
        recent: notifications
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(n => ({
            id: n._id,
            title: n.title,
            type: n.type,
            category: n.category,
            createdAt: n.createdAt,
            isRead: n.isRead,
          })),
        oldestUnread: notifications
          .filter(n => !n.isRead)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt,
      };

      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notification stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}