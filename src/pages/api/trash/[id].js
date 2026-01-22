import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Trash from '@/models/Trash';
import File from '@/models/File';
import Document from '@/models/Document';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    const { id } = req.query;

    if (req.method === 'POST') {
      // Restore item from trash
      const trashItem = await Trash.findOne({ _id: id, owner: user.id });

      if (!trashItem) {
        return res.status(404).json({ error: 'Item not found in trash' });
      }

      // Restore based on file type
      let restoredItem;

      if (trashItem.fileType === 'document') {
        // Restore as Document
        restoredItem = new Document({
          title: trashItem.name,
          content: trashItem.content,
          owner: trashItem.owner,
          collaborators: trashItem.metadata?.collaborators || [],
          isPublic: trashItem.metadata?.isPublic || false,
        });
      } else {
        // Restore as File
        restoredItem = new File({
          name: trashItem.name,
          content: trashItem.content,
          owner: trashItem.owner,
          collaborators: trashItem.metadata?.collaborators || [],
          isPublic: trashItem.metadata?.isPublic || false,
          lastModified: trashItem.metadata?.lastModified || new Date(),
        });
      }

      await restoredItem.save();

      // Remove from trash
      await Trash.deleteOne({ _id: id });

      return res.status(200).json({
        message: 'Item restored successfully',
        item: restoredItem,
      });
    } else if (req.method === 'DELETE') {
      // Permanently delete item
      const trashItem = await Trash.findOne({ _id: id, owner: user.id });

      if (!trashItem) {
        return res.status(404).json({ error: 'Item not found in trash' });
      }

      await Trash.deleteOne({ _id: id });

      return res.status(200).json({
        message: 'Item permanently deleted',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trash item API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
