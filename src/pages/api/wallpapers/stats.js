import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Wallpaper from '@/models/Wallpaper';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      // Get wallpaper statistics
      const wallpapers = await Wallpaper.find({ user: user.id });

      const stats = {
        total: wallpapers.length,
        favorites: wallpapers.filter(w => w.isFavorite).length,
        public: wallpapers.filter(w => w.isPublic).length,
        totalSize: wallpapers.reduce((sum, w) => sum + (w.size || 0), 0),
        byCategory: wallpapers.reduce((acc, w) => {
          acc[w.category] = (acc[w.category] || 0) + 1;
          return acc;
        }, {}),
        byFormat: wallpapers.reduce((acc, w) => {
          acc[w.format] = (acc[w.format] || 0) + 1;
          return acc;
        }, {}),
        mostViewed: wallpapers
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 5)
          .map(w => ({
            id: w._id,
            name: w.name,
            url: w.url,
            viewCount: w.viewCount || 0,
          })),
        recent: wallpapers
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(w => ({
            id: w._id,
            name: w.name,
            url: w.url,
            createdAt: w.createdAt,
          })),
        activeWallpaper: wallpapers.find(w => w.isActive) || null,
      };

      // Format total size
      const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
      };

      stats.formattedTotalSize = formatSize(stats.totalSize);

      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wallpaper stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}