export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const cookieParts = [
    'token=;',
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax' // Changed from Strict to Lax
  ];
  if (isProd) cookieParts.push('Secure');
  
  res.setHeader('Set-Cookie', cookieParts.join('; '));
  res.json({ message: 'Logged out successfully' });
}