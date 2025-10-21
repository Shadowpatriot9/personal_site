import {
  createAccessToken,
  createRefreshToken,
  getTokenExpiry,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '../_lib/auth';

// Use environment variables for production security
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'shadowpatriot9';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '16196823';

// Rate limiting simple implementation
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Helper function for secure logging
function secureLog(message, data = {}) {
  const timestamp = new Date().toISOString();
  // Only log in development or if explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_LOGS === 'true') {
    console.log(`[${timestamp}] ${message}`, data);
  }
}

// Rate limiting helper
function checkRateLimit(clientIP) {
  const now = Date.now();
  const clientAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: now };
  
  // Reset if lockout period has passed
  if (now - clientAttempts.lastAttempt > LOCKOUT_TIME) {
    clientAttempts.count = 0;
  }
  
  return clientAttempts.count < MAX_ATTEMPTS;
}

function recordAttempt(clientIP, success = false) {
  const now = Date.now();
  const clientAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: now };

  if (success) {
    // Reset on successful login
    loginAttempts.delete(clientIP);
  } else {
    // Increment failed attempts
    clientAttempts.count++;
    clientAttempts.lastAttempt = now;
    loginAttempts.set(clientIP, clientAttempts);
  }
}

export default async function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  secureLog('Admin login attempt', { method: req.method, ip: clientIP });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check rate limiting
  if (!checkRateLimit(clientIP)) {
    secureLog('Rate limit exceeded', { ip: clientIP });
    return res.status(429).json({ 
      error: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil(LOCKOUT_TIME / 60000) // minutes
    });
  }

  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    recordAttempt(clientIP, false);
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Input sanitization
  const sanitizedUsername = String(username).trim().toLowerCase();
  const sanitizedPassword = String(password);

  try {
    // Secure credential validation
    const isValidUsername = sanitizedUsername === ADMIN_USERNAME.toLowerCase();
    const isValidPassword = sanitizedPassword === ADMIN_PASSWORD;
    
    if (!isValidUsername || !isValidPassword) {
      recordAttempt(clientIP, false);
      secureLog('Authentication failed', { ip: clientIP, username: sanitizedUsername });
      
      // Add random delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Success - reset rate limiting
    recordAttempt(clientIP, true);
    secureLog('Authentication successful', { ip: clientIP, username: sanitizedUsername });

    // Generate secure JWT tokens
    try {
      const tokenPayload = {
        username: sanitizedUsername,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      };

      const token = createAccessToken(tokenPayload);
      const refreshToken = createRefreshToken(tokenPayload);
      const tokenExpiresAt = getTokenExpiry(token);
      const refreshExpiresAt = getTokenExpiry(refreshToken);

      const responseData = {
        message: 'Login successful',
        token,
        refreshToken,
        user: { username: sanitizedUsername, role: 'admin' },
        expiresIn: ACCESS_TOKEN_EXPIRATION,
        refreshExpiresIn: REFRESH_TOKEN_EXPIRATION,
        tokenExpiresAt,
        refreshExpiresAt
      };

      secureLog('JWT token generated', { ip: clientIP });
      res.status(200).json(responseData);

    } catch (tokenError) {
      secureLog('JWT token generation failed', { error: tokenError.message });
      return res.status(500).json({ error: 'Authentication system error' });
    }
    
  } catch (error) {
    secureLog('Unhandled error in login process', { 
      error: error.message, 
      ip: clientIP 
    });
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({ 
      error: 'Internal server error',
      ...(isDevelopment && { details: error.message })
    });
  }
}
