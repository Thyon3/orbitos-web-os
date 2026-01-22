import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ClipboardItem from '@/models/ClipboardItem';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get single clipboard item and increment access count
      const item = await ClipboardItem.findOne({
        _id: id,
        user: user.id,
      });

      if (!item) {
        return res.status(404).json({ error: 'Clipboard item not found' });
      }

      // Update access tracking
      item.lastAccessedAt = new Date();
      item.accessCount += 1;
      await item.save();

      return res.status(200).json({ item });
    } else if (req.method === 'PATCH') {
      // Update clipboard item (for pinning/unpinning or editing)
      const { isPinned, tags, content, preview } = req.body;

      const item = await ClipboardItem.findOne({
        _id: id,
        user: user.id,
      });

      if (!item) {
        return res.status(404).json({ error: 'Clipboard item not found' });
      }

      // Update fields if provided
      if (isPinned !== undefined) {
        item.isPinned = isPinned;
      }
      if (tags !== undefined) {
        item.tags = tags;
      }
      if (content !== undefined) {
        item.content = content;
      }
      if (preview !== undefined) {
        item.preview = preview;
      }

      await item.save();

      return res.status(200).json({
        message: 'Clipboard item updated',
        item,
      });
    } else if (req.method === 'DELETE') {
      // Delete single clipboard item
      const item = await ClipboardItem.findOneAndDelete({
        _id: id,
        user: user.id,
      });

      if (!item) {
        return res.status(404).json({ error: 'Clipboard item not found' });
      }

      return res.status(200).json({
        message: 'Clipboard item deleted',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Clipboard item API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
