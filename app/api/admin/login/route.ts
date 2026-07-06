import { NextResponse } from 'next/server';
import {
  verifyCredentials,
  createAccessToken,
  createRefreshToken,
  getTokenExpiry,
} from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiting (per serverless instance).
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const checkRateLimit = (clientIP: string) => {
  const now = Date.now();
  const attempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: now };
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    attempts.count = 0;
  }
  return attempts.count < MAX_ATTEMPTS;
};

const recordAttempt = (clientIP: string, success: boolean) => {
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

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
};

export async function POST(request: Request) {
  const clientIP =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil(LOCKOUT_TIME / 60000),
      },
      { status: 429, headers: securityHeaders },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: securityHeaders },
    );
  }

  const { username, password } = body || {};
  if (!username || !password) {
    recordAttempt(clientIP, false);
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400, headers: securityHeaders },
    );
  }

  try {
    const valid = verifyCredentials(username, password);

    if (!valid) {
      recordAttempt(clientIP, false);
      // Small random delay to blunt timing/enumeration.
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 200));
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401, headers: securityHeaders },
      );
    }

    recordAttempt(clientIP, true);

    const normalizedUsername = String(username).trim().toLowerCase();
    const payload = { sub: normalizedUsername, username: normalizedUsername, role: 'admin' };
    const token = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        refreshToken,
        user: { username: normalizedUsername, role: 'admin' },
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        refreshExpiresIn: REFRESH_TOKEN_TTL_SECONDS,
        tokenExpiresAt: getTokenExpiry(token),
        refreshExpiresAt: getTokenExpiry(refreshToken),
      },
      { headers: securityHeaders },
    );
  } catch (error) {
    console.error('Admin login error:', error);
    recordAttempt(clientIP, false);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500, headers: securityHeaders },
    );
  }
}
