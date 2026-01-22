import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Wallpaper from '@/models/Wallpaper';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get single wallpaper
      const wallpaper = await Wallpaper.findOne({
        _id: id,
        user: user.id,
      });

      if (!wallpaper) {
        return res.status(404).json({ error: 'Wallpaper not found' });
      }

      // Increment view count
      wallpaper.viewCount += 1;
      await wallpaper.save();

      return res.status(200).json({ wallpaper });
    } else if (req.method === 'PATCH') {
      // Update wallpaper
      const {
        name,
        description,
        category,
        tags,
        isPublic,
        isFavorite,
        settings,
      } = req.body;

      const wallpaper = await Wallpaper.findOne({
        _id: id,
        user: user.id,
      });

      if (!wallpaper) {
        return res.status(404).json({ error: 'Wallpaper not found' });
      }

      // Update fields
      if (name !== undefined) wallpaper.name = name;
      if (description !== undefined) wallpaper.description = description;
      if (category !== undefined) wallpaper.category = category;
      if (tags !== undefined) {
        wallpaper.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      }
      if (isPublic !== undefined) wallpaper.isPublic = isPublic;
      if (isFavorite !== undefined) wallpaper.isFavorite = isFavorite;
      if (settings !== undefined) {
        wallpaper.settings = { ...wallpaper.settings, ...settings };
      }

      await wallpaper.save();

      return res.status(200).json({
        message: 'Wallpaper updated successfully',
        wallpaper,
      });
    } else if (req.method === 'DELETE') {
      // Delete wallpaper
      const wallpaper = await Wallpaper.findOne({
        _id: id,
        user: user.id,
      });

      if (!wallpaper) {
        return res.status(404).json({ error: 'Wallpaper not found' });
      }

      // Don't allow deletion of default wallpapers
      if (wallpaper.isDefault) {
        return res.status(403).json({
          error: 'Cannot delete default wallpapers',
        });
      }

      try {
        // Delete the file
        const filePath = path.join(process.cwd(), 'public', wallpaper.url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Could not delete wallpaper file:', fileError.message);
      }

      await Wallpaper.deleteOne({ _id: id });

      return res.status(200).json({
        message: 'Wallpaper deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wallpaper API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}