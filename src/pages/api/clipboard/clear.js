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

    if (req.method === 'DELETE') {
      const { keepPinned = true } = req.query;

      // Delete all clipboard items (optionally keeping pinned ones)
      const query = { user: user.id };

      if (keepPinned === 'true') {
        query.isPinned = false;
      }

      const result = await ClipboardItem.deleteMany(query);

      return res.status(200).json({
        message: `Clipboard cleared (${result.deletedCount} items deleted)`,
        deletedCount: result.deletedCount,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Clear clipboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
