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

    if (req.method === 'POST') {
      const { category, resetType = 'defaults' } = req.body;

      if (resetType === 'defaults') {
        // Reset to default shortcuts (this will be implemented with ShortcutRegistry)
        // For now, just delete custom shortcuts and restore default states
        
        const query = { user: user.id };
        
        if (category) {
          query.category = category;
        }

        // Delete custom shortcuts
        await KeyboardShortcut.deleteMany({
          ...query,
          isCustom: true,
        });

        // Reset default shortcuts to enabled
        await KeyboardShortcut.updateMany(
          {
            ...query,
            isDefault: true,
          },
          {
            $set: {
              isEnabled: true,
              usageCount: 0,
              lastUsed: null,
            },
          }
        );

        return res.status(200).json({
          message: category 
            ? `${category} shortcuts reset to defaults`
            : 'All shortcuts reset to defaults',
        });
      } else if (resetType === 'usage') {
        // Reset usage statistics
        const query = { user: user.id };
        
        if (category) {
          query.category = category;
        }

        await KeyboardShortcut.updateMany(query, {
          $set: {
            usageCount: 0,
            lastUsed: null,
          },
        });

        return res.status(200).json({
          message: category 
            ? `${category} shortcuts usage reset`
            : 'All shortcuts usage reset',
        });
      } else {
        return res.status(400).json({
          error: 'Invalid resetType. Use "defaults" or "usage"',
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reset shortcuts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}