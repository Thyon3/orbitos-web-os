import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../models/User';
import dbConnect from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'orbitos-secret-key';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = async (req) => {
  // Ensure DB connection is available
  try {
    await dbConnect();
  } catch (e) {
    // ignore - dbConnect may already be connected elsewhere
  }

  let token = null;
  try {
    if (req.headers?.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers?.cookie) {
      const parsed = cookie.parse(req.headers.cookie || '');
      token = parsed.token;
    }
  } catch (err) {
    // continue to throw below
  }

  if (!token) {
    throw new Error('No token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid token');
  }

  const user = await User.findById(decoded.userId).select('-passwordHash');
  if (!user || !user.isActive) {
    throw new Error('Invalid token or user not found');
  }

  return user;
};

// Export verifyAuth as an alias for verifyToken for compatibility
export const verifyAuth = verifyToken;