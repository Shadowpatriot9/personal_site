import { NextResponse } from 'next/server';
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  getTokenExpiry,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { refreshToken } = body || {};
  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const payload = {
      username: decoded.username as string,
      role: decoded.role as string,
    };

    const token = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);

    return NextResponse.json({
      message: 'Token refreshed',
      token,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_TTL,
      refreshExpiresIn: REFRESH_TOKEN_TTL,
      tokenExpiresAt: getTokenExpiry(token),
      refreshExpiresAt: getTokenExpiry(newRefreshToken),
      user: { username: payload.username, role: payload.role },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
