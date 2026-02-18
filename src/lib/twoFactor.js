const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorAuth {
  static generateSecret(userEmail) {
    return speakeasy.generateSecret({
      name: `OrbitOS (${userEmail})`,
      issuer: 'OrbitOS',
      length: 32
    });
  }

  static generateQRCode(secret) {
    return QRCode.toDataURL(secret.otpauth_url);
  }

  static verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });
  }

  static generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}

module.exports = TwoFactorAuth;
