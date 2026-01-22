import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Trash from '@/models/Trash';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      // Get all trash items for the user
      const trashItems = await Trash.find({ owner: user.id })
        .sort({ deletedAt: -1 })
        .populate('owner', 'username email');

      return res.status(200).json({ items: trashItems });
    } else if (req.method === 'POST') {
      // Move item to trash
      const { fileId, name, content, fileType, originalPath, size, metadata } =
        req.body;

      if (!fileId || !name) {
        return res
          .status(400)
          .json({ error: 'File ID and name are required' });
      }

      const trashItem = new Trash({
        originalFileId: fileId,
        name,
        content: content || '',
        fileType: fileType || 'file',
        owner: user.id,
        originalPath: originalPath || '/',
        size: size || 0,
        metadata: metadata || {},
      });

      await trashItem.save();

      return res.status(201).json({
        message: 'Item moved to trash',
        item: trashItem,
      });
    } else if (req.method === 'DELETE') {
      // Empty entire trash
      const result = await Trash.deleteMany({ owner: user.id });

      return res.status(200).json({
        message: 'Trash emptied',
        deletedCount: result.deletedCount,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trash API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
