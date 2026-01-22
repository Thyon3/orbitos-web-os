import dbConnect from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  try {
    const user = await verifyToken(req);

    if (req.method === 'GET') {
      // Get user preferences
      const userDoc = await User.findById(user._id).select('preferences').lean();
      
      if (!userDoc) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ preferences: userDoc.preferences || {} });
    } else if (req.method === 'PUT') {
      // Replace all preferences
      const { preferences } = req.body;

      if (!preferences) {
        return res.status(400).json({ error: 'Preferences data is required' });
      }

      // Update user preferences
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { preferences },
        { new: true }
      ).select('preferences');

      return res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: updatedUser.preferences,
      });
    } else if (req.method === 'PATCH') {
      // Partially update preferences (merge with existing)
      const updates = req.body;

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Update data is required' });
      }

      // Get current preferences
      const userDoc = await User.findById(user._id).select('preferences');
      
      if (!userDoc) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Merge preferences
      const currentPreferences = userDoc.preferences || {};
      const newPreferences = {
        ...currentPreferences,
        ...updates,
      };

      // Handle nested objects like notificationSettings
      if (updates.notificationSettings && currentPreferences.notificationSettings) {
        newPreferences.notificationSettings = {
          ...currentPreferences.notificationSettings,
          ...updates.notificationSettings,
        };
      }

      // Update user preferences
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { preferences: newPreferences },
        { new: true }
      ).select('preferences');

      return res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: updatedUser.preferences,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Preferences API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}