import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

const STATUS_LABELS = {
  aprovado: { label: "Aprovado", cls: "bg-green-900 text-green-300" },
  pendente: { label: "Pendente", cls: "bg-yellow-900 text-yellow-300" },
  em_analise_manual: { label: "Em análise", cls: "bg-blue-900 text-blue-300" },
  reprovado: { label: "Reprovado", cls: "bg-red-900 text-red-300" },
};

export default function PrestadoresTab() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOccupation, setFilterOccupation] = useState("all");
  const [search, setSearch] = useState("");

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["admin-providers-full"],
    queryFn: () => base44.entities.ServiceProvider.list("-created_date", 500),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => base44.entities.Subscription.list("-created_date", 500),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => base44.entities.ServiceListing.list("-created_date", 1000),
  });

  const occupations = useMemo(() => [...new Set(providers.map(p => p.occupation).filter(Boolean))], [providers]);

  const filtered = useMemo(() => providers.filter(p => {
    if (filterStatus !== "all" && p.status_verificacao !== filterStatus) return false;
    if (filterOccupation !== "all" && p.occupation !== filterOccupation) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!p.full_name?.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [providers, filterStatus, filterOccupation, search]);

  const getSubPlan = (email) => {
    const sub = subscriptions.find(s => s.user_email === email);
    if (!sub) return "-";
    return `${sub.plan} (${sub.status})`;
  };

  const getServiceCount = (providerId) => services.filter(s => s.provider_id === providerId).length;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader><CardTitle className="text-slate-100 text-base">Prestadores ({filtered.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 bg-slate-700 border-slate-600 text-slate-200 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_analise_manual">Em análise</SelectItem>
              <SelectItem value="reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterOccupation} onValueChange={setFilterOccupation}>
            <SelectTrigger className="h-8 bg-slate-700 border-slate-600 text-slate-200 text-xs"><SelectValue placeholder="Ocupação" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas</SelectItem>{occupations.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-slate-400 text-left border-b border-slate-700">
                <th className="pb-2">Nome</th><th className="pb-2">Ocupação</th>
                <th className="pb-2">Verificação</th><th className="pb-2">Plano</th>
                <th className="pb-2">Cadastro</th><th className="pb-2 text-right">Serviços</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {filtered.slice(0, 200).map(p => {
                  const st = STATUS_LABELS[p.status_verificacao] || { label: p.status_verificacao || "N/A", cls: "bg-slate-700 text-slate-300" };
                  return (
                    <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-2 text-slate-200 font-medium">{p.full_name}</td>
                      <td className="py-2 text-slate-300">{p.occupation || "-"}</td>
                      <td className="py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${st.cls}`}>{st.label}</span></td>
                      <td className="py-2 text-slate-400">{getSubPlan(p.created_by)}</td>
                      <td className="py-2 text-slate-400">{p.created_date?.split('T')[0]}</td>
                      <td className="py-2 text-right text-slate-300">{getServiceCount(p.id)}</td>
                      <td className="py-2">
                        <a href={`/PrestadorPerfil?id=${p.id}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-blue-400">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-500 mt-6">Nenhum prestador encontrado.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}