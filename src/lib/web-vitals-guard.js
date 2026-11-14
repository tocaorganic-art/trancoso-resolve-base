/**
 * Guarda de plausibilidade para Web Vitals reportados por usuários reais.
 *
 * Contexto (11/11/2026): o monitoramento gerava CRITICAL com valores
 * fisicamente impossíveis para a produção medida — LCP 117032 ms (117 s),
 * LOADTIME 586684 ms (9,8 min), LOADTIME 127919 ms. Medições diretas em
 * produção mostravam TTFB 0,17-0,65 s e LCP de 0,9 s (desktop) a 2,1 s (4G
 * com CPU 4x), em todas as rotas principais.
 *
 * Causa: abas em segundo plano. O navegador adia pintura, load e callbacks de
 * timer enquanto a aba está oculta, então `loadEventEnd - startTime` e o
 * startTime do LCP acumulam o tempo inteiro em que a página ficou oculta.
 * Esses números não descrevem experiência de navegação: descrevem quanto tempo
 * a aba ficou aberta sem ser olhada. Publicá-los polui o histórico de alertas
 * e esconde regressões reais no meio do ruído.
 *
 * Regra: valores acima dos tetos abaixo (ou negativos, ou não numéricos) são
 * tratados como não confiáveis e não são reportados. loadEventEnd pode vir 0
 * quando o evento `load` ainda não terminou; nesse caso loadTime não é enviado.
 */

// Tetos generosos: qualquer coisa acima disto não é experiência de usuário,
// é artefato de aba oculta, bfcache ou restauração de sessão.
export const PLAUSIBLE_CEILINGS = {
  lcp: 30000, // ms
  fid: 10000, // ms
  cls: 10, // score
  ttfb: 30000, // ms
  loadTime: 45000, // ms
};

// Acima disto a página ficou tempo demais oculta: o navegador adia pintura e
// eventos, e as métricas deixam de descrever a experiência de quem navega.
export const MAX_HIDDEN_MS = 1000;

// Métricas de tempo de carregamento que deixam de valer quando a aba ficou oculta.
const TIMING_METRICS = ["lcp", "loadTime"];

const METRICS = ["lcp", "fid", "cls", "ttfb", "loadTime"];

function isUsableValue(metric, value) {
  if (value === null || value === undefined) return false;
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  if (value < 0) return false;
  const ceiling = PLAUSIBLE_CEILINGS[metric];
  if (ceiling !== undefined && value > ceiling) return false;
  return true;
}

/**
 * Devolve apenas as métricas confiáveis e a lista das descartadas.
 * @param {Record<string, number|null|undefined>} raw
 * @returns {{metrics: Record<string, number|null>, dropped: string[]}}
 */
export function sanitizeWebVitals(raw = {}) {
  const metrics = {};
  const dropped = [];
  const hiddenMs = Number(raw.hiddenMs) || 0;
  // Aba oculta durante o carregamento invalida LCP e loadTime: os dois somam
  // todo o tempo em que a página existiu sem ser olhada.
  const hiddenInvalidatesTiming = hiddenMs > MAX_HIDDEN_MS;

  for (const metric of METRICS) {
    const value = raw[metric];
    if (hiddenInvalidatesTiming && TIMING_METRICS.includes(metric)) {
      metrics[metric] = null;
      if (value !== null && value !== undefined) dropped.push(metric);
      continue;
    }
    if (isUsableValue(metric, value)) {
      metrics[metric] = value;
    } else {
      metrics[metric] = null;
      if (value !== null && value !== undefined) dropped.push(metric);
    }
  }

  return { metrics, dropped, hiddenMs };
}

/**
 * Acumula o tempo em que o documento ficou oculto (aba em segundo plano,
 * minimizada, troca de app no celular). Devolve uma função que para de contar
 * e retorna o total em ms.
 */
export function createHiddenTimeTracker(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return () => 0;

  let total = 0;
  let hiddenSince = doc.visibilityState === 'hidden' ? Date.now() : null;

  const onChange = () => {
    if (doc.visibilityState === 'hidden') {
      hiddenSince = Date.now();
    } else if (hiddenSince !== null) {
      total += Date.now() - hiddenSince;
      hiddenSince = null;
    }
  };

  doc.addEventListener('visibilitychange', onChange);

  return () => {
    if (hiddenSince !== null) {
      total += Date.now() - hiddenSince;
      hiddenSince = null;
    }
    doc.removeEventListener('visibilitychange', onChange);
    return total;
  };
}

/**
 * Indica se há pelo menos uma métrica confiável para enviar.
 */
export function hasReportableMetric(metrics = {}) {
  return METRICS.some((metric) => metrics[metric] !== null && metrics[metric] !== undefined);
}

/**
 * Calcula loadTime a partir do Navigation Timing, devolvendo null quando o
 * evento `load` ainda não terminou (loadEventEnd === 0) ou quando o valor
 * resultante não é confiável.
 */
export function computeLoadTime(nav) {
  if (!nav) return null;
  const { loadEventEnd, startTime } = nav;
  if (!Number.isFinite(loadEventEnd) || !Number.isFinite(startTime)) return null;
  if (loadEventEnd <= 0) return null;
  const value = Math.round(loadEventEnd - startTime);
  if (value < 0) return null;
  if (value > PLAUSIBLE_CEILINGS.loadTime) return null;
  return value;
}

/**
 * Calcula o TTFB a partir do Navigation Timing.
 */
export function computeTtfb(nav) {
  if (!nav) return null;
  const { responseStart, requestStart } = nav;
  if (!Number.isFinite(responseStart) || !Number.isFinite(requestStart)) return null;
  if (responseStart <= 0) return null;
  const value = Math.round(responseStart - requestStart);
  if (!isUsableValue("ttfb", value)) return null;
  return value;
}
