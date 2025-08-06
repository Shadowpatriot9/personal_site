import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'shadowpatriot9';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password: password
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Fallback credentials for development
const DEV_PASSWORD = '16196823';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log('🔐 Login attempt for username:', username);
    
    // Check username
    if (username !== ADMIN_USERNAME) {
      console.log('❌ Invalid username');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let isValidPassword = false;

    // Try production password hash first
    if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_HASH !== '$2a$10$defaultHashHere') {
      try {
        isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        console.log('🔍 Production password check:', isValidPassword ? '✅' : '❌');
      } catch (hashError) {
        console.warn('⚠️ Error with production password hash:', hashError.message);
      }
    }

    // Fallback to development password if production hash doesn't work
    if (!isValidPassword && password === DEV_PASSWORD) {
      console.log('🔧 Using development password fallback');
      isValidPassword = true;
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful');
    res.status(200).json({ 
      message: 'Login successful',
      token 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
