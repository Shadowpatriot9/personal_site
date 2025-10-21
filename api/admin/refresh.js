import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  getTokenExpiry,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '../_lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenPayload = {
      username: decoded.username,
      role: decoded.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = createAccessToken(tokenPayload);
    const newRefreshToken = createRefreshToken(tokenPayload);
    const tokenExpiresAt = getTokenExpiry(token);
    const refreshExpiresAt = getTokenExpiry(newRefreshToken);

    res.status(200).json({
      message: 'Token refreshed',
      token,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRATION,
      refreshExpiresIn: REFRESH_TOKEN_EXPIRATION,
      tokenExpiresAt,
      refreshExpiresAt,
      user: { username: tokenPayload.username, role: tokenPayload.role },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}
