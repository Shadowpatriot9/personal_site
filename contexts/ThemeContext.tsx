'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface Theme {
  name: string;
  background: string;
  surface: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  cardBg: string;
  headerBg: string;
  headerText: string;
  projectCard: string;
  projectCardHover: string;
  sectionHover: string;
  footerGraphic: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
}

export const themes: Record<string, Theme> = {
  classic: {
    name: 'Light',
    background: '#ececee',
    surface: '#f6f6f8',
    secondary: '#e4e4e8',
    text: '#1d1d1f',
    textSecondary: '#6e6e73',
    border: '#d9d9de',
    shadow: 'rgba(17, 17, 20, 0.10)',
    cardBg: '#ffffff',
    headerBg: '#1d1d1f',
    headerText: '#ffffff',
    projectCard: '#ffffff',
    projectCardHover: '#ffffff',
    sectionHover: '#1d1d1f',
    footerGraphic: '#1d1d1f',
    primary: '#0066cc',
    accent: '#0066cc',
    success: '#2ca24d',
    warning: '#b7791f',
    danger: '#d1483f',
  },
  dark: {
    name: 'Dark',
    background: '#0b0b0d',
    surface: '#161618',
    secondary: '#202024',
    text: '#f5f5f7',
    textSecondary: '#98989f',
    border: '#2a2a30',
    shadow: 'rgba(0, 0, 0, 0.6)',
    cardBg: '#161618',
    headerBg: '#000000',
    headerText: '#f5f5f7',
    projectCard: '#161618',
    projectCardHover: '#161618',
    sectionHover: '#f5f5f7',
    footerGraphic: '#161618',
    primary: '#2997ff',
    accent: '#2997ff',
    success: '#30d158',
    warning: '#ffd60a',
    danger: '#ff453a',
  },
};

const THEME_STORAGE_KEY = 'selectedTheme';
const DEFAULT_THEME = 'classic';

const getPreferredTheme = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && themes[stored]) {
      return stored;
    }
  } catch {
    /* ignore storage errors */
  }

  return DEFAULT_THEME;
};

const applyThemeToDom = (themeName: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  const theme = themes[themeName] ?? themes[DEFAULT_THEME];
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    if (key !== 'name') {
      root.style.setProperty(`--color-${key}`, value);
    }
  });

  document.body.className = `theme-${themeName}`;
};

interface ThemeContextValue {
  theme: Theme;
  currentTheme: string;
  themes: Record<string, Theme>;
  changeTheme: (themeName: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>(DEFAULT_THEME);

  useEffect(() => {
    setCurrentTheme(getPreferredTheme());
  }, []);

  useEffect(() => {
    applyThemeToDom(currentTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    } catch {
      /* ignore storage errors */
    }

    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: {
          theme: currentTheme,
          themeData: themes[currentTheme] ?? themes[DEFAULT_THEME],
        },
      }),
    );
  }, [currentTheme]);

  const changeTheme = useCallback((themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prev) => (prev === 'classic' ? 'dark' : 'classic'));
  }, []);

  const value = useMemo(
    () => ({
      theme: themes[currentTheme] ?? themes[DEFAULT_THEME],
      currentTheme,
      themes,
      changeTheme,
      toggleTheme,
    }),
    [currentTheme, changeTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
