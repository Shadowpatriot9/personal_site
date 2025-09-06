// Centralized logging utility for the entire site

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

    console.log('\n' + '='.repeat(60));
    console.log('📊 PAGE VIEW LOGGED');
    console.log('Page:', pageName);
    console.log('Time:', logData.timestamp);
    console.log('URL:', logData.url);
    console.log('Referrer:', logData.referrer);
    console.log('Screen/Window:', `${logData.screenSize} / ${logData.windowSize}`);
    if (Object.keys(additionalData).length > 0) {
      console.log('Additional Data:', additionalData);
    }
    console.log('='.repeat(60));

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

    console.log('🖱️ USER INTERACTION:', action);
    console.log('Element:', element);
    console.log('Time:', logData.timestamp);
    console.log('Page:', logData.page);
    if (Object.keys(additionalData).length > 0) {
      console.log('Data:', additionalData);
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

    console.error('\n' + '❌'.repeat(20));
    console.error('🚨 ERROR LOGGED');
    console.error('Type:', errorType);
    console.error('Message:', logData.message);
    console.error('Page:', logData.page);
    console.error('Time:', logData.timestamp);
    console.error('Stack:', logData.stack);
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

    console.log('⚡ PERFORMANCE METRIC:', metric);
    console.log('Value:', `${value} ${unit}`);
    console.log('Page:', logData.page);
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
    console.log('🧹 All logs cleared');
  }
};

export default logger;
