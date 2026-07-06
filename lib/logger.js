const isBrowser = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

let debugEnabled = isDevelopment;

if (isBrowser) {
  try {
    debugEnabled = isDevelopment || window.localStorage.getItem('enableDebugLogs') === 'true';
  } catch {
    debugEnabled = isDevelopment;
  }
}

const write = (type, message, data) => {
  if (!debugEnabled || typeof console === 'undefined') {
    return;
  }
  if (data !== undefined && data !== null) {
    console[type](message, data);
  } else {
    console[type](message);
  }
};

const persistPageView = (entry) => {
  if (!isBrowser || typeof window.sessionStorage === 'undefined') {
    return;
  }
  try {
    const existing = JSON.parse(window.sessionStorage.getItem('pageViews') || '[]');
    const next = [...existing, entry].slice(-50);
    window.sessionStorage.setItem('pageViews', JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
};

export const logger = {
  pageView(page, data = {}) {
    const entry = { type: 'pageView', page, timestamp: new Date().toISOString(), ...data };
    write('log', `[pageView] ${page}`, data);
    persistPageView(entry);
  },

  interaction(action, element, data = {}) {
    write('log', `[interaction] ${action} on ${element}`, data);
  },

  error(type, error, context = {}) {
    if (typeof console === 'undefined') {
      return;
    }
    console.error(`[error] ${type}: ${error?.message ?? error}`, context);
    if (debugEnabled && error?.stack) {
      console.error(error.stack);
    }
  },

  performance(metric, value, unit = 'ms') {
    write('log', `[performance] ${metric}: ${value}${unit}`);
  },

  getLogs() {
    if (!isBrowser || typeof window.sessionStorage === 'undefined') {
      return [];
    }
    try {
      return JSON.parse(window.sessionStorage.getItem('pageViews') || '[]');
    } catch {
      return [];
    }
  },

  clearLogs() {
    if (isBrowser && typeof window.sessionStorage !== 'undefined') {
      window.sessionStorage.removeItem('pageViews');
    }
  },
};

export default logger;
