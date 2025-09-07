import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme definitions
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
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [theme, setTheme] = useState(themes.light);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
      setTheme(themes[savedTheme]);
      applyThemeToDOM(themes[savedTheme]);
    } else {
      // Check system preference for dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setCurrentTheme(defaultTheme);
      setTheme(themes[defaultTheme]);
      applyThemeToDOM(themes[defaultTheme]);
    }
  }, []);

  // Apply theme to DOM via CSS custom properties
  const applyThemeToDOM = (themeObj) => {
    const root = document.documentElement;
    Object.entries(themeObj).forEach(([key, value]) => {
      if (key !== 'name') {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Add theme class to body
    document.body.className = `theme-${currentTheme}`;
  };

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      setTheme(themes[themeName]);
      localStorage.setItem('selectedTheme', themeName);
      applyThemeToDOM(themes[themeName]);
      
      // Log theme change
      console.log('🎨 Theme changed to:', themes[themeName].name);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: themeName, themeData: themes[themeName] }
      }));
    }
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    changeTheme(nextTheme);
  };

  const value = {
    theme,
    currentTheme,
    themes,
    changeTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
