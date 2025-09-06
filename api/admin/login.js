import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'shadowpatriot9';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Development credentials - only used when no production hash is set
const DEV_USERNAME = 'shadowpatriot9';
const DEV_PASSWORD = '16196823';

export default async function handler(req, res) {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 ADMIN LOGIN API CALLED');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('='.repeat(50));

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Raw body:', req.body);
  const { username, password } = req.body;
  console.log('Parsed - Username:', username, '| Password length:', password?.length);

  // Input validation
  if (!username || !password) {
    console.log('❌ Missing credentials - Username:', !!username, '| Password:', !!password);
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log('\n🔍 ENVIRONMENT CHECK:');
    console.log('ADMIN_USERNAME:', ADMIN_USERNAME);
    console.log('ADMIN_PASSWORD_HASH exists:', !!ADMIN_PASSWORD_HASH);
    console.log('ADMIN_PASSWORD_HASH length:', ADMIN_PASSWORD_HASH?.length || 0);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    console.log('\n🔐 AUTHENTICATION ATTEMPT:');
    console.log('Login attempt for username:', username);
    console.log('Expected username:', ADMIN_USERNAME);
    
    console.log('\n📝 USERNAME CHECK:');
    console.log('Provided username:', `"${username}"`);
    console.log('Expected username:', `"${ADMIN_USERNAME}"`);
    console.log('Username match:', username === ADMIN_USERNAME);
    
    // Check username
    if (username !== ADMIN_USERNAME) {
      console.log('❌ USERNAME MISMATCH - Authentication failed');
      console.log('Returning 401 error');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('✅ Username validated successfully');

    console.log('\n🔑 PASSWORD VALIDATION:');
    let isValidPassword = false;

    // If we have a production password hash, use it
    if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_HASH.length > 10) {
      console.log('💼 Using PRODUCTION authentication mode');
      console.log('Password hash format check:', ADMIN_PASSWORD_HASH.startsWith('$2a$') ? 'Valid bcrypt' : 'Invalid format');
      
      try {
        console.log('Starting bcrypt comparison...');
        const startTime = Date.now();
        isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        const endTime = Date.now();
        console.log(`bcrypt comparison completed in ${endTime - startTime}ms`);
        console.log('🔍 Production password check result:', isValidPassword ? '✅ VALID' : '❌ INVALID');
        
        if (isValidPassword) {
          console.log('✅ PRODUCTION AUTHENTICATION SUCCESSFUL');
        } else {
          console.log('❌ PRODUCTION AUTHENTICATION FAILED - Password mismatch');
        }
      } catch (hashError) {
        console.error('⚠️ BCRYPT ERROR:', hashError.message);
        console.error('Full error:', hashError);
        console.log('Hash value (first 20 chars):', ADMIN_PASSWORD_HASH?.substring(0, 20));
        
        // If hash is malformed, fall back to development mode
        console.log('\n🔧 Attempting fallback to development authentication due to hash error');
        if (username === DEV_USERNAME && password === DEV_PASSWORD) {
          console.log('✅ DEVELOPMENT FALLBACK SUCCESSFUL');
          isValidPassword = true;
        } else {
          console.log('❌ DEVELOPMENT FALLBACK FAILED');
        }
      }
    } else {
      console.log('🛠️ Using DEVELOPMENT authentication mode');
      console.log('Reason: No production hash set or hash too short');
      console.log('DEV_USERNAME check:', `"${username}" === "${DEV_USERNAME}" = ${username === DEV_USERNAME}`);
      console.log('DEV_PASSWORD check:', `[${password?.length} chars] === [${DEV_PASSWORD.length} chars] = ${password === DEV_PASSWORD}`);
      
      if (username === DEV_USERNAME && password === DEV_PASSWORD) {
        console.log('✅ DEVELOPMENT AUTHENTICATION SUCCESSFUL');
        isValidPassword = true;
      } else {
        console.log('❌ DEVELOPMENT AUTHENTICATION FAILED');
        if (username !== DEV_USERNAME) console.log('  - Username mismatch');
        if (password !== DEV_PASSWORD) console.log('  - Password mismatch');
      }
    }

    console.log('\n📋 FINAL AUTHENTICATION RESULT:');
    console.log('isValidPassword:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ AUTHENTICATION FAILED - Invalid password');
      console.log('Returning 401 Unauthorized');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('\n🎟️ GENERATING JWT TOKEN:');
    try {
      const tokenPayload = { username, role: 'admin' };
      console.log('Token payload:', tokenPayload);
      console.log('JWT secret length:', JWT_SECRET?.length || 0);
      
      const token = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('Token generated successfully, length:', token?.length || 0);
      console.log('Token preview (first 50 chars):', token?.substring(0, 50) + '...');
      
      const responseData = {
        message: 'Login successful',
        token,
        user: { username, role: 'admin' }
      };
      
      console.log('\n✅ SENDING SUCCESS RESPONSE:');
      console.log('Response data:', { ...responseData, token: '[MASKED]' });
      console.log('='.repeat(50) + '\n');
      
      res.status(200).json(responseData);
      
    } catch (tokenError) {
      console.error('❌ JWT TOKEN GENERATION ERROR:', tokenError);
      return res.status(500).json({ error: 'Token generation failed' });
    }
    
  } catch (error) {
    console.log('\n⚡ UNHANDLED ERROR IN LOGIN PROCESS:');
    console.error('Full error object:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('Returning 500 Internal Server Error');
    console.log('='.repeat(50) + '\n');
    res.status(500).json({ error: 'Internal server error' });
  }
}
