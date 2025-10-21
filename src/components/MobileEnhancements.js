import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

const SCROLL_LOG_INTERVAL = 25; // percent

const MobileEnhancements = () => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const lastLoggedBucket = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') {
        return false;
      }
      const widthIsMobile = window.innerWidth <= 768;
      const userAgentIsMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator?.userAgent || '',
      );
      const mobile = widthIsMobile || userAgentIsMobile;
      setIsMobile(mobile);
      if (mobile) {
        logger.interaction('mobile-detected', 'mobile-enhancements', {
          screenWidth: window.innerWidth,
          userAgent: window.navigator?.userAgent,
          touchDevice: 'ontouchstart' in window,
        });
      }
      return mobile;
    };

    checkMobile();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') {
      setShowScrollTop(false);
      return undefined;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = pageHeight > 0 ? (currentScrollY / pageHeight) * 100 : 0;
      const bucket = Math.floor(scrollPercentage / SCROLL_LOG_INTERVAL);

      setShowScrollTop(currentScrollY > 300);
      setLastScrollY(currentScrollY);

      if (bucket !== lastLoggedBucket.current && scrollPercentage > 0) {
        lastLoggedBucket.current = bucket;
        logger.interaction('scroll-depth', 'mobile-enhancements', {
          scrollPercentage: Math.min(100, Math.round(scrollPercentage)),
          isMobile,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || typeof document === 'undefined') {
      return undefined;
    }

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchEnd = (event) => {
      if (!touchStartX && !touchStartY) {
        return;
      }

      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        logger.interaction(deltaX > 0 ? 'swipe-right' : 'swipe-left', 'mobile-gestures', {
          distance: Math.abs(deltaX),
        });
      } else if (Math.abs(deltaY) > minSwipeDistance) {
        logger.interaction(deltaY > 0 ? 'swipe-down' : 'swipe-up', 'mobile-gestures', {
          distance: Math.abs(deltaY),
        });
      }

      touchStartX = 0;
      touchStartY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  if (!isMobile) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      logger.interaction('scroll-to-top', 'mobile-enhancements', { fromPosition: lastScrollY });
    }
  };

  return (
    <>
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: theme.primary,
            color: theme.background,
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: `0 4px 12px ${theme.shadow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
          }}
          onTouchStart={(event) => {
            event.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(event) => {
            event.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ↑
        </button>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '20px',
          right: '20px',
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 999,
          boxShadow: `0 4px 12px ${theme.shadow}`,
          opacity: showScrollTop ? 0.9 : 0,
          transform: showScrollTop ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.3s ease',
          pointerEvents: showScrollTop ? 'auto' : 'none',
        }}
      >
        <button
          type="button"
          onClick={() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            logger.interaction('mobile-nav', 'quick-nav', { section: 'about' });
          }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            fontSize: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>👋</div>
          About
        </button>

        <button
          type="button"
          onClick={() => {
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            logger.interaction('mobile-nav', 'quick-nav', { section: 'projects' });
          }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            fontSize: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>🚀</div>
          Projects
        </button>

        <button
          type="button"
          onClick={() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            logger.interaction('mobile-nav', 'quick-nav', { section: 'contact' });
          }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.text,
            fontSize: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>📧</div>
          Contact
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .theme-switcher {
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 1001 !important;
          }

          .header1 {
            padding: 10px !important;
            text-align: center !important;
          }

          .project-search {
            padding: 16px !important;
          }

          .contact-form {
            padding: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .project-search .form-row,
          .contact-form .form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default MobileEnhancements;
