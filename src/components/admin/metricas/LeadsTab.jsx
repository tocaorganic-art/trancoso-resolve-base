import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";

export default function LeadsTab() {
  const [filters, setFilters] = useState({ type: "all", source: "all", service: "all", period: "all" });
  const [search, setSearch] = useState("");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads-all"],
    queryFn: () => base44.entities.LeadPreLancamento.list("-created_date", 1000),
  });

  const sources = useMemo(() => [...new Set(leads.map(l => l.source).filter(Boolean))], [leads]);
  const services = useMemo(() => [...new Set(leads.map(l => l.service_interest).filter(Boolean))], [leads]);

  const filtered = useMemo(() => {
    const now = new Date();
    return leads.filter(l => {
      if (filters.type !== "all" && l.type !== filters.type) return false;
      if (filters.source !== "all" && l.source !== filters.source) return false;
      if (filters.service !== "all" && l.service_interest !== filters.service) return false;
      if (filters.period !== "all") {
        const days = parseInt(filters.period);
        const cutoff = new Date(now.getTime() - days * 86400000);
        if (new Date(l.created_date) < cutoff) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        if (!l.name?.toLowerCase().includes(s) && !l.phone?.includes(s)) return false;
      }
      return true;
    });
  }, [leads, filters, search]);

  const exportCsv = () => {
    const headers = ["Data","Nome","WhatsApp","Serviço","Origem","Tipo","Status"];
    const rows = filtered.map(l => [
      l.created_date?.split('T')[0] ?? "",
      l.name ?? "",
      l.phone ?? "",
      l.service_interest ?? "",
      l.source ?? "",
      l.type ?? "",
      l.description?.includes("contatado") ? "Contatado" : "Novo",
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const markContacted = async (lead) => {
    await base44.entities.LeadPreLancamento.update(lead.id, {
      description: (lead.description ? lead.description + " | " : "") + "contatado:" + new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
        <CardTitle className="text-slate-100 text-base">Todos os Leads ({filtered.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-1" /> Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <Input placeholder="Buscar nome ou tel..." value={search} onChange={e => setSearch(e.target.value)} className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs" />
          <Select value={filters.type} onValueChange={v => setFilters(f => ({...f, type: v}))}>
            <SelectTrigger className="h-8 bg-slate-700 border-slate-600 text-slate-200 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="cliente">Cliente</SelectItem><SelectItem value="prestador">Prestador</SelectItem></SelectContent>
          </Select>
          <Select value={filters.source} onValueChange={v => setFilters(f => ({...f, source: v}))}>
            <SelectTrigger className="h-8 bg-slate-700 border-slate-600 text-slate-200 text-xs"><SelectValue placeholder="Origem" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas origens</SelectItem>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.service} onValueChange={v => setFilters(f => ({...f, service: v}))}>
            <SelectTrigger className="h-8 bg-slate-700 border-slate-600 text-slate-200 text-xs"><SelectValue placeholder="Serviço" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos serviços</SelectItem>{services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.period} onValueChange={v => setFilters(f => ({...f, period: v}))}>
            <SelectTrigger className="h-8 bg-slate-700 border-slate-600 text-slate-200 text-xs"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="7">7 dias</SelectItem><SelectItem value="30">30 dias</SelectItem><SelectItem value="90">90 dias</SelectItem></SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-slate-400 text-left border-b border-slate-700">
                <th className="pb-2">Data</th><th className="pb-2">Nome</th><th className="pb-2">WhatsApp</th>
                <th className="pb-2">Serviço</th><th className="pb-2">Origem</th>
                <th className="pb-2">Tipo</th><th className="pb-2">Status</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {filtered.slice(0, 200).map(l => {
                  const contacted = l.description?.includes("contatado");
                  return (
                    <tr key={l.id} className={`border-b border-slate-700/50 ${contacted ? "opacity-60" : ""}`}>
                      <td className="py-1.5 text-slate-400">{l.created_date?.split('T')[0]}</td>
                      <td className="py-1.5 text-slate-200">{l.name}</td>
                      <td className="py-1.5 text-slate-300">
                        <a href={`https://wa.me/${l.phone?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">{l.phone}</a>
                      </td>
                      <td className="py-1.5 text-slate-300">{l.service_interest || "-"}</td>
                      <td className="py-1.5 text-slate-400">{l.source || "-"}</td>
                      <td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-xs ${l.type === "prestador" ? "bg-orange-900 text-orange-300" : "bg-amber-900 text-amber-300"}`}>{l.type}</span></td>
                      <td className="py-1.5"><span className={contacted ? "text-green-400" : "text-slate-500"}>●{" "}{contacted ? "Contatado" : "Novo"}</span></td>
                      <td className="py-1.5">
                        {!contacted && (
                          <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-slate-400 hover:text-green-400" onClick={() => markContacted(l)}>
                            Contatado
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-slate-500 mt-6">Nenhum lead encontrado.</p>}
            {filtered.length > 200 && <p className="text-center text-slate-500 text-xs mt-3">Mostrando 200 de {filtered.length} leads. Use filtros para refinar.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}