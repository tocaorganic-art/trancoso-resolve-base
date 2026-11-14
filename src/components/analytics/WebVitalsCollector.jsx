/**
 * Coleta Web Vitals (LCP, CLS, TTFB, loadTime) usando Performance API nativa
 * e envia para logPerformance 1x por sessão por página.
 *
 * IMPORTANTE (fix 22/10/2026): TTFB, LOADTIME e as entradas "buffered" de
 * LCP/CLS pertencem exclusivamente à rota onde a sessão carregou
 * (INITIAL_LOAD_PATH). Em rotas SPA (navegação interna), o
 * PerformanceNavigationTiming continua sendo o do carregamento inicial —
 * atribuí-lo à nova rota gerava alertas falsos com valores idênticos em
 * páginas diferentes. Rotas SPA reportam apenas LCP/CLS coletados a partir
 * da própria troca de rota (sem buffered), e ttfb/loadTime = null.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  sanitizeWebVitals,
  hasReportableMetric,
  computeTtfb,
  computeLoadTime,
  createHiddenTimeTracker,
} from '@/lib/web-vitals-guard';

const SESSION_KEY = 'wv_reported_pages';

// Caminho da rota onde o documento foi carregado (dono do navigation timing).
// Capturado uma vez, na carga inicial do bundle, antes de qualquer navegação SPA.
const INITIAL_LOAD_PATH = window.location.pathname;

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

    const isInitialPage = page === INITIAL_LOAD_PATH;
    const collected = {};
    const observers = [];
    // Quanto tempo a aba ficou oculta desde a carga deste documento.
    const stopHiddenTracker = createHiddenTimeTracker();

    // LCP
    if (window.PerformanceObserver) {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) {
          collected.lcp = Math.round(entries[entries.length - 1].startTime);
        }
      });
      // buffered só na página inicial: entradas antigas não pertencem a rotas SPA
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: isInitialPage });
      observers.push(lcpObs);

      // CLS
      let clsScore = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) clsScore += entry.value;
        }
        collected.cls = Math.round(clsScore * 1000) / 1000;
      });
      clsObs.observe({ type: 'layout-shift', buffered: isInitialPage });
      observers.push(clsObs);
    }

    // TTFB + loadTime via Navigation Timing API — apenas para a página inicial
    const sendMetrics = () => {
      if (reportedRef.current) return;
      reportedRef.current = true;

      if (isInitialPage) {
        const nav = performance.getEntriesByType?.('navigation')?.[0];
        if (nav) {
          collected.ttfb = computeTtfb(nav);
          collected.loadTime = computeLoadTime(nav);
        }
      }

      markReported(page);
      observers.forEach((obs) => { try { obs.disconnect(); } catch {} });

      const hiddenMs = stopHiddenTracker();

      // Aba em segundo plano, bfcache e restauração de sessão produzem valores
      // impossíveis. Sem nenhuma métrica confiável, nem chama a função.
      const { metrics } = sanitizeWebVitals({
        lcp: collected.lcp,
        fid: null, // FID requer interação do usuário
        cls: collected.cls,
        ttfb: collected.ttfb,
        loadTime: collected.loadTime,
        hiddenMs,
      });

      if (!hasReportableMetric(metrics)) return;

      base44.functions.invoke('logPerformance', {
        page,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        ttfb: metrics.ttfb,
        loadTime: metrics.loadTime,
        hiddenMs,
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
      stopHiddenTracker();
    };
  }, [location.pathname]);

  return null;
}
