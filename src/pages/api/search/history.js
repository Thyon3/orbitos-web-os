import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req, res) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      // Get search history
      const userDoc = await User.findById(user.id);
      const searchHistory = userDoc?.searchHistory || [];

      return res.status(200).json({ history: searchHistory.slice(-20) }); // Return last 20 searches
    } else if (req.method === 'POST') {
      // Add to search history
      const { query } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const userDoc = await User.findById(user.id);
      
      if (!userDoc.searchHistory) {
        userDoc.searchHistory = [];
      }

      // Remove duplicate if exists
      userDoc.searchHistory = userDoc.searchHistory.filter(
        (item) => item.query !== query,
      );

      // Add new search to history
      userDoc.searchHistory.push({
        query,
        timestamp: new Date(),
      });

      // Keep only last 50 searches
      if (userDoc.searchHistory.length > 50) {
        userDoc.searchHistory = userDoc.searchHistory.slice(-50);
      }

      await userDoc.save();

      return res.status(200).json({ message: 'Search history updated' });
    } else if (req.method === 'DELETE') {
      // Clear search history
      await User.findByIdAndUpdate(user.id, {
        $set: { searchHistory: [] },
      });

      return res.status(200).json({ message: 'Search history cleared' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Search history API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
