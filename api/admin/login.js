import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'shadowpatriot9';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Development credentials - only used when no production hash is set
const DEV_USERNAME = 'shadowpatriot9';
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
    console.log('🔧 Environment check - ADMIN_PASSWORD_HASH exists:', !!ADMIN_PASSWORD_HASH);
    console.log('🔧 Environment check - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    // Check username
    if (username !== ADMIN_USERNAME) {
      console.log('❌ Invalid username');
      // Use a generic error message for security
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let isValidPassword = false;

    // If we have a production password hash, use it
    if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_HASH.length > 10) {
      try {
        isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        console.log('🔍 Production password check:', isValidPassword ? '✅' : '❌');
      } catch (hashError) {
        console.warn('⚠️ Error with production password hash:', hashError.message);
        // If hash is malformed, fall back to development mode
        if (username === DEV_USERNAME && password === DEV_PASSWORD) {
          console.log('🔧 Falling back to development auth due to hash error');
          isValidPassword = true;
        }
      }
    } else {
      // No production hash set - use development authentication
      console.log('🔧 No production hash found, using development authentication');
      if (username === DEV_USERNAME && password === DEV_PASSWORD) {
        console.log('🔧 Development authentication successful');
        isValidPassword = true;
      } else {
        console.log('❌ Development authentication failed');
      }
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
      token,
      user: { username, role: 'admin' }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
