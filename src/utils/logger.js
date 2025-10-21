const isBrowser = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

let enableDebugLogs = isDevelopment;

if (isBrowser) {
  try {
    enableDebugLogs = isDevelopment || window.localStorage.getItem('enableDebugLogs') === 'true';
  } catch {
    enableDebugLogs = isDevelopment;
  }
}

const safeLog = (message, data = null, type = 'log') => {
  if (!enableDebugLogs || typeof console === 'undefined') {
    return;
  }

  if (data !== null) {
    console[type](message, data);
  } else {
    console[type](message);
  }
};

const getPageMetadata = () => {
  if (!isBrowser) {
    return {
      url: '',
      referrer: '',
      userAgent: '',
      screenSize: '',
      windowSize: '',
    };
  }

  const url = window.location?.href ?? '';
  const referrer = document?.referrer || 'Direct';
  const userAgent = window.navigator?.userAgent ?? '';
  const screenSize = window.screen ? `${window.screen.width}x${window.screen.height}` : '';
  const windowSize = `${window.innerWidth}x${window.innerHeight}`;

  return { url, referrer, userAgent, screenSize, windowSize };
};

const persistPageView = (logData) => {
  if (!isBrowser || typeof window.sessionStorage === 'undefined') {
    return;
  }

  try {
    const existingLogs = JSON.parse(window.sessionStorage.getItem('pageViews') || '[]');
    const nextLogs = [...existingLogs, logData].slice(-50);
    window.sessionStorage.setItem('pageViews', JSON.stringify(nextLogs));
  } catch (storageError) {
    safeLog('Failed to persist page view log', storageError, 'warn');
  }
};

export const logger = {
  pageView: (pageName, additionalData = {}) => {
    const timestamp = new Date().toISOString();
    const context = getPageMetadata();
    const logData = {
      type: 'PAGE_VIEW',
      page: pageName,
      timestamp,
      ...context,
      ...additionalData,
    };

    safeLog('\n' + '='.repeat(60));
    safeLog('📊 PAGE VIEW LOGGED');
    safeLog('Page:', pageName);
    safeLog('Time:', timestamp);
    safeLog('URL:', context.url);
    safeLog('Referrer:', context.referrer);
    safeLog('Screen/Window:', `${context.screenSize} / ${context.windowSize}`);
    if (Object.keys(additionalData).length > 0) {
      safeLog('Additional Data:', additionalData);
    }
    safeLog('='.repeat(60));

    persistPageView(logData);
  },

  interaction: (action, element, additionalData = {}) => {
    const timestamp = new Date().toISOString();
    const page = isBrowser ? window.location?.pathname ?? '' : '';

    safeLog('🖱️ USER INTERACTION:', action);
    safeLog('Element:', element);
    safeLog('Time:', timestamp);
    safeLog('Page:', page);
    if (Object.keys(additionalData).length > 0) {
      safeLog('Data:', additionalData);
    }
  },

  error: (errorType, error, context = {}) => {
    const message = error?.message ?? error;
    const stack = error?.stack ?? 'No stack trace';
    const timestamp = new Date().toISOString();
    const page = isBrowser ? window.location?.pathname ?? '' : '';

    if (typeof console !== 'undefined') {
      console.error('\n' + '❌'.repeat(20));
      console.error('🚨 ERROR LOGGED');
      console.error('Type:', errorType);
      console.error('Message:', message);
      console.error('Page:', page);
      console.error('Time:', timestamp);
      if (enableDebugLogs) {
        console.error('Stack:', stack);
      }
      if (Object.keys(context).length > 0) {
        console.error('Context:', context);
      }
      console.error('❌'.repeat(20));
    }
  },

  performance: (metric, value, unit = 'ms') => {
    const page = isBrowser ? window.location?.pathname ?? '' : '';
    safeLog('⚡ PERFORMANCE METRIC:', metric);
    safeLog('Value:', `${value} ${unit}`);
    safeLog('Page:', page);
  },

  getLogs: () => {
    if (!isBrowser || typeof window.sessionStorage === 'undefined') {
      return [];
    }

    try {
      return JSON.parse(window.sessionStorage.getItem('pageViews') || '[]');
    } catch {
      return [];
    }
  },

  clearLogs: () => {
    if (!isBrowser || typeof window.sessionStorage === 'undefined') {
      return;
    }
    window.sessionStorage.removeItem('pageViews');
    safeLog('🧹 All logs cleared');
  },
};

export default logger;
