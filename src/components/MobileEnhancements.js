import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

const MobileEnhancements = () => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      if (mobile) {
        logger.interaction('mobile-detected', 'mobile-enhancements', {
          screenWidth: window.innerWidth,
          userAgent: navigator.userAgent,
          touchDevice: 'ontouchstart' in window
        });
      }
    };

    // Handle scroll for mobile features
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide scroll to top button
      setShowScrollTop(currentScrollY > 300);
      
      // Log scroll depth for analytics
      const scrollPercentage = (currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 0 && scrollPercentage % 25 < 1) { // Log every 25%
        logger.interaction('scroll-depth', 'mobile-enhancements', {
          scrollPercentage: Math.round(scrollPercentage),
          isMobile
        });
      }

      setLastScrollY(currentScrollY);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    logger.interaction('scroll-to-top', 'mobile-enhancements', { fromPosition: lastScrollY });
  };

  // Add mobile-specific touch gestures
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (!touchStartX || !touchStartY) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Detect swipe gestures
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        // Horizontal swipe
        if (deltaX > 0) {
          logger.interaction('swipe-right', 'mobile-gestures', { distance: deltaX });
        } else {
          logger.interaction('swipe-left', 'mobile-gestures', { distance: Math.abs(deltaX) });
        }
      } else if (Math.abs(deltaY) > minSwipeDistance) {
        // Vertical swipe
        if (deltaY > 0) {
          logger.interaction('swipe-down', 'mobile-gestures', { distance: deltaY });
        } else {
          logger.interaction('swipe-up', 'mobile-gestures', { distance: Math.abs(deltaY) });
        }
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

  if (!isMobile) return null;

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
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
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ↑
        </button>
      )}

      {/* Mobile Navigation Helper */}
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

      {/* Mobile-specific CSS */}
      <style jsx>{`
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
          .project-search .form-row {
            grid-template-columns: 1fr !important;
          }
          
          .contact-form .form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default MobileEnhancements;
