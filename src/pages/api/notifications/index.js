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
      // Get notifications with filtering and pagination
      const { 
        status, 
        type, 
        category, 
        priority,
        limit = 50,
        offset = 0,
        includeRead = 'true'
      } = req.query;

      const query = { user: user.id };

      // Apply filters
      if (status) {
        query.status = status;
      }
      if (type) {
        query.type = type;
      }
      if (category) {
        query.category = category;
      }
      if (priority) {
        query.priority = priority;
      }
      if (includeRead === 'false') {
        query.isRead = false;
      }

      // Get notifications
      const notifications = await Notification.find(query)
        .sort({ priority: -1, createdAt: -1 }) // High priority first, then newest
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean();

      // Get counts
      const unreadCount = await Notification.countDocuments({
        user: user.id,
        isRead: false,
      });

      const totalCount = await Notification.countDocuments({
        user: user.id,
      });

      return res.status(200).json({
        notifications,
        unreadCount,
        totalCount,
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      });
    } else if (req.method === 'POST') {
      // Create new notification
      const {
        title,
        message,
        type = 'info',
        category = 'system',
        priority = 'normal',
        icon,
        image,
        actions = [],
        metadata = {},
        isPersistent = false,
        isSticky = false,
        scheduledFor,
        expiresAt,
      } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          error: 'Title and message are required',
        });
      }

      // Validate enums
      const validTypes = ['info', 'success', 'warning', 'error', 'system'];
      const validCategories = ['system', 'app', 'security', 'update', 'social', 'task', 'reminder', 'custom'];
      const validPriorities = ['low', 'normal', 'high', 'critical'];

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        });
      }

      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        });
      }

      const notification = new Notification({
        user: user.id,
        title,
        message,
        type,
        category,
        priority,
        icon,
        image,
        actions,
        metadata,
        isPersistent,
        isSticky,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      await notification.save();

      return res.status(201).json({
        message: 'Notification created successfully',
        notification,
      });
    } else if (req.method === 'PATCH') {
      // Bulk update notifications (e.g., mark all as read)
      const { action, ids, filters } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Action is required' });
      }

      let query = { user: user.id };

      // Apply filters for bulk operations
      if (ids && ids.length > 0) {
        query._id = { $in: ids };
      } else if (filters) {
        if (filters.status) query.status = filters.status;
        if (filters.type) query.type = filters.type;
        if (filters.category) query.category = filters.category;
      }

      let updateData = {};

      switch (action) {
        case 'markAllRead':
          updateData = { isRead: true, status: 'read' };
          break;
        case 'markAllUnread':
          updateData = { isRead: false, status: 'unread' };
          break;
        case 'dismissAll':
          updateData = { isDismissed: true, status: 'dismissed' };
          break;
        case 'archiveAll':
          updateData = { status: 'archived' };
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      const result = await Notification.updateMany(query, updateData);

      return res.status(200).json({
        message: `Bulk ${action} completed`,
        modifiedCount: result.modifiedCount,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}