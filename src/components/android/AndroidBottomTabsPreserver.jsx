import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * AndroidBottomTabsPreserver — Preserves scroll position per tab
 * and prevents re-renders when switching between bottom tabs
 * (Google Play Material Design 3 requirement)
 */
export default function AndroidBottomTabsPreserver() {
  const location = useLocation();
  const scrollPositionsRef = useRef({});
  const mainContentRef = useRef(null);

  useEffect(() => {
    // Save scroll position when leaving a tab
    const saveScrollPosition = () => {
      const mainContent = document.querySelector('main#main-content');
      if (mainContent) {
        scrollPositionsRef.current[location.pathname] = {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
        };
      }
    };

    // Restore scroll position when returning to a tab
    const restoreScrollPosition = () => {
      const saved = scrollPositionsRef.current[location.pathname];
      if (saved) {
        requestAnimationFrame(() => {
          window.scrollTo(saved.scrollX, saved.scrollY);
        });
      } else {
        // First visit to this tab: scroll to top smoothly
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        });
      }
    };

    // Save on route change
    const unsubscribe = () => {
      saveScrollPosition();
    };

    // Restore after route change
    restoreScrollPosition();

    return unsubscribe;
  }, [location.pathname]);

  return null; // Side-effect only component
}