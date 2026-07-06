import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';

function resolveSecret(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (isProduction) {
    throw new Error(`${name} environment variable is required in production`);
  }
  console.warn(`[auth] ${name} is not set, using a development fallback.`);
  return devFallback;
}

// Read secrets at request time, not module load, so a missing env var during
// the production build doesn't throw before deploy-time config is available.
const getJwtSecret = () => resolveSecret('JWT_SECRET', 'dev-access-secret-not-for-production');
const getRefreshSecret = () =>
  resolveSecret('REFRESH_TOKEN_SECRET', 'dev-refresh-secret-not-for-production');

export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_EXPIRATION || '15m';
export const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

const TOKEN_OPTIONS = {
  issuer: 'mgds.me',
  audience: 'mgds.me',
};

export interface TokenPayload {
  sub?: string;
  username: string;
  role: string;
}

export function createAccessToken(payload: TokenPayload) {
  return jwt.sign({ ...payload, type: 'access' }, getJwtSecret(), {
    ...TOKEN_OPTIONS,
    expiresIn: ACCESS_TOKEN_TTL,
  } as jwt.SignOptions);
}

export function createRefreshToken(payload: TokenPayload) {
  return jwt.sign({ ...payload, type: 'refresh' }, getRefreshSecret(), {
    ...TOKEN_OPTIONS,
    expiresIn: REFRESH_TOKEN_TTL,
  } as jwt.SignOptions);
}

export function getTokenExpiry(token: string): number | null {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return decoded?.exp ? decoded.exp * 1000 : null;
}

export function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, getJwtSecret(), TOKEN_OPTIONS) as jwt.JwtPayload;
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

export function verifyRefreshToken(token: string) {
  const decoded = jwt.verify(token, getRefreshSecret(), TOKEN_OPTIONS) as jwt.JwtPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

/**
 * Verify a Bearer token from a request's Authorization header.
 * Returns the decoded payload, or null if missing/invalid.
 */
export function verifyRequest(request: Request): jwt.JwtPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Credential verification (PBKDF2 + constant-time compare)
// ---------------------------------------------------------------------------

const CREDENTIALS_SALT = process.env.ADMIN_CREDENTIALS_SALT || 'admin-credential-fallback-salt';
const PBKDF2_ITERATIONS = normalizePositiveNumber(process.env.ADMIN_PBKDF2_ITERATIONS, 150000);
const DERIVED_KEY_LENGTH = 64;
const DERIVED_KEY_DIGEST = 'sha512';

const DEV_USERNAME = 'admin';
const DEV_PASSWORD = 'changeme';

function normalizePositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveCredential(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (isProduction) {
    throw new Error(`${name} environment variable is required in production`);
  }
  console.warn(`[auth] ${name} is not set, using a development fallback.`);
  return devFallback;
}

const deriveCredentialKey = (value: string) =>
  crypto.pbkdf2Sync(value, CREDENTIALS_SALT, PBKDF2_ITERATIONS, DERIVED_KEY_LENGTH, DERIVED_KEY_DIGEST);

// getFallback is a thunk so the credential fallback is only resolved when the
// hash is missing/invalid — otherwise a set *_HASH with an unset plaintext var
// would still throw in production.
function parseHash(hashValue: string | undefined, getFallback: () => string): Buffer {
  if (hashValue) {
    try {
      const buffer = Buffer.from(hashValue, 'hex');
      if (buffer.length === DERIVED_KEY_LENGTH) {
        return buffer;
      }
    } catch {
      /* fall through */
    }
  }
  return deriveCredentialKey(getFallback());
}

const getAdminUsernameHash = () =>
  parseHash(process.env.ADMIN_USERNAME_HASH, () =>
    resolveCredential('ADMIN_USERNAME', DEV_USERNAME).trim().toLowerCase(),
  );
const getAdminPasswordHash = () =>
  parseHash(process.env.ADMIN_PASSWORD_HASH, () =>
    resolveCredential('ADMIN_PASSWORD', DEV_PASSWORD),
  );

const constantTimeEquals = (provided: Buffer, expected: Buffer) =>
  provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

export function verifyCredentials(username: string, password: string): boolean {
  const usernameHash = deriveCredentialKey(String(username).trim().toLowerCase());
  const passwordHash = deriveCredentialKey(String(password));
  const usernameValid = constantTimeEquals(usernameHash, getAdminUsernameHash());
  const passwordValid = constantTimeEquals(passwordHash, getAdminPasswordHash());
  return usernameValid && passwordValid;
}
