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

    if (req.method === 'GET') {
      // Get clipboard statistics
      const items = await ClipboardItem.find({ user: user.id });

      const stats = {
        totalItems: items.length,
        pinnedItems: items.filter((item) => item.isPinned).length,
        itemsByType: items.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {}),
        mostAccessed: items
          .sort((a, b) => b.accessCount - a.accessCount)
          .slice(0, 5)
          .map((item) => ({
            id: item._id,
            type: item.type,
            preview: item.preview,
            accessCount: item.accessCount,
          })),
        recentItems: items
          .sort((a, b) => b.copiedAt - a.copiedAt)
          .slice(0, 5)
          .map((item) => ({
            id: item._id,
            type: item.type,
            preview: item.preview,
            copiedAt: item.copiedAt,
          })),
      };

      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Clipboard stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
