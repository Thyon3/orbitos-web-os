import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const userId = req.user.id; // Assuming auth middleware sets this

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.method === 'GET') {
      res.json({ sessions: user.sessions });
    } else if (req.method === 'DELETE') {
      const { sessionId } = req.body;
      await user.removeSession(sessionId);
      res.json({ message: 'Session removed successfully' });
    }
  } catch (error) {
    console.error('Session management error:', error);
    res.status(500).json({ error: 'Server error during session management' });
  }
}
