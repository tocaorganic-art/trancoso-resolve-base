import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

/**
 * Monitor de métricas reais do navegador.
 *
 * Corrige dois problemas da versão anterior:
 * 1. LCP negativo (-1.79e12ms): era calculado com a API legada
 *    `performance.timing.loadEventEnd - performance.timing.navigationStart`.
 *    Quando loadEventEnd ainda era 0, subtraía o epoch de navigationStart,
 *    produzindo um valor negativo gigante. Agora usa Navigation Timing Level 2
 *    e o PerformanceObserver `largest-contentful-paint` (valores relativos,
 *    nunca negativos).
 * 2. FID/CLS "simulados" (50ms / 0.05): números inventados exibidos como se
 *    fossem medição. Agora mede FID (first-input), CLS (layout-shift) e
 *    FCP (paint) de verdade e mostra "—" quando a métrica ainda não existe.
 */

const METRIC_WEIGHTS = { lcp: 0.25, fid: 0.25, cls: 0.25, fcp: 0.15, ttfb: 0.1 };
const THRESHOLDS = {
  lcp: { good: 2500, needs: 4000 },
  fid: { good: 100, needs: 300 },
  cls: { good: 0.1, needs: 0.25 },
  fcp: { good: 1800, needs: 3000 },
  ttfb: { good: 600, needs: 1500 },
};

function scoreOf(key, value) {
  const t = THRESHOLDS[key];
  if (value <= t.good) return 100;
  if (value <= t.needs) return 75;
  return 50;
}

export default function PerformanceMonitor({ onResults }) {
  // null = métrica ainda não disponível (sem inventar valor)
  const [metrics, setMetrics] = useState({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });
  const latest = useRef({ fcp: null, lcp: null, fid: null, cls: null, ttfb: null });

  // Expõe as métricas medidas para o relatório da página (dados reais, nunca simulados)
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  useEffect(() => {
    const push = () => {
      const m = { ...latest.current };
      // Score ponderado calculado apenas sobre as métricas realmente medidas
      const measured = Object.keys(m).filter((k) => m[k] !== null);
      let score = null;
      if (measured.length > 0) {
        const totalWeight = measured.reduce((acc, k) => acc + METRIC_WEIGHTS[k], 0);
        score = Math.round(
          measured.reduce((acc, k) => acc + scoreOf(k, m[k]) * METRIC_WEIGHTS[k], 0) / totalWeight
        );
      }
      setMetrics({ ...m, score });
      onResultsRef.current?.({ ...m, score });
    };

    const safeNum = (n) => Number.isFinite(n) && n >= 0 ? n : null;

    // TTFB: Navigation Timing Level 2 (valor relativo, sempre >= 0)
    try {
      const nav = performance.getEntriesByType?.('navigation')?.[0];
      if (nav) {
        latest.current.ttfb = safeNum(Math.round(nav.responseStart));
      } else if (performance.timing && performance.timing.requestStart > 0) {
        latest.current.ttfb = safeNum(
          Math.round(performance.timing.responseStart - performance.timing.requestStart)
        );
      }
    } catch { /* API indisponível */ }

    // FCP: paint entries
    try {
      const fcpEntry = performance
        .getEntriesByType?.('paint')
        ?.find((e) => e.name === 'first-contentful-paint');
      if (fcpEntry) latest.current.fcp = safeNum(Math.round(fcpEntry.startTime));
    } catch { /* API indisponível */ }

    const observers = [];
    const observe = (type, cb) => {
      try {
        if (!('PerformanceObserver' in window)) return;
        const supported = PerformanceObserver.supportedEntryTypes?.includes(type);
        if (!supported) return;
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) cb(entry);
        });
        po.observe({ type, buffered: true });
        observers.push(po);
      } catch { /* tipo não suportado */ }
    };

    // LCP real: atualiza a cada pintura de conteúdo maior
    observe('largest-contentful-paint', (entry) => {
      latest.current.lcp = safeNum(Math.round(entry.startTime));
      push();
    });

    // FID real: só existe após a primeira interação do usuário
    observe('first-input', (entry) => {
      latest.current.fid = safeNum(Math.round(entry.processingStart - entry.startTime));
      push();
    });

    // CLS real: acumula shifts de layout sem interação recente
    observe('layout-shift', (entry) => {
      if (entry.hadRecentInput) return;
      latest.current.cls = Number(((latest.current.cls || 0) + entry.value).toFixed(3));
      push();
    });

    // Se a página já terminou de carregar, LCP/FCP/TTFB já estão disponíveis
    const finalize = () => push();
    if (document.readyState === 'complete') {
      finalize();
      // Em páginas carregadas o LCP às vezes só é reportado via buffered entries
      setTimeout(finalize, 500);
    } else {
      window.addEventListener('load', finalize, { once: true });
    }

    if (import.meta.env.DEV) console.log('📊 Performance Metrics (reais):', latest.current);

    return () => observers.forEach((po) => po.disconnect());
  }, []);

  const getScoreColor = (score) => {
    if (score === null) return 'text-slate-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricStatus = (metric, value) => {
    if (value === null || value === undefined) return 'no-data';
    const threshold = THRESHOLDS[metric];
    if (!threshold) return 'good';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needs) return 'needs-improvement';
    return 'poor';
  };

  const metricsList = [
    { key: 'lcp', label: 'LCP', value: metrics.lcp, unit: 'ms', description: 'Largest Contentful Paint' },
    { key: 'fid', label: 'FID', value: metrics.fid, unit: 'ms', description: 'First Input Delay' },
    { key: 'cls', label: 'CLS', value: metrics.cls, unit: '', description: 'Cumulative Layout Shift' },
    { key: 'fcp', label: 'FCP', value: metrics.fcp, unit: 'ms', description: 'First Contentful Paint' },
    { key: 'ttfb', label: 'TTFB', value: metrics.ttfb, unit: 'ms', description: 'Time to First Byte' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Performance Monitor
          </CardTitle>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(metrics.score)}`}>
              {metrics.score ?? '—'}
            </div>
            <p className="text-xs text-slate-500">Performance Score</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metricsList.map((metric) => {
          const status = getMetricStatus(metric.key, metric.value === null ? null : parseFloat(metric.value));
          return (
            <div key={metric.key}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">{metric.label}</span>
                  <p className="text-xs text-slate-500">{metric.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {metric.value === null ? '—' : `${metric.value}${metric.unit}`}
                  </span>
                  <Badge className={
                    status === 'good' ? 'bg-green-500' :
                    status === 'needs-improvement' ? 'bg-yellow-500' :
                    status === 'poor' ? 'bg-red-500' : 'bg-slate-400'
                  }>
                    {status === 'good' ? 'Bom' : status === 'needs-improvement' ? 'OK' : status === 'poor' ? 'Ruim' : 'Sem dado'}
                  </Badge>
                </div>
              </div>
              <Progress
                value={status === 'good' ? 100 : status === 'needs-improvement' ? 60 : status === 'poor' ? 30 : 0}
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
