import jwt from 'jsonwebtoken';

// Simplified hardcoded credentials for both dev and production
const ADMIN_USERNAME = 'shadowpatriot9';
const ADMIN_PASSWORD = '16196823';
const JWT_SECRET = process.env.JWT_SECRET || 'simple-jwt-secret-for-admin-2025';

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
    console.log('\n🔍 SIMPLE AUTHENTICATION CHECK:');
    console.log('Expected username:', ADMIN_USERNAME);
    console.log('Expected password:', '[MASKED]');
    console.log('JWT_SECRET available:', !!JWT_SECRET);
    
    console.log('\n🔐 VALIDATING CREDENTIALS:');
    console.log('Provided username:', `"${username}"`);
    console.log('Provided password length:', password?.length);
    
    // Simple credential check
    const isValidUsername = username === ADMIN_USERNAME;
    const isValidPassword = password === ADMIN_PASSWORD;
    
    console.log('Username valid:', isValidUsername);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidUsername || !isValidPassword) {
      console.log('❌ AUTHENTICATION FAILED - Invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ AUTHENTICATION SUCCESSFUL');
    const isValidCredentials = true;

    console.log('\n📋 FINAL RESULT:');
    console.log('Authentication successful:', isValidCredentials);
    
    if (!isValidCredentials) {
      console.log('❌ This should not happen - auth already checked');
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
