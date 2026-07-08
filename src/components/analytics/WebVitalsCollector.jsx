/**
 * Coleta Web Vitals (LCP, CLS, TTFB, loadTime) usando Performance API nativa
 * e envia para logPerformance 1x por sessão por página.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logPerformance } from '@/functions/logPerformance';

const SESSION_KEY = 'wv_reported_pages';

function getReportedPages() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'); } catch { return []; }
}
function markReported(page) {
  const pages = getReportedPages();
  if (!pages.includes(page)) {
    pages.push(page);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(pages));
  }
}

export default function WebVitalsCollector() {
  const location = useLocation();
  const reportedRef = useRef(false);

  useEffect(() => {
    reportedRef.current = false;
  }, [location.pathname]);

  useEffect(() => {
    const page = location.pathname;
    if (getReportedPages().includes(page)) return;

    const collected = {};
    const observers = [];

    // LCP
    if (window.PerformanceObserver) {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) {
          collected.lcp = Math.round(entries[entries.length - 1].startTime);
        }
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObs);

      // CLS
      let clsScore = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) clsScore += entry.value;
        }
        collected.cls = Math.round(clsScore * 1000) / 1000;
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObs);
    }

    // TTFB + loadTime via Navigation Timing API
    const sendMetrics = () => {
      if (reportedRef.current) return;
      reportedRef.current = true;

      const nav = performance.getEntriesByType?.('navigation')?.[0];
      if (nav) {
        collected.ttfb = Math.round(nav.responseStart - nav.requestStart);
        collected.loadTime = Math.round(nav.loadEventEnd - nav.startTime);
      }

      markReported(page);
      observers.forEach((obs) => { try { obs.disconnect(); } catch {} });

      logPerformance({
        page,
        lcp: collected.lcp || null,
        fid: null, // FID requer interação do usuário
        cls: collected.cls ?? null,
        ttfb: collected.ttfb || null,
        loadTime: collected.loadTime || null,
        timestamp: Date.now(),
      }).catch(() => {});
    };

    if (document.readyState === 'complete') {
      setTimeout(sendMetrics, 3000); // aguarda LCP estabilizar
    } else {
      window.addEventListener('load', () => setTimeout(sendMetrics, 3000), { once: true });
    }

    return () => {
      observers.forEach((obs) => { try { obs.disconnect(); } catch {} });
    };
  }, [location.pathname]);

  return null;
}