import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, FileText, TrendingUp, Percent } from "lucide-react";

export default function TabVisaoGeral({ leads, requests, providers }) {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);

  const leadsUltimos7 = useMemo(() =>
    (leads || []).filter(l => new Date(l.created_date) >= sevenDaysAgo).length,
    [leads]
  );

  const requestsUltimos7 = useMemo(() =>
    (requests || []).filter(r => new Date(r.created_date) >= sevenDaysAgo).length,
    [requests]
  );

  const prestadoresAtivos = useMemo(() =>
    (providers || []).filter(p => p.status === 'ativo' || !p.status).length,
    [providers]
  );

  const taxaConversao = leadsUltimos7 > 0
    ? ((requestsUltimos7 / leadsUltimos7) * 100).toFixed(1)
    : "0.0";

  // Leads por dia — últimos 30 dias
  const leadsPerDay = useMemo(() => {
    const map = {};
    for (let i = 29; i >= 0; i--) {
      const d = subDays(now, i);
      map[format(d, "yyyy-MM-dd")] = 0;
    }
    (leads || []).forEach(l => {
      if (!l.created_date) return;
      const d = l.created_date.slice(0, 10);
      if (d in map) map[d]++;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: format(parseISO(date), "dd/MM", { locale: ptBR }),
      leads: count,
    }));
  }, [leads]);

  // Solicitações por categoria
  const requestsByCategory = useMemo(() => {
    const map = {};
    (requests || []).forEach(r => {
      const cat = r.category || "Outros";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [requests]);

  // Top 10 serviços
  const topServices = useMemo(() => {
    const map = {};
    (requests || []).forEach(r => {
      const key = r.service_id || "desconhecido";
      if (!map[key]) map[key] = { id: key, count: 0 };
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [requests]);

  const kpis = [
    { label: "Leads (7 dias)", value: leadsUltimos7, icon: Users, color: "text-cyan-400" },
    { label: "Prestadores Ativos", value: prestadoresAtivos, icon: TrendingUp, color: "text-green-400" },
    { label: "Solicitações (7 dias)", value: requestsUltimos7, icon: FileText, color: "text-amber-400" },
    { label: "Taxa Conversão", value: `${taxaConversao}%`, icon: Percent, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-5 flex items-center gap-4">
              <kpi.icon className={`w-8 h-8 shrink-0 ${kpi.color}`} />
              <div>
                <p className="text-xs text-slate-400 leading-tight">{kpi.label}</p>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico linha: Leads por dia */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 text-base">Leads por Dia — Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={leadsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={4} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#f1f5f9" }} />
              <Line type="monotone" dataKey="leads" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico barras: Solicitações por categoria */}
      {requestsByCategory.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-base">Solicitações por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={requestsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#f1f5f9" }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top 10 serviços */}
      {topServices.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 text-base">Top 10 Serviços Mais Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-left">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">ID do Serviço</th>
                    <th className="py-2">Solicitações</th>
                  </tr>
                </thead>
                <tbody>
                  {topServices.map((s, i) => (
                    <tr key={s.id} className="border-b border-slate-700/50 text-slate-300">
                      <td className="py-2 pr-4 font-bold text-slate-500">{i + 1}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{s.id}</td>
                      <td className="py-2 font-bold text-amber-400">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}