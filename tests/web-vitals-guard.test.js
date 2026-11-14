import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  sanitizeWebVitals,
  hasReportableMetric,
  computeLoadTime,
  computeTtfb,
  createHiddenTimeTracker,
  MAX_HIDDEN_MS,
  PLAUSIBLE_CEILINGS,
} from '../src/lib/web-vitals-guard.js';

// Regressão 11/11/2026: o monitoramento disparava CRITICAL com valores
// fisicamente impossíveis (LCP 117032 ms, LOADTIME 586684 ms) enquanto a
// produção medida respondia em TTFB 0,17-0,65 s e LCP 0,9-2,1 s. A causa é
// atribuição de tempo de aba em segundo plano ao carregamento da página.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COLLECTOR = path.join(ROOT, 'src/components/analytics/WebVitalsCollector.jsx');

test('valores absurdos de aba em segundo plano são descartados', () => {
  const { metrics, dropped } = sanitizeWebVitals({
    lcp: 117032,
    ttfb: 5027,
    loadTime: 586684,
    cls: 0.02,
  });

  assert.equal(metrics.lcp, null);
  assert.equal(metrics.loadTime, null);
  assert.equal(metrics.ttfb, 5027, 'TTFB de 5s é alto, mas plausível e deve ser reportado');
  assert.equal(metrics.cls, 0.02);
  assert.deepEqual(dropped.sort(), ['lcp', 'loadTime']);
});

test('métricas normais de produção passam intactas', () => {
  const { metrics, dropped } = sanitizeWebVitals({
    lcp: 1780,
    fid: 42,
    cls: 0.004,
    ttfb: 244,
    loadTime: 3729,
  });

  assert.deepEqual(dropped, []);
  assert.deepEqual(metrics, { lcp: 1780, fid: 42, cls: 0.004, ttfb: 244, loadTime: 3729 });
});

test('valores negativos, ausentes e não numéricos viram null sem contar como descarte', () => {
  const { metrics, dropped } = sanitizeWebVitals({
    lcp: -1,
    fid: null,
    cls: undefined,
    ttfb: 'lento',
    loadTime: NaN,
  });

  assert.deepEqual(metrics, { lcp: null, fid: null, cls: null, ttfb: null, loadTime: null });
  assert.deepEqual(dropped, ['lcp', 'ttfb', 'loadTime']);
  assert.equal(hasReportableMetric(metrics), false);
});

test('teto de plausibilidade é aplicado exatamente no limite', () => {
  const { metrics } = sanitizeWebVitals({
    lcp: PLAUSIBLE_CEILINGS.lcp,
    loadTime: PLAUSIBLE_CEILINGS.loadTime + 1,
  });

  assert.equal(metrics.lcp, PLAUSIBLE_CEILINGS.lcp);
  assert.equal(metrics.loadTime, null);
});

test('loadTime não é calculado quando o evento load ainda não terminou', () => {
  assert.equal(computeLoadTime({ startTime: 0, loadEventEnd: 0 }), null);
  assert.equal(computeLoadTime({ startTime: 0, loadEventEnd: 3729 }), 3729);
  assert.equal(computeLoadTime(undefined), null);
});

test('TTFB realista é preservado e TTFB impossível é descartado', () => {
  assert.equal(computeTtfb({ requestStart: 12, responseStart: 244 }), 232);
  assert.equal(computeTtfb({ requestStart: 0, responseStart: 0 }), null);
  assert.equal(computeTtfb({ requestStart: 10, responseStart: 10 + PLAUSIBLE_CEILINGS.ttfb + 1 }), null);
});

test('o coletor usa o guarda antes de chamar logPerformance', async () => {
  const source = await readFile(COLLECTOR, 'utf8');

  assert.match(source, /sanitizeWebVitals/, 'collector deve sanitizar as métricas');
  assert.match(source, /hasReportableMetric/, 'collector deve pular o envio quando nada é confiável');
  assert.match(source, /computeLoadTime/, 'collector deve usar computeLoadTime em vez de nav.loadEventEnd cru');
  assert.doesNotMatch(
    source,
    /Math\.round\(nav\.loadEventEnd - nav\.startTime\)/,
    'cálculo cru de loadTime foi a origem dos valores de 586684 ms',
  );
});

// Regressão 13/11/2026: mesmo com os tetos de plausibilidade, a home disparou
// CRITICAL com LCP 46376 ms e LOADTIME 48066 ms. Os dois valores estão abaixo
// do teto antigo (60 s / 120 s), então passavam. A causa continuava a mesma:
// aba oculta, agora por cerca de 45 s. A duração da ocultação precisa invalidar
// as métricas de tempo antes dos tetos entrarem em ação.

test('aba oculta por mais de 1s invalida LCP e loadTime', () => {
  const { metrics, dropped } = sanitizeWebVitals({
    lcp: 46376,
    loadTime: 48066,
    ttfb: 520,
    cls: 0.01,
    hiddenMs: 45000,
  });

  assert.equal(metrics.lcp, null);
  assert.equal(metrics.loadTime, null);
  assert.equal(metrics.ttfb, 520, 'TTFB não é afetado por aba oculta');
  assert.equal(metrics.cls, 0.01, 'CLS não é afetado por aba oculta');
  assert.deepEqual(dropped.sort(), ['lcp', 'loadTime']);
});

test('aba oculta por 1s ou menos não invalida nada', () => {
  const { metrics, dropped } = sanitizeWebVitals({
    lcp: 2900,
    loadTime: 4100,
    hiddenMs: MAX_HIDDEN_MS,
  });

  assert.deepEqual(dropped, []);
  assert.equal(metrics.lcp, 2900);
  assert.equal(metrics.loadTime, 4100);
});

test('sem hiddenMs o comportamento é o mesmo de antes', () => {
  const { metrics } = sanitizeWebVitals({ lcp: 2100, loadTime: 3400 });
  assert.equal(metrics.lcp, 2100);
  assert.equal(metrics.loadTime, 3400);
});

test('rastreador de aba oculta acumula tempo só enquanto está oculto', () => {
  const listeners = {};
  let state = 'visible';
  const doc = {
    get visibilityState() { return state; },
    addEventListener: (evt, fn) => { listeners[evt] = fn; },
    removeEventListener: (evt) => { delete listeners[evt]; },
  };

  const originalNow = Date.now;
  let now = 1000;
  Date.now = () => now;

  try {
    const stop = createHiddenTimeTracker(doc);
    state = 'hidden';
    listeners.visibilitychange();
    now += 5000;
    state = 'visible';
    listeners.visibilitychange();
    now += 2000; // visível: não conta
    state = 'hidden';
    listeners.visibilitychange();
    now += 1500;

    assert.equal(stop(), 6500);
    assert.equal(listeners.visibilitychange, undefined, 'listener deve ser removido');
  } finally {
    Date.now = originalNow;
  }
});

test('o coletor reporta o tempo de aba oculta para logPerformance', async () => {
  const source = await readFile(COLLECTOR, 'utf8');

  assert.match(source, /createHiddenTimeTracker/, 'collector deve medir tempo de aba oculta');
  assert.match(source, /hiddenMs/, 'collector deve enviar hiddenMs para logPerformance');
});
