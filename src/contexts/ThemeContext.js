import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext(null);

export const themes = {
  light: {
    name: 'Light',
    primary: '#007cba',
    secondary: '#f8f9fa',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    accent: '#17a2b8',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    cardBg: '#ffffff',
    headerBg: 'rgba(255, 255, 255, 0.95)',
  },
  dark: {
    name: 'Dark',
    primary: '#4fc3f7',
    secondary: '#2d3436',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#404040',
    shadow: 'rgba(0, 0, 0, 0.3)',
    accent: '#26c6da',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    cardBg: '#2d2d2d',
    headerBg: 'rgba(45, 45, 45, 0.95)',
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#1e88e5',
    secondary: '#e3f2fd',
    background: '#f1f8ff',
    surface: '#ffffff',
    text: '#0d47a1',
    textSecondary: '#1565c0',
    border: '#90caf9',
    shadow: 'rgba(30, 136, 229, 0.2)',
    accent: '#039be5',
    success: '#00acc1',
    warning: '#ffb300',
    danger: '#e53935',
    cardBg: '#ffffff',
    headerBg: 'rgba(241, 248, 255, 0.95)',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#7b1fa2',
    secondary: '#f3e5f5',
    background: '#faf8ff',
    surface: '#ffffff',
    text: '#4a148c',
    textSecondary: '#7b1fa2',
    border: '#ce93d8',
    shadow: 'rgba(123, 31, 162, 0.2)',
    accent: '#8e24aa',
    success: '#00acc1',
    warning: '#ffb300',
    danger: '#e53935',
    cardBg: '#ffffff',
    headerBg: 'rgba(250, 248, 255, 0.95)',
  },
  green: {
    name: 'Nature Green',
    primary: '#388e3c',
    secondary: '#e8f5e8',
    background: '#f8fff8',
    surface: '#ffffff',
    text: '#1b5e20',
    textSecondary: '#2e7d32',
    border: '#a5d6a7',
    shadow: 'rgba(56, 142, 60, 0.2)',
    accent: '#43a047',
    success: '#66bb6a',
    warning: '#ffb300',
    danger: '#e53935',
    cardBg: '#ffffff',
    headerBg: 'rgba(248, 255, 248, 0.95)',
  },
};

const THEME_STORAGE_KEY = 'selectedTheme';

const getPreferredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && themes[stored]) {
      return stored;
    }
  } catch {
    /* ignore storage errors */
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const applyThemeToDom = (themeName) => {
  if (typeof document === 'undefined') {
    return;
  }

  const theme = themes[themeName] ?? themes.light;
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    if (key !== 'name') {
      root.style.setProperty(`--color-${key}`, value);
    }
  });

  document.body.className = `theme-${themeName}`;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => getPreferredTheme());

  useEffect(() => {
    applyThemeToDom(currentTheme);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      } catch {
        /* ignore storage errors */
      }

      window.dispatchEvent(
        new CustomEvent('themeChanged', {
          detail: {
            theme: currentTheme,
            themeData: themes[currentTheme] ?? themes.light,
          },
        }),
      );
    }
  }, [currentTheme]);

  const changeTheme = useCallback((themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      theme: themes[currentTheme] ?? themes.light,
      currentTheme,
      themes,
      changeTheme,
      toggleTheme,
    }),
    [currentTheme, changeTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
