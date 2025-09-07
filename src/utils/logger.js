// Centralized logging utility for the entire site
// Production-safe with conditional console output

const isDevelopment = process.env.NODE_ENV === 'development';
const enableDebugLogs = isDevelopment || localStorage.getItem('enableDebugLogs') === 'true';

// Helper function for safe console logging
function safeLog(message, data = null, type = 'log') {
  if (enableDebugLogs) {
    if (data) {
      console[type](message, data);
    } else {
      console[type](message);
    }
  }
}

export const logger = {
  // Page view logging
  pageView: (pageName, additionalData = {}) => {
    const logData = {
      type: 'PAGE_VIEW',
      page: pageName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'Direct',
      screenSize: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      ...additionalData
    };

    safeLog('\n' + '='.repeat(60));
    safeLog('📊 PAGE VIEW LOGGED');
    safeLog('Page:', pageName);
    safeLog('Time:', logData.timestamp);
    safeLog('URL:', logData.url);
    safeLog('Referrer:', logData.referrer);
    safeLog('Screen/Window:', `${logData.screenSize} / ${logData.windowSize}`);
    if (Object.keys(additionalData).length > 0) {
      safeLog('Additional Data:', additionalData);
    }
    safeLog('='.repeat(60));

    // Store in sessionStorage for potential analytics
    try {
      const existingLogs = JSON.parse(sessionStorage.getItem('pageViews') || '[]');
      existingLogs.push(logData);
      // Keep only last 50 page views
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      sessionStorage.setItem('pageViews', JSON.stringify(existingLogs));
    } catch (error) {
      console.warn('Failed to store page view log:', error);
    }
  },

  // User interaction logging
  interaction: (action, element, additionalData = {}) => {
    const logData = {
      type: 'USER_INTERACTION',
      action,
      element,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      ...additionalData
    };

    safeLog('🖱️ USER INTERACTION:', action);
    safeLog('Element:', element);
    safeLog('Time:', logData.timestamp);
    safeLog('Page:', logData.page);
    if (Object.keys(additionalData).length > 0) {
      safeLog('Data:', additionalData);
    }
  },

  // Error logging
  error: (errorType, error, context = {}) => {
    const logData = {
      type: 'ERROR',
      errorType,
      message: error.message || error,
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      ...context
    };

    // Always log errors, even in production
    console.error('\n' + '❌'.repeat(20));
    console.error('🚨 ERROR LOGGED');
    console.error('Type:', errorType);
    console.error('Message:', logData.message);
    console.error('Page:', logData.page);
    console.error('Time:', logData.timestamp);
    if (enableDebugLogs) {
      console.error('Stack:', logData.stack);
    }
    console.error('❌'.repeat(20));
  },

  // Performance logging
  performance: (metric, value, unit = 'ms') => {
    const logData = {
      type: 'PERFORMANCE',
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };

    safeLog('⚡ PERFORMANCE METRIC:', metric);
    safeLog('Value:', `${value} ${unit}`);
    safeLog('Page:', logData.page);
  },

  // Get all stored logs
  getLogs: () => {
    try {
      return JSON.parse(sessionStorage.getItem('pageViews') || '[]');
    } catch {
      return [];
    }
  },

  // Clear all logs
  clearLogs: () => {
    sessionStorage.removeItem('pageViews');
    safeLog('🧹 All logs cleared');
  }
};

export default logger;
