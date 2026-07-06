'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import logger from '@/lib/logger';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line
        key={deg}
        x1="12"
        y1="2.2"
        x2="12"
        y2="4.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        transform={`rotate(${deg} 12 12)`}
      />
    ))}
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 14.2A8 8 0 0 1 9.8 4a0.7 0.7 0 0 0-0.9-0.9A9 9 0 1 0 20.9 15a0.7 0.7 0 0 0-0.9-0.8z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const ThemeSwitcher = ({ className = '' }: { className?: string }) => {
  const { currentTheme, toggleTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={() => {
        toggleTheme();
        logger.interaction('theme-toggle', 'nav', { to: isDark ? 'light' : 'dark' });
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeSwitcher;
