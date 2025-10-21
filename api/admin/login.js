import crypto from 'crypto';
import {
  createAccessToken,
  createRefreshToken,
  getTokenExpiry,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '../_lib/auth';

const DEFAULT_USERNAME = 'shadowpatriot9';
const DEFAULT_PASSWORD = '16196823';

const normalizePositiveNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const CREDENTIALS_SALT = process.env.ADMIN_CREDENTIALS_SALT || 'admin-credential-fallback-salt';
const PBKDF2_ITERATIONS = normalizePositiveNumber(process.env.ADMIN_PBKDF2_ITERATIONS, 150000);
const DERIVED_KEY_LENGTH = 64;
const DERIVED_KEY_DIGEST = 'sha512';

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || DEFAULT_USERNAME).trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

const ACCESS_TOKEN_TTL_SECONDS = normalizePositiveNumber(process.env.ACCESS_TOKEN_TTL_SECONDS, 15 * 60);
const REFRESH_TOKEN_TTL_SECONDS = normalizePositiveNumber(process.env.REFRESH_TOKEN_TTL_SECONDS, 7 * 24 * 60 * 60);

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

const deriveCredentialKey = (value) =>
  crypto.pbkdf2Sync(value, CREDENTIALS_SALT, PBKDF2_ITERATIONS, DERIVED_KEY_LENGTH, DERIVED_KEY_DIGEST);

const parseHash = (hashValue, fallbackValue) => {
  if (!hashValue) {
    return deriveCredentialKey(fallbackValue);
  }
  try {
    const buffer = Buffer.from(hashValue, 'hex');
    if (buffer.length === DERIVED_KEY_LENGTH) {
      return buffer;
    }
  } catch {
    /* ignore */
  }
  return deriveCredentialKey(fallbackValue);
};

const ADMIN_USERNAME_HASH = parseHash(process.env.ADMIN_USERNAME_HASH, ADMIN_USERNAME);
const ADMIN_PASSWORD_HASH = parseHash(process.env.ADMIN_PASSWORD_HASH, ADMIN_PASSWORD);

const constantTimeEquals = (provided, expected) =>
  provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

const checkRateLimit = (clientIP) => {
  const now = Date.now();
  const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: now };
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    attempts.count = 0;
  }
  return attempts.count < MAX_ATTEMPTS;
};

const recordAttempt = (clientIP, success) => {
  if (success) {
    loginAttempts.delete(clientIP);
    return;
  }
  const now = Date.now();
  const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: now };
  attempts.count += 1;
  attempts.lastAttempt = now;
  loginAttempts.set(clientIP, attempts);
};

export default async function handler(req, res) {
  const clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil(LOCKOUT_TIME / 60000),
    });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    recordAttempt(clientIP, false);
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const normalizedUsername = String(username).trim().toLowerCase();
  const sanitizedPassword = String(password);

  try {
    const usernameHash = deriveCredentialKey(normalizedUsername);
    const passwordHash = deriveCredentialKey(sanitizedPassword);

    const usernameValid = constantTimeEquals(usernameHash, ADMIN_USERNAME_HASH);
    const passwordValid = constantTimeEquals(passwordHash, ADMIN_PASSWORD_HASH);

    if (!usernameValid || !passwordValid) {
      recordAttempt(clientIP, false);
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    recordAttempt(clientIP, true);

    const payload = { sub: normalizedUsername, username: normalizedUsername, role: 'admin' };
    const token = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    return res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: { username: normalizedUsername, role: 'admin' },
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
      tokenExpiresAt: getTokenExpiry(token),
      refreshExpiresAt: getTokenExpiry(refreshToken),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    recordAttempt(clientIP, false);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
