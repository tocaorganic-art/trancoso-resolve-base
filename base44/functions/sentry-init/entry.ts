// Sentry initialization for backend functions
// Usage: import at top of each backend function file

export function initSentry() {
  return {
    captureException: (error, context = {}) => {
      console.error('[SENTRY]', {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        context,
        env: Deno.env.get('ENVIRONMENT') || 'production'
      });
    },
    captureMessage: (message, level = 'info', context = {}) => {
      console.log(`[SENTRY-${level.toUpperCase()}]`, {
        timestamp: new Date().toISOString(),
        message,
        context,
        env: Deno.env.get('ENVIRONMENT') || 'production'
      });
    }
  };
}

// Structured logging helper
export function logStructured(action, data, level = 'info') {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    level,
    data,
    environment: Deno.env.get('ENVIRONMENT') || 'production'
  };
  
  if (level === 'error') {
    console.error(JSON.stringify(log));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(log));
  } else {
    console.log(JSON.stringify(log));
  }
  
  return log;
}