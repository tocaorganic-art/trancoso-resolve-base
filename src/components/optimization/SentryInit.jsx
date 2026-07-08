import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Simple error tracking without external dependencies
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
  }

  captureException(error, context = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack || '',
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errors.push(errorData);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', errorData);
    }

    // Send to backend if available
    this.sendToBackend(errorData);
  }

  async sendToBackend(errorData) {
    try {
      await base44.functions.invoke('logError', errorData);
    } catch (e) {
      // Silent fail - don't create infinite loops
    }
  }

  captureMessage(message, level = 'info', context = {}) {
    const logData = {
      timestamp: new Date().toISOString(),
      message,
      level,
      context,
      url: window.location.href
    };

    if (import.meta.env.DEV) {
      console[level]('Message tracked:', logData);
    }
  }
}

export const errorTracker = new ErrorTracker();

export default function SentryInit() {
  useEffect(() => {
    // Global error handler
    window.addEventListener('error', (event) => {
      errorTracker.captureException(event.error, {
        type: 'uncaught_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      errorTracker.captureException(event.reason, {
        type: 'unhandled_rejection'
      });
    });

    return () => {
      window.removeEventListener('error', errorTracker.captureException);
      window.removeEventListener('unhandledrejection', errorTracker.captureException);
    };
  }, []);

  return null;
}