import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Wallpaper from '@/models/Wallpaper';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads/wallpapers');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `wallpaper-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    
    if (mimeType && extName) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      // Get wallpapers with filtering and pagination
      const {
        category,
        tags,
        isPublic,
        isFavorite,
        isActive,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const query = { user: user.id };

      // Apply filters
      if (category) {
        query.category = category;
      }
      if (tags) {
        query.tags = { $in: tags.split(',') };
      }
      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }
      if (isFavorite !== undefined) {
        query.isFavorite = isFavorite === 'true';
      }
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const wallpapers = await Wallpaper.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean();

      const totalCount = await Wallpaper.countDocuments(query);
      const activeWallpaper = await Wallpaper.getActiveWallpaper(user.id);

      return res.status(200).json({
        wallpapers,
        totalCount,
        activeWallpaper,
        hasMore: totalCount > parseInt(offset) + parseInt(limit),
      });
    } else if (req.method === 'POST') {
      // Handle file upload
      upload.single('wallpaper')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        const { name, description, category = 'custom', tags, isPublic = false } = req.body;
        const file = req.file;

        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!name) {
          return res.status(400).json({ error: 'Wallpaper name is required' });
        }

        try {
          // Get image dimensions (would need sharp or similar library in production)
          const dimensions = { width: 1920, height: 1080 }; // Placeholder
          
          const wallpaper = new Wallpaper({
            user: user.id,
            name,
            description: description || '',
            filename: file.filename,
            originalName: file.originalname,
            url: `/uploads/wallpapers/${file.filename}`,
            size: file.size,
            dimensions,
            format: path.extname(file.originalname).slice(1).toLowerCase(),
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            isPublic: isPublic === 'true',
            metadata: {
              source: 'upload',
              fileType: file.mimetype,
            },
          });

          await wallpaper.save();

          return res.status(201).json({
            message: 'Wallpaper uploaded successfully',
            wallpaper,
          });
        } catch (error) {
          // Clean up uploaded file on error
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error cleaning up file:', unlinkError);
          }
          throw error;
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wallpaper API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}