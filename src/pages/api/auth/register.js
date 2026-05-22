import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    let { username, email, password, displayName } = req.body;

    username = username?.trim();
    email = email?.toLowerCase().trim();
    displayName = displayName?.trim();

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    const user = new User({
      username,
      email,
      passwordHash: password,
      displayName: displayName || username
    });

    await user.save();

    const token = generateToken(user._id);
    const maxAgeSeconds = 7 * 24 * 60 * 60; // 7 days
    const isProd = process.env.NODE_ENV === 'production';
    const cookieParts = [
      `token=${token}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${maxAgeSeconds}`,
      'SameSite=Strict',
    ];
    if (isProd) cookieParts.push('Secure');
    res.setHeader('Set-Cookie', cookieParts.join('; '));

    res.status(201).json({
      message: 'User registered successfully',
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
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
}