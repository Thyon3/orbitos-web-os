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
      // Get trash statistics
      const items = await Trash.find({ owner: user.id });

      const stats = {
        totalItems: items.length,
        totalSize: items.reduce((sum, item) => sum + (item.size || 0), 0),
        itemsByType: items.reduce(
          (acc, item) => {
            acc[item.fileType] = (acc[item.fileType] || 0) + 1;
            return acc;
          },
          {},
        ),
        oldestItem: items.length > 0 ? items[items.length - 1].deletedAt : null,
        newestItem: items.length > 0 ? items[0].deletedAt : null,
      };

      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trash stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
