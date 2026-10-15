import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Download, RefreshCw, Loader2 } from 'lucide-react';
import PermissionChecker from '../components/auth/PermissionChecker';
import { toast } from 'sonner';

// Lazy load todos os monitores pesados — só carregam após o primeiro paint
const PerformanceMonitor = lazy(() => import('../components/diagnostics/PerformanceMonitor'));
const A11yChecker        = lazy(() => import('../components/diagnostics/A11yChecker'));
const SEOMonitor         = lazy(() => import('../components/diagnostics/SEOMonitor'));
const NetworkMonitor     = lazy(() => import('../components/diagnostics/NetworkMonitor'));
const SystemHealthCheck  = lazy(() => import('../components/maintenance/SystemHealthCheck'));
const ContinuousMonitor  = lazy(() => import('../components/monitoring/ContinuousMonitor'));

const LoadingCard = () => (
  <Card>
    <CardContent className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-brand-primary mr-3" />
      <span className="text-muted-foreground text-sm">Carregando módulo...</span>
    </CardContent>
  </Card>
);

function DiagnosticosCompletosContent() {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Últimos resultados REAIS medidos por cada monitor nesta sessão do navegador.
  // O relatório completo é gerado a partir daqui — nunca de valores fixos/simulados.
  const resultsRef = useRef({ performance: null, accessibility: null, seo: null, network: null });
  const collect = (key) => (data) => {
    resultsRef.current[key] = { ...data, capturedAt: new Date().toISOString() };
  };

  // SEO próprio desta página — sobrescreve o title da home
  useEffect(() => {
    document.title = 'Diagnósticos Completos do Sistema | Trancoso Resolve';

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Acompanhe em tempo real os diagnósticos de performance, acessibilidade, SEO, rede e módulos de IA da plataforma Trancoso Resolve.';

    // Ao sair desta página, nenhum cleanup necessário — o layout/home vai sobrescrever novamente
  }, []);

  const generateFullReport = () => {
    setIsGeneratingReport(true);

    const r = resultsRef.current;
    const p = r.performance;
    const a = r.accessibility;
    const s = r.seo;
    const n = r.network;

    const fmt = (v, unit = '') =>
      v === null || v === undefined ? 'sem dado' : `${v}${unit}`;
    const fmtScore = (v) =>
      typeof v === 'number' ? `${v}/100` : 'sem dado';

    // Score geral = média das áreas que foram medidas de fato
    const areaScores = [p, a, s]
      .map((x) => (x && typeof x.score === 'number' ? x.score : null))
      .filter((v) => v !== null);
    const overallScore = areaScores.length
      ? Math.round(areaScores.reduce((x, y) => x + y, 0) / areaScores.length)
      : null;
    const overallStatus =
      overallScore === null
        ? 'SEM DADOS COLETADOS'
        : overallScore >= 90
          ? 'BOM'
          : overallScore >= 75
            ? 'ATENÇÃO'
            : 'RUIM';

    const line = (label, value) => `${label}: ${value}`;
    const captured = (x) => (x && x.capturedAt ? ` | medido às ${new Date(x.capturedAt).toLocaleTimeString('pt-BR')}` : '');

    const reportText = `
==============================================
RELATÓRIO DE DIAGNÓSTICO COMPLETO
Trancoso Resolve
==============================================

Data: ${new Date().toLocaleString('pt-BR')}
Fonte: medições em tempo real dos monitores nesta sessão do navegador.
Métricas "sem dado" = ainda não medidas nesta sessão (ex.: FID requer
interação do usuário; monitores lazy ainda podem estar carregando).

PERFORMANCE (PerformanceMonitor)${captured(p)}
-----------
${line('Score', fmtScore(p?.score))}
${line('LCP', fmt(p?.lcp, 'ms'))}
${line('FID', fmt(p?.fid, 'ms'))}
${line('CLS', fmt(p?.cls))}
${line('FCP', fmt(p?.fcp, 'ms'))}
${line('TTFB', fmt(p?.ttfb, 'ms'))}

ACESSIBILIDADE (A11yChecker)${captured(a)}
--------------
${line('Score', fmtScore(a?.score))}
${line('Checks aprovados', a ? `${a.passed}/${a.total}` : 'sem dado')}
${line('Problemas encontrados', a ? a.issues : 'sem dado')}${a && a.issueDetails && a.issueDetails.length ? `\nDetalhes:\n${a.issueDetails.map((d) => `  - ${d}`).join('\n')}` : ''}

SEO (SEOMonitor)${captured(s)}
---
${line('Score', fmtScore(s?.score))}
${line('Checks aprovados', s ? `${s.passed}/${s.total}` : 'sem dado')}
${line('Falhas', s ? s.issues : 'sem dado')}${s && s.issueDetails && s.issueDetails.length ? `\nDetalhes:\n${s.issueDetails.map((d) => `  - ${d}`).join('\n')}` : ''}

REDE (NetworkMonitor)${captured(n)}
-------
${line('Conexão', n ? `${n.networkInfo?.effectiveType || 'desconhecida'}${n.networkInfo?.downlink ? ` (${n.networkInfo.downlink} Mbps, RTT ${n.networkInfo.rtt}ms)` : ''}` : 'sem dado')}
${line('Online', n ? (n.networkInfo?.online ? 'sim' : 'não') : 'sem dado')}
${line('Recursos carregados', n ? `${n.resources?.total ?? 0} (scripts: ${n.resources?.scripts ?? 0}, css: ${n.resources?.stylesheets ?? 0}, imagens: ${n.resources?.images ?? 0})` : 'sem dado')}
${line('Tamanho total transferido', n && n.resources?.totalSize ? `${(n.resources.totalSize / 1024 / 1024).toFixed(2)} MB` : 'sem dado')}

==============================================
Status Geral: ${overallStatus}
Score médio das áreas medidas: ${overallScore === null ? 'sem dados coletados ainda — aguarde os monitores e gere novamente' : `${overallScore}/100`}
==============================================
    `.trimStart();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = `diagnostico-completo-${Date.now()}.txt`;
    document.body.appendChild(dl);
    dl.click();
    window.URL.revokeObjectURL(url);
    dl.remove();

    toast.success(
      overallScore === null
        ? 'Relatório gerado, mas sem dados ainda — aguarde os monitores medirem e gere novamente.'
        : 'Relatório gerado com os dados reais medidos pelos monitores!'
    );
    setIsGeneratingReport(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero — carrega imediatamente, sem dependências pesadas */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-brand-primary" />
              Diagnósticos Completos
            </h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real de performance, acessibilidade, SEO e rede
            </p>
          </div>
          <Button
            onClick={generateFullReport}
            disabled={isGeneratingReport}
            className="bg-brand-primary hover:bg-orange-700"
          >
            {isGeneratingReport ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório Completo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs + monitores — lazy loaded após o primeiro paint */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="a11y">A11y</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<LoadingCard />}><PerformanceMonitor onResults={collect('performance')} /></Suspense>
            <Suspense fallback={<LoadingCard />}><A11yChecker onResults={collect('accessibility')} /></Suspense>
            <Suspense fallback={<LoadingCard />}><SEOMonitor onResults={collect('seo')} /></Suspense>
            <Suspense fallback={<LoadingCard />}><NetworkMonitor onResults={collect('network')} /></Suspense>
          </div>
          <Suspense fallback={<LoadingCard />}><SystemHealthCheck /></Suspense>
          <Suspense fallback={<LoadingCard />}><ContinuousMonitor /></Suspense>
        </TabsContent>

        <TabsContent value="performance">
          <Suspense fallback={<LoadingCard />}><PerformanceMonitor onResults={collect('performance')} /></Suspense>
        </TabsContent>

        <TabsContent value="a11y">
          <Suspense fallback={<LoadingCard />}><A11yChecker onResults={collect('accessibility')} /></Suspense>
        </TabsContent>

        <TabsContent value="seo">
          <Suspense fallback={<LoadingCard />}><SEOMonitor onResults={collect('seo')} /></Suspense>
        </TabsContent>

        <TabsContent value="network">
          <Suspense fallback={<LoadingCard />}><NetworkMonitor onResults={collect('network')} /></Suspense>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Suspense fallback={<LoadingCard />}><SystemHealthCheck /></Suspense>
          <Suspense fallback={<LoadingCard />}><ContinuousMonitor /></Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DiagnosticosCompletosPage() {
  return (
    <PermissionChecker requiredRole="admin">
      <DiagnosticosCompletosContent />
    </PermissionChecker>
  );
}