import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '15m';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

export function createAccessToken(payload) {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
      issuer: 'mgds.me',
      audience: 'mgds.me',
    }
  );
}

export function createRefreshToken(payload) {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
      issuer: 'mgds.me',
      audience: 'mgds.me',
    }
  );
}

export function getTokenExpiry(token) {
  const decoded = jwt.decode(token);
  return decoded?.exp ? decoded.exp * 1000 : null;
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

export {
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
};
