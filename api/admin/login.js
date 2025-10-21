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
const DEFAULT_ADMIN_USERNAME = 'shadowpatriot9';
const DEFAULT_ADMIN_PASSWORD = '16196823';

const normalizePositiveNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const CREDENTIALS_SALT = process.env.ADMIN_CREDENTIALS_SALT || 'admin-credential-fallback-salt';
const PBKDF2_ITERATIONS = normalizePositiveNumber(process.env.ADMIN_PBKDF2_ITERATIONS, 150000);
const DERIVED_KEY_LENGTH = 64;
const DERIVED_KEY_DIGEST = 'sha512';

const ACCESS_TOKEN_TTL_SECONDS = normalizePositiveNumber(process.env.ACCESS_TOKEN_TTL_SECONDS, 15 * 60); // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = normalizePositiveNumber(process.env.REFRESH_TOKEN_TTL_SECONDS, 7 * 24 * 60 * 60); // 7 days

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || crypto.randomBytes(64).toString('hex');

const ADMIN_USERNAME_SOURCE = (process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME).trim();
const ADMIN_PASSWORD_SOURCE = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

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

function deriveCredentialKey(value) {
  return crypto.pbkdf2Sync(value, CREDENTIALS_SALT, PBKDF2_ITERATIONS, DERIVED_KEY_LENGTH, DERIVED_KEY_DIGEST);
}

function parseHashedCredential(hashValue, fallbackValue) {
  if (hashValue) {
    try {
      const parsed = Buffer.from(hashValue, 'hex');
      if (parsed.length === DERIVED_KEY_LENGTH) {
        return parsed;
      }
      secureLog('Invalid credential hash length detected, falling back to derived value');
    } catch (error) {
      secureLog('Failed to parse credential hash, falling back to derived value', { error: error.message });
    }
  }

  return deriveCredentialKey(fallbackValue);
}

function constantTimeEquals(provided, expected) {
  if (!provided || !expected || provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

const ADMIN_USERNAME_HASH = parseHashedCredential(
  process.env.ADMIN_USERNAME_HASH,
  ADMIN_USERNAME_SOURCE.toLowerCase()
);

const ADMIN_PASSWORD_HASH = parseHashedCredential(
  process.env.ADMIN_PASSWORD_HASH,
  ADMIN_PASSWORD_SOURCE
);

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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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

  const { username, password } = req.body || {};

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
    const normalizedUsername = sanitizedUsername.toLowerCase();
    const providedUsernameHash = deriveCredentialKey(normalizedUsername);
    const providedPasswordHash = deriveCredentialKey(sanitizedPassword);

    const isValidUsername = constantTimeEquals(providedUsernameHash, ADMIN_USERNAME_HASH);
    const isValidPassword = constantTimeEquals(providedPasswordHash, ADMIN_PASSWORD_HASH);
    
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
        sub: sanitizedUsername,
        username: sanitizedUsername,
        role: 'admin',
        tokenType: 'access'
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
      const accessToken = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        {
          expiresIn: ACCESS_TOKEN_TTL_SECONDS,
          issuer: 'mgds.me',
          audience: 'mgds.me'
        }
      );

      const refreshToken = jwt.sign(
        {
          sub: sanitizedUsername,
          username: sanitizedUsername,
          role: 'admin',
          tokenType: 'refresh'
        },
        REFRESH_TOKEN_SECRET,
        {
          expiresIn: REFRESH_TOKEN_TTL_SECONDS,
          issuer: 'mgds.me',
          audience: 'mgds.me'
        }
      );

      const isProduction = process.env.NODE_ENV === 'production';
      const refreshCookie = [
        `admin_refresh_token=${refreshToken}`,
        'HttpOnly',
        'SameSite=Strict',
        'Path=/api/admin',
        `Max-Age=${REFRESH_TOKEN_TTL_SECONDS}`,
        isProduction ? 'Secure' : null
      ].filter(Boolean).join('; ');

      res.setHeader('Set-Cookie', refreshCookie);

      const responseData = {
        message: 'Login successful',
        token: accessToken,
        tokenType: 'Bearer',
        user: { username: sanitizedUsername, role: 'admin' },
        expiresIn: ACCESS_TOKEN_TTL_SECONDS
      };

      secureLog('JWT tokens generated', { ip: clientIP });
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
