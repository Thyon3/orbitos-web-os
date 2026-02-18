import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import TwoFactorAuth from '../../../lib/twoFactor';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secret = TwoFactorAuth.generateSecret(user.email);
    const qrCode = await TwoFactorAuth.generateQRCode(secret);
    const backupCodes = TwoFactorAuth.generateBackupCodes();

    user.twoFactorSecret = secret.base32;
    user.backupCodes = backupCodes.map(code => ({ code }));
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Server error during 2FA setup' });
  }
}
