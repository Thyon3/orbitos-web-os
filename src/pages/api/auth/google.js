import passport from '../../../lib/oauth';

export default async function handler(req, res) {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
}
