import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

const ThemeSwitcher = ({ className = '', style = {} }) => {
  const { theme, currentTheme, themes, changeTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setIsOpen(false);
    logger.interaction('theme-change', 'theme-switcher', { 
      from: currentTheme, 
      to: themeName,
      themeName: themes[themeName].name 
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    logger.interaction('click', 'theme-switcher-toggle', { isOpen: !isOpen });
  };

  return (
    <div 
      className={`theme-switcher ${className}`} 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        ...style 
      }}
    >
      {/* Quick toggle button */}
      <button
        onClick={toggleTheme}
        style={{
          background: theme.primary,
          color: theme.background,
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          marginRight: '8px',
          transition: 'all 0.3s ease',
          boxShadow: `0 2px 8px ${theme.shadow}`,
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {currentTheme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Theme selector dropdown */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={toggleDropdown}
          style={{
            background: theme.surface,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: `0 2px 4px ${theme.shadow}`,
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = theme.secondary}
          onMouseOut={(e) => e.target.style.backgroundColor = theme.surface}
        >
          <div 
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: theme.primary,
              border: `2px solid ${theme.background}`,
              boxShadow: `0 0 0 1px ${theme.border}`,
            }}
          />
          {theme.name}
          <span style={{ 
            marginLeft: '4px',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              boxShadow: `0 8px 24px ${theme.shadow}`,
              zIndex: 1000,
              minWidth: '160px',
              marginTop: '4px',
              animation: 'slideDown 0.3s ease',
            }}
          >
            {Object.entries(themes).map(([key, themeData]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: currentTheme === key ? theme.primary : 'transparent',
                  color: currentTheme === key ? theme.background : theme.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  borderRadius: key === 'light' ? '8px 8px 0 0' : 
                             key === 'green' ? '0 0 8px 8px' : '0',
                }}
                onMouseOver={(e) => {
                  if (currentTheme !== key) {
                    e.target.style.backgroundColor = theme.secondary;
                  }
                }}
                onMouseOut={(e) => {
                  if (currentTheme !== key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: themeData.primary,
                    border: `2px solid ${theme.background}`,
                    boxShadow: `0 0 0 1px ${theme.border}`,
                  }}
                />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {themeData.name}
                </span>
                {currentTheme === key && (
                  <span style={{ fontSize: '12px' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

ThemeSwitcher.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
};

export default ThemeSwitcher;
