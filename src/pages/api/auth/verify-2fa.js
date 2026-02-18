import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import TwoFactorAuth from '../../../lib/twoFactor';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidToken = TwoFactorAuth.verifyToken(token, user.twoFactorSecret);
    
    if (isValidToken) {
      user.isTwoFactorEnabled = true;
      await user.save();
      return res.json({ success: true, message: '2FA enabled successfully' });
    }

    res.status(400).json({ error: 'Invalid token' });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Server error during 2FA verification' });
  }
}
