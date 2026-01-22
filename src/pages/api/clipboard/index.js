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
      // Get all clipboard items for the user
      const { limit = 50, type, pinned } = req.query;

      const query = { user: user.id };

      // Filter by type if specified
      if (type) {
        query.type = type;
      }

      // Filter by pinned status if specified
      if (pinned !== undefined) {
        query.isPinned = pinned === 'true';
      }

      const items = await ClipboardItem.find(query)
        .sort({ isPinned: -1, copiedAt: -1 }) // Pinned items first, then by date
        .limit(parseInt(limit))
        .lean();

      return res.status(200).json({
        items,
        total: items.length,
      });
    } else if (req.method === 'POST') {
      // Save new clipboard item
      const { type, content, preview, language, metadata, tags } = req.body;

      if (!type || !content) {
        return res.status(400).json({
          error: 'Type and content are required',
        });
      }

      // Validate type
      const validTypes = ['text', 'code', 'image', 'link', 'file'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      // Create clipboard item
      const clipboardItem = new ClipboardItem({
        user: user.id,
        type,
        content,
        preview: preview || content.substring(0, 200),
        language: language || null,
        metadata: metadata || {},
        tags: tags || [],
      });

      await clipboardItem.save();

      return res.status(201).json({
        message: 'Clipboard item saved',
        item: clipboardItem,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Clipboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
