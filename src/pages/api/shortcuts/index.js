import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import KeyboardShortcut from '@/models/KeyboardShortcut';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      // Get all shortcuts for the user
      const { category, enabled, scope } = req.query;

      const query = { user: user.id };

      // Filter by category if specified
      if (category) {
        query.category = category;
      }

      // Filter by enabled status if specified
      if (enabled !== undefined) {
        query.isEnabled = enabled === 'true';
      }

      // Filter by scope if specified
      if (scope) {
        query['metadata.scope'] = scope;
      }

      const shortcuts = await KeyboardShortcut.find(query)
        .sort({ category: 1, name: 1 })
        .lean();

      // Group shortcuts by category
      const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
          acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
      }, {});

      return res.status(200).json({
        shortcuts,
        groupedShortcuts,
        total: shortcuts.length,
      });
    } else if (req.method === 'POST') {
      // Create new custom shortcut
      const {
        shortcutId,
        category,
        name,
        description,
        keys,
        keyCombination,
        action,
        appId,
        metadata,
      } = req.body;

      if (!shortcutId || !category || !name || !keys || !action) {
        return res.status(400).json({
          error: 'Missing required fields: shortcutId, category, name, keys, action',
        });
      }

      // Check if shortcut already exists
      const existingShortcut = await KeyboardShortcut.findOne({
        user: user.id,
        shortcutId,
      });

      if (existingShortcut) {
        return res.status(409).json({
          error: 'Shortcut with this ID already exists',
        });
      }

      // Check for key combination conflicts
      const conflictingShortcut = await KeyboardShortcut.findOne({
        user: user.id,
        keyCombination,
        isEnabled: true,
      });

      if (conflictingShortcut) {
        return res.status(409).json({
          error: 'Key combination already in use',
          conflictWith: conflictingShortcut.name,
        });
      }

      const newShortcut = new KeyboardShortcut({
        user: user.id,
        shortcutId,
        category,
        name,
        description,
        keys,
        keyCombination,
        action,
        appId: appId || null,
        isCustom: true,
        metadata: metadata || { platform: 'all', scope: 'global' },
      });

      await newShortcut.save();

      return res.status(201).json({
        message: 'Shortcut created successfully',
        shortcut: newShortcut,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Shortcuts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}