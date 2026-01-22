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

    if (req.method === 'POST') {
      const { wallpaperId } = req.body;

      if (!wallpaperId) {
        return res.status(400).json({ error: 'Wallpaper ID is required' });
      }

      const wallpaper = await Wallpaper.findOne({
        _id: wallpaperId,
        user: user.id,
      });

      if (!wallpaper) {
        return res.status(404).json({ error: 'Wallpaper not found' });
      }

      // Set as active wallpaper
      await wallpaper.setAsActive();

      return res.status(200).json({
        message: 'Wallpaper activated successfully',
        wallpaper,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Activate wallpaper API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}