import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STATUS_COLORS = {
  aprovado: "bg-green-900/50 text-green-300",
  pendente: "bg-amber-900/50 text-amber-300",
  em_analise_manual: "bg-orange-900/50 text-orange-300",
  reprovado: "bg-red-900/50 text-red-300",
};

export default function TabPrestadores({ providers, requests }) {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroOcupacao, setFiltroOcupacao] = useState("todos");
  const [busca, setBusca] = useState("");

  const ocupacoes = useMemo(() => {
    const set = new Set((providers || []).map(p => p.occupation).filter(Boolean));
    return [...set].sort();
  }, [providers]);

  const requestsByProvider = useMemo(() => {
    const map = {};
    (requests || []).forEach(r => { map[r.provider_id] = (map[r.provider_id] || 0) + 1; });
    return map;
  }, [requests]);

  const filtered = useMemo(() => {
    let data = [...(providers || [])];
    if (filtroStatus !== "todos") data = data.filter(p => (p.status_verificacao || "pendente") === filtroStatus);
    if (filtroOcupacao !== "todos") data = data.filter(p => p.occupation === filtroOcupacao);
    if (busca) data = data.filter(p => (p.full_name || "").toLowerCase().includes(busca.toLowerCase()));
    return data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [providers, filtroStatus, filtroOcupacao, busca]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-xs text-slate-400 mb-1">Buscar</p>
            <Input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Nome do prestador..." className="w-44 bg-slate-700 border-slate-600 text-slate-100 h-9" />
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Status verificação</p>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44 bg-slate-700 border-slate-600 text-slate-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise_manual">Em Análise</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Ocupação</p>
            <Select value={filtroOcupacao} onValueChange={setFiltroOcupacao}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-slate-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {ocupacoes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="text-slate-400 text-xs ml-auto self-center">{filtered.length} prestadores</p>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="p-3">Nome</th>
                  <th className="p-3">Ocupação</th>
                  <th className="p-3">Verificação</th>
                  <th className="p-3">Cadastro</th>
                  <th className="p-3">Solicitações</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhum prestador encontrado.</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                            <span className="text-xs text-slate-400">{(p.full_name || "?")[0]}</span>
                          </div>
                        )}
                        <span className="text-slate-200 font-medium">{p.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 text-xs">{p.occupation || "—"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status_verificacao || "pendente"] || STATUS_COLORS.pendente}`}>
                        {p.status_verificacao || "pendente"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-xs">
                      {p.created_date ? format(new Date(p.created_date), "dd/MM/yy") : "—"}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-400">
                      {requestsByProvider[p.id] || 0}
                    </td>
                    <td className="p-3">
                      <Link to={`${createPageUrl("PrestadorPerfil")}?id=${p.id}`}>
                        <Button size="sm" variant="ghost" className="text-xs gap-1 text-orange-400 hover:text-orange-300 h-7">
                          <ExternalLink className="w-3 h-3" /> Ver Perfil
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}