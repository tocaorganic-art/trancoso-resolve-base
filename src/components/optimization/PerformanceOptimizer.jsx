import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Send performance metrics to backend periodically
    const sendMetrics = async () => {
      try {
        if (!window.performance) return;

        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        // Core Web Vitals approximation
        const metrics = {
          pageLoadTime,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          firstPaint: window.performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          timestamp: new Date().toISOString()
        };

        // Send to backend for monitoring (non-blocking)
        base44.functions.invoke('logPerformance', metrics).catch(() => {
          // Silent fail
        });
      } catch (e) {
        // Silent fail
      }
    };

    // Wait for page load, then send metrics
    if (document.readyState === 'complete') {
      setTimeout(sendMetrics, 2000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(sendMetrics, 2000);
      }, { once: true });
    }

    // Image lazy loading polyfill
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }, []);

  return null;
}