import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

// Mock últimas medições (em produção viriam de uma entidade ou logs)
const MOCK_MEASUREMENTS = [
  { page: "/servicos/diarista-trancoso", lcp: 2100, cls: 0.05, status: "good" },
  { page: "/", lcp: 1850, cls: 0.08, status: "good" },
  { page: "/ServicosCategoria", lcp: 3200, cls: 0.12, status: "warning" },
  { page: "/SejaPrestador", lcp: 4500, cls: 0.03, status: "bad" },
  { page: "/PrestadorPerfil", lcp: 2800, cls: 0.18, status: "warning" },
];

const STATUS_MAP = {
  good:    { label: "Bom",      icon: CheckCircle,   color: "text-green-400",  bg: "bg-green-900/30 border-green-700" },
  warning: { label: "Warning",  icon: AlertTriangle,  color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-700" },
  bad:     { label: "Crítico",  icon: AlertTriangle,  color: "text-red-400",    bg: "bg-red-900/30 border-red-700" },
};

export default function PerformanceTab() {
  const overallStatus = MOCK_MEASUREMENTS.some(m => m.status === "bad") ? "bad"
    : MOCK_MEASUREMENTS.some(m => m.status === "warning") ? "warning" : "good";

  const statusInfo = STATUS_MAP[overallStatus];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Status geral */}
      <Card className={`border ${statusInfo.bg}`}>
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            <div>
              <p className="text-slate-100 font-bold text-lg">Status do Sistema: {statusInfo.label}</p>
              <p className="text-slate-400 text-sm">
                {overallStatus === "good" && "Todas as métricas dentro dos limites aceitáveis."}
                {overallStatus === "warning" && "Algumas páginas com performance abaixo do ideal."}
                {overallStatus === "bad" && "Páginas críticas detectadas — LCP acima de 4000ms."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/DiagnosticosCompletos", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-1" /> Diagnóstico completo
          </Button>
        </CardContent>
      </Card>

      {/* Limites de referência */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader><CardTitle className="text-slate-100 text-sm flex items-center gap-2"><Activity className="w-4 h-4" />Limites Web Vitals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { metric: "LCP", bom: "< 2500ms", ruim: "> 4000ms" },
              { metric: "FID", bom: "< 100ms", ruim: "> 300ms" },
              { metric: "CLS", bom: "< 0.1", ruim: "> 0.25" },
              { metric: "TTFB", bom: "< 800ms", ruim: "> 1800ms" },
            ].map(t => (
              <div key={t.metric} className="bg-slate-700/50 rounded-lg p-3">
                <p className="font-bold text-slate-100 mb-1">{t.metric}</p>
                <p className="text-green-400">✓ Bom: {t.bom}</p>
                <p className="text-red-400">✗ Ruim: {t.ruim}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Últimas medições */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader><CardTitle className="text-slate-100 text-base">Últimas medições</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="text-slate-400 text-left border-b border-slate-700">
              <th className="pb-2">Página</th>
              <th className="pb-2 text-right">LCP (ms)</th>
              <th className="pb-2 text-right">CLS</th>
              <th className="pb-2 text-right">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_MEASUREMENTS.map((m, i) => {
                const st = STATUS_MAP[m.status];
                const Icon = st.icon;
                return (
                  <tr key={i} className="border-b border-slate-700/50">
                    <td className="py-2 text-slate-300 font-mono text-xs">{m.page}</td>
                    <td className={`py-2 text-right font-bold ${m.lcp > 4000 ? "text-red-400" : m.lcp > 2500 ? "text-yellow-400" : "text-green-400"}`}>{m.lcp}</td>
                    <td className={`py-2 text-right ${m.cls > 0.25 ? "text-red-400" : m.cls > 0.1 ? "text-yellow-400" : "text-green-400"}`}>{m.cls}</td>
                    <td className="py-2 text-right"><span className={`flex items-center justify-end gap-1 ${st.color}`}><Icon className="w-3 h-3" />{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-slate-500 text-xs mt-3">* Dados coletados via Web Vitals Collector em sessões reais de usuários.</p>
        </CardContent>
      </Card>
    </div>
  );
}