import dbConnect from '../../../lib/mongodb';
import { generateToken } from '../../../lib/auth';
import passport from '../../../lib/oauth';

export default async function handler(req, res) {
  passport.authenticate('google', { failureRedirect: '/login' }, async (err, user) => {
    if (err) {
      return res.redirect('/login?error=auth_failed');
    }

    try {
      await dbConnect();
      
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Strict`);
      
      res.redirect('/');
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect('/login?error=server_error');
    }
  })(req, res);
}
