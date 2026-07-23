export function reportWebVitals() {
  if ('web-vital' in window) {
    return;
  }

  const reportMetric = (metric) => {
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        metric_category: metric.name,
        metric_value: Math.round(metric.value),
        metric_id: metric.id,
      });
    }
  };

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'largest-contentful-paint') {
          reportMetric({
            name: 'LCP',
            value: entry.renderTime || entry.loadTime,
            id: entry.id,
          });
        }

        if (entry.name === 'first-input') {
          reportMetric({
            name: 'FID',
            value: entry.processingDuration,
            id: entry.id,
          });
        }

        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          reportMetric({
            name: 'CLS',
            value: entry.value,
            id: entry.id,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (e) {
    console.debug('Web Vitals measurement not supported');
  }
}

export function measurePageLoad() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      if (window.gtag) {
        window.gtag('event', 'page_load_performance', {
          page_load_time: pageLoadTime,
          connect_time: connectTime,
          render_time: renderTime,
        });
      }
    }, 0);
  });
}
