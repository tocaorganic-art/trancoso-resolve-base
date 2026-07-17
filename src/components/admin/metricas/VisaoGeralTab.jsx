import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, FileText, TrendingUp, Zap, Loader2 } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function KPICard({ title, value, icon: KPIIcon, color, loading }) {
  const Icon = KPIIcon;
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-300 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-slate-100">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VisaoGeralTab() {
  const sevenDaysAgo = useMemo(() => subDays(new Date(), 7).toISOString().split('T')[0], []);
  const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30).toISOString().split('T')[0], []);

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => base44.entities.LeadPreLancamento.list("-created_date", 500),
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: () => base44.entities.ServiceProvider.list("-created_date", 500),
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => base44.entities.ServiceRequest.list("-created_date", 500),
  });

  const recentLeads = useMemo(() =>
    leads.filter(l => l.created_date >= sevenDaysAgo), [leads, sevenDaysAgo]);

  const recentRequests = useMemo(() =>
    requests.filter(r => r.created_date >= sevenDaysAgo), [requests, sevenDaysAgo]);

  const conversionRate = useMemo(() => {
    if (!recentLeads.length) return "0%";
    return ((recentRequests.length / recentLeads.length) * 100).toFixed(1) + "%";
  }, [recentLeads, recentRequests]);

  const activeProviders = useMemo(() =>
    providers.filter(p => p.status_verificacao === 'aprovado' || !p.status_verificacao),
  [providers]);

  // Leads por dia (últimos 30 dias)
  const leadsPerDay = useMemo(() => {
    const days = {};
    for (let i = 29; i >= 0; i--) {
      const day = format(subDays(new Date(), i), "yyyy-MM-dd");
      days[day] = 0;
    }
    leads.filter(l => l.created_date >= thirtyDaysAgo).forEach(l => {
      const day = l.created_date?.split('T')[0];
      if (days[day] !== undefined) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: format(parseISO(date), "dd/MM", { locale: ptBR }),
      leads: count,
    }));
  }, [leads, thirtyDaysAgo]);

  // Solicitações por categoria
  const requestsByCategory = useMemo(() => {
    const cats = {};
    requests.forEach(r => {
      const cat = r.service_id || "Sem categoria";
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, count }));
  }, [requests]);

  // Top 10 serviços
  const topServices = useMemo(() => {
    const map = {};
    requests.forEach(r => {
      const key = r.service_id || "Desconhecido";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([service, total]) => ({ service, total }));
  }, [requests]);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Leads (7 dias)" value={recentLeads.length} icon={TrendingUp} color="bg-blue-600" loading={loadingLeads} />
        <KPICard title="Prestadores Ativos" value={activeProviders.length} icon={Users} color="bg-green-600" loading={loadingProviders} />
        <KPICard title="Solicitações (7 dias)" value={recentRequests.length} icon={FileText} color="bg-purple-600" loading={loadingRequests} />
        <KPICard title="Conversão Lead→Sol." value={conversionRate} icon={Zap} color="bg-amber-600" loading={loadingLeads || loadingRequests} />
      </div>

      {/* Gráfico de leads por dia */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader><CardTitle className="text-slate-100 text-base">Leads por dia — últimos 30 dias</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={leadsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={4} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#f1f5f9" }} />
              <Line type="monotone" dataKey="leads" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de solicitações por categoria */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader><CardTitle className="text-slate-100 text-base">Solicitações por serviço</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={requestsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#f1f5f9" }} />
              <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 serviços */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader><CardTitle className="text-slate-100 text-base">Top 10 serviços mais solicitados</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-700">
                <th className="pb-2">#</th>
                <th className="pb-2">Serviço</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map(({ service, total }, i) => (
                <tr key={service} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-2 text-slate-500">{i + 1}</td>
                  <td className="py-2 text-slate-200">{service}</td>
                  <td className="py-2 text-right font-bold text-slate-100">{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topServices.length === 0 && <p className="text-slate-500 text-sm mt-2">Nenhum dado disponível.</p>}
        </CardContent>
      </Card>
    </div>
  );
}