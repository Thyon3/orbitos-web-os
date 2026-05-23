import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({ error: 'Account locked due to too many failed attempts' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      await user.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.updateOne({
      $set: { lastLogin: user.lastLogin, loginAttempts: 0 },
      $unset: { lockUntil: 1 },
      $setOnInsert: { createdAt: user.createdAt || new Date() }
    });

    const token = generateToken(user._id);
    const maxAgeSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const isProd = process.env.NODE_ENV === 'production';
    
    // Set cookie with proper production settings
    const cookieParts = [
      `token=${token}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${maxAgeSeconds}`,
      'SameSite=Lax', // Changed from Strict to Lax for better compatibility
    ];
    if (isProd) cookieParts.push('Secure');
    
    res.setHeader('Set-Cookie', cookieParts.join('; '));

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        createdAt: user.createdAt,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
}