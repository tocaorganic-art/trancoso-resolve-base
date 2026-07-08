import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, CheckCircle } from "lucide-react";
import { format, subDays } from "date-fns";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PERIODOS = [
  { label: "Todos", days: null },
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Últimos 90 dias", days: 90 },
];

export default function TabLeads({ leads, onRefresh }) {
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroOrigem, setFiltroOrigem] = useState("todos");
  const [filtroServico, setFiltroServico] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState(null);
  const [marcando, setMarcando] = useState(null);

  const origens = useMemo(() => {
    const set = new Set((leads || []).map(l => l.source).filter(Boolean));
    return [...set];
  }, [leads]);

  const filtered = useMemo(() => {
    let data = [...(leads || [])];
    if (filtroTipo !== "todos") data = data.filter(l => l.type === filtroTipo);
    if (filtroOrigem !== "todos") data = data.filter(l => l.source === filtroOrigem);
    if (filtroServico) data = data.filter(l => (l.service_interest || "").toLowerCase().includes(filtroServico.toLowerCase()));
    if (filtroPeriodo) {
      const cutoff = subDays(new Date(), filtroPeriodo);
      data = data.filter(l => new Date(l.created_date) >= cutoff);
    }
    return data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [leads, filtroTipo, filtroOrigem, filtroServico, filtroPeriodo]);

  const exportCSV = () => {
    const header = "Data,Nome,WhatsApp,Serviço,Origem,Tipo,Status\n";
    const rows = filtered.map(l =>
      [
        l.created_date ? format(new Date(l.created_date), "dd/MM/yyyy HH:mm") : "",
        `"${l.name || ""}"`,
        l.phone || "",
        `"${l.service_interest || ""}"`,
        l.source || "",
        l.type || "",
        l.description?.includes("contatado") ? "contatado" : "novo",
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const marcarContatado = async (lead) => {
    setMarcando(lead.id);
    try {
      const nota = `[contatado em ${format(new Date(), "dd/MM/yyyy HH:mm")}]`;
      const desc = lead.description ? `${lead.description} ${nota}` : nota;
      await base44.entities.LeadPreLancamento.update(lead.id, { description: desc });
      toast.success("Lead marcado como contatado.");
      onRefresh?.();
    } catch { toast.error("Erro ao atualizar lead."); }
    finally { setMarcando(null); }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs text-slate-400 mb-1">Tipo</p>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-slate-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="prestador">Prestador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Origem</p>
            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger className="w-44 bg-slate-700 border-slate-600 text-slate-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {origens.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Serviço</p>
            <Input value={filtroServico} onChange={e => setFiltroServico(e.target.value)}
              placeholder="Filtrar serviço..." className="w-36 bg-slate-700 border-slate-600 text-slate-100 h-9" />
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Período</p>
            <Select value={filtroPeriodo?.toString() || "null"} onValueChange={v => setFiltroPeriodo(v === "null" ? null : Number(v))}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-slate-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIODOS.map(p => <SelectItem key={String(p.days)} value={String(p.days)}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV} className="gap-2 ml-auto">
            <Download className="w-4 h-4" /> Exportar CSV ({filtered.length})
          </Button>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="p-3">Data</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Serviço</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-slate-500">Nenhum lead encontrado.</td></tr>
                ) : filtered.map(lead => {
                  const contatado = lead.description?.includes("contatado");
                  return (
                    <tr key={lead.id} className={`border-b border-slate-700/40 hover:bg-slate-700/30 ${contatado ? "opacity-60" : ""}`}>
                      <td className="p-3 text-slate-400 text-xs whitespace-nowrap">
                        {lead.created_date ? format(new Date(lead.created_date), "dd/MM/yy HH:mm") : "—"}
                      </td>
                      <td className="p-3 text-slate-200 font-medium">{lead.name || "—"}</td>
                      <td className="p-3">
                        <a href={`https://wa.me/55${(lead.phone || "").replace(/\D/g, "")}`} target="_blank"
                          rel="noopener noreferrer" className="text-green-400 hover:underline text-xs">
                          {lead.phone || "—"}
                        </a>
                      </td>
                      <td className="p-3 text-slate-300 text-xs">{lead.service_interest || "—"}</td>
                      <td className="p-3 text-slate-400 text-xs">{lead.source || "—"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lead.type === "prestador" ? "bg-amber-900/50 text-amber-300" : "bg-cyan-900/50 text-cyan-300"}`}>
                          {lead.type || "—"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs ${contatado ? "text-green-400" : "text-slate-500"}`}>
                          {contatado ? "✓ Contatado" : "Novo"}
                        </span>
                      </td>
                      <td className="p-3">
                        {!contatado && (
                          <Button size="sm" variant="ghost" disabled={marcando === lead.id}
                            onClick={() => marcarContatado(lead)}
                            className="text-xs gap-1 text-green-400 hover:text-green-300 h-7">
                            <CheckCircle className="w-3 h-3" /> Contatado
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}