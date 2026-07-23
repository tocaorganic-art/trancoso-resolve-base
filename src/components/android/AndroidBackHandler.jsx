import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AndroidBackHandler — Implements native Android back button behavior
 * for proper back stack management and exit confirmation
 */
export default function AndroidBackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const backStack = typeof window !== 'undefined' ? window.__backStack || [] : [];

  useEffect(() => {
    // Initialize back stack on mount
    if (typeof window !== 'undefined') {
      window.__backStack = window.__backStack || [];
      // Add current route to stack if not already there
      if (!window.__backStack.includes(location.pathname)) {
        window.__backStack.push(location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    // Track route changes for back stack
    if (typeof window !== 'undefined') {
      const stack = window.__backStack || [];
      const lastRoute = stack[stack.length - 1];

      // Only add if different from last
      if (lastRoute !== location.pathname) {
        stack.push(location.pathname);
        // Limit stack to 50 entries to prevent memory issues
        if (stack.length > 50) {
          stack.shift();
        }
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    // Handle physical back button (Android)
    const handleBackButton = (e) => {
      const stack = window.__backStack || [];

      // Home page: exit app (Android behavior)
      if (location.pathname === '/') {
        // Signal to native layer that app should exit
        if (window.Android && window.Android.exitApp) {
          window.Android.exitApp();
        } else if (navigator.app && navigator.app.exitApp) {
          navigator.app.exitApp();
        }
        return;
      }

      // Any other page: go back
      if (stack.length > 1) {
        stack.pop(); // Remove current
        const previousRoute = stack[stack.length - 1];
        navigate(previousRoute, { replace: true });
      } else {
        // No back history, go to home
        navigate('/', { replace: true });
      }
    };

    // Listen for backbutton event (Capacitor/Cordova)
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('backbutton', handleBackButton);
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('backbutton', handleBackButton);
      }
    };
  }, [location.pathname, navigate]);

  return null; // This is a side-effect only component
}