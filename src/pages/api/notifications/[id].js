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

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get single notification
      const notification = await Notification.findOne({
        _id: id,
        user: user.id,
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      return res.status(200).json({ notification });
    } else if (req.method === 'PATCH') {
      // Update notification
      const { isRead, isDismissed, status, actions } = req.body;

      const notification = await Notification.findOne({
        _id: id,
        user: user.id,
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Update fields
      if (isRead !== undefined) {
        notification.isRead = isRead;
        if (isRead) {
          notification.status = 'read';
        }
      }

      if (isDismissed !== undefined) {
        notification.isDismissed = isDismissed;
        if (isDismissed) {
          notification.status = 'dismissed';
        }
      }

      if (status !== undefined) {
        const validStatuses = ['unread', 'read', 'dismissed', 'archived'];
        if (validStatuses.includes(status)) {
          notification.status = status;
          
          // Update related flags
          if (status === 'read') notification.isRead = true;
          if (status === 'dismissed') notification.isDismissed = true;
          if (status === 'unread') {
            notification.isRead = false;
            notification.isDismissed = false;
          }
        }
      }

      if (actions !== undefined) {
        notification.actions = actions;
      }

      await notification.save();

      return res.status(200).json({
        message: 'Notification updated successfully',
        notification,
      });
    } else if (req.method === 'DELETE') {
      // Delete notification
      const notification = await Notification.findOneAndDelete({
        _id: id,
        user: user.id,
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      return res.status(200).json({
        message: 'Notification deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notification API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}