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

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get single shortcut
      const shortcut = await KeyboardShortcut.findOne({
        _id: id,
        user: user.id,
      });

      if (!shortcut) {
        return res.status(404).json({ error: 'Shortcut not found' });
      }

      return res.status(200).json({ shortcut });
    } else if (req.method === 'PATCH') {
      // Update shortcut
      const { keys, keyCombination, isEnabled, description } = req.body;

      const shortcut = await KeyboardShortcut.findOne({
        _id: id,
        user: user.id,
      });

      if (!shortcut) {
        return res.status(404).json({ error: 'Shortcut not found' });
      }

      // Check for key combination conflicts if keys are being updated
      if (keyCombination && keyCombination !== shortcut.keyCombination) {
        const conflictingShortcut = await KeyboardShortcut.findOne({
          user: user.id,
          keyCombination,
          isEnabled: true,
          _id: { $ne: id },
        });

        if (conflictingShortcut) {
          return res.status(409).json({
            error: 'Key combination already in use',
            conflictWith: conflictingShortcut.name,
          });
        }
      }

      // Update fields
      if (keys !== undefined) shortcut.keys = keys;
      if (keyCombination !== undefined) shortcut.keyCombination = keyCombination;
      if (isEnabled !== undefined) shortcut.isEnabled = isEnabled;
      if (description !== undefined) shortcut.description = description;

      await shortcut.save();

      return res.status(200).json({
        message: 'Shortcut updated successfully',
        shortcut,
      });
    } else if (req.method === 'DELETE') {
      // Delete shortcut (only custom shortcuts can be deleted)
      const shortcut = await KeyboardShortcut.findOne({
        _id: id,
        user: user.id,
      });

      if (!shortcut) {
        return res.status(404).json({ error: 'Shortcut not found' });
      }

      if (!shortcut.isCustom) {
        return res.status(403).json({
          error: 'Cannot delete default shortcuts. Use disable instead.',
        });
      }

      await KeyboardShortcut.deleteOne({ _id: id });

      return res.status(200).json({
        message: 'Shortcut deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Shortcut API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}