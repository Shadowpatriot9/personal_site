'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void | Promise<void>;
  error?: string | null;
  isSubmitting?: boolean;
}

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 2.5-.3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AdminLogin = ({ onLogin, error, isSubmitting = false }: AdminLoginProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onLogin(String(data.get('username') || ''), String(data.get('password') || ''));
  };

  return (
    <div className="admin-login">
      <div className="admin-login__bg" aria-hidden="true" />

      <div className="admin-login-card">
        <span className="admin-login-badge" aria-hidden="true">
          GS
        </span>
        <h1>Welcome back</h1>
        <p>Sign in to manage your portfolio catalog.</p>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              name="username"
              type="text"
              required
              autoComplete="username"
              autoFocus
              placeholder="admin"
            />
          </div>

          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="input-affix">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="input-affix__action"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <line x1="12" y1="7.5" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="primary-btn login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link href="/" className="admin-back-link">
          ← Return to site
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
