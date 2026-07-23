import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Chamado via SDK: base44.functions.invoke('verificarAntecedentes', {})
import {
  Loader2, ShieldCheck, Search, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
  em_analise_manual: { label: "Em Análise Manual", color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
  aprovado: { label: "Aprovado", color: "bg-[#3E8E5A]/10 text-[#3E8E5A] border-[#3E8E5A]/30", icon: CheckCircle },
  reprovado: { label: "Reprovado", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

function maskCPF(cpf) {
  if (!cpf) return "Não informado";
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***.${d.slice(9)}`;
}

export default function AdminAntecedentesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: providers, isLoading } = useQuery({
    queryKey: ["allProviders"],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 200),
    enabled: !!user && user.role === "admin",
    staleTime: 0,
  });

  const aprovaMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.ServiceProvider.update(id, {
        status_verificacao: "aprovado",
        relatorio_verificacao: "Aprovado manualmente pelo administrador.",
        data_verificacao: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success("✅ Prestador aprovado manualmente.");
      queryClient.invalidateQueries({ queryKey: ["allProviders"] });
    },
  });

  const reprovaMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.ServiceProvider.update(id, {
        status_verificacao: "reprovado",
        relatorio_verificacao: "Reprovado manualmente pelo administrador.",
        data_verificacao: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success("❌ Prestador reprovado.");
      queryClient.invalidateQueries({ queryKey: ["allProviders"] });
    },
  });

  const reverificaMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('verificarAntecedentes', { service_provider_id: id }),
    onSuccess: (_, id) => {
      toast.success("🔄 Verificação reenviada para Infosimples.");
      queryClient.invalidateQueries({ queryKey: ["allProviders"] });
    },
    onError: (err) => toast.error("Erro ao reverificar: " + err.message),
  });

  if (isLoadingUser) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
        <XCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-bold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground">Esta página é exclusiva para administradores.</p>
      </div>
    );
  }

  const filtered = (providers || []).filter((p) => {
    const matchStatus = filterStatus === "todos" || (p.status_verificacao || "pendente") === filterStatus;
    const matchSearch = !search.trim() ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = (providers || []).reduce((acc, p) => {
    const s = p.status_verificacao || "pendente";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verificações de Segurança</h1>
          <p className="text-muted-foreground text-sm">Gerencie a verificação de antecedentes criminais dos prestadores.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { key: "pendente", label: "Pendentes", color: "border-orange-200 bg-orange-50", text: "text-orange-700" },
          { key: "em_analise_manual", label: "Em Análise", color: "border-orange-200 bg-orange-50", text: "text-orange-700" },
          { key: "aprovado", label: "Aprovados", color: "border-[#3E8E5A]/30 bg-[#3E8E5A]/10", text: "text-[#3E8E5A]" },
          { key: "reprovado", label: "Reprovados", color: "border-red-200 bg-red-50", text: "text-red-700" },
        ].map(({ key, label, color, text }) => (
          <Card key={key} className={`border ${color}`}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${text}`}>{counts[key] || 0}</p>
              <p className={`text-xs font-medium ${text} opacity-80 mt-0.5`}>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["todos", "pendente", "em_analise_manual", "aprovado", "reprovado"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filterStatus === s
                      ? "bg-foreground text-background border-border"
                      : "bg-card text-muted-foreground border-border hover:border-border"
                  }`}
                >
                  {s === "todos" ? "Todos" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtered.length} prestador(es) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle className="w-12 h-12 text-[#3E8E5A]/60 mb-3" />
              <p className="text-muted-foreground font-medium">Nenhum prestador pendente de verificação</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">Prestador</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">CPF</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Tipo</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">UF</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden xl:table-cell">Relatório</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Data</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const s = p.status_verificacao || "pendente";
                    const cfg = statusConfig[s] || statusConfig.pendente;
                    const Icon = cfg.icon;
                    const isActing =
                      aprovaMutation.isPending || reprovaMutation.isPending || reverificaMutation.isPending;

                    return (
                      <tr key={p.id} className="hover:bg-muted transition-colors">
                        <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           {p.full_body_photo_url ? (
                             <img src={p.full_body_photo_url} alt={p.full_name} className="w-10 h-14 rounded object-cover border shrink-0" />
                           ) : p.photo_url ? (
                             <img src={p.photo_url} alt={p.full_name} className="w-10 h-10 rounded-full object-cover border shrink-0" />
                           ) : (
                             <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                               <span className="text-muted-foreground text-xs font-bold">{p.full_name?.charAt(0)}</span>
                             </div>
                           )}
                           <div>
                             <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                             <p className="text-xs text-muted-foreground">{p.email || "—"}</p>
                             {!p.full_body_photo_url && (
                               <span className="text-xs text-amber-600 font-medium">⚠ Sem foto corporal</span>
                             )}
                           </div>
                         </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground font-mono">{maskCPF(p.cpf)}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-xs font-medium uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {p.tipo_pessoa === 'pj' ? 'PJ/MEI' : 'PF'}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">{p.location?.state || "—"}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden xl:table-cell max-w-xs">
                          <p className="text-xs text-muted-foreground line-clamp-2">{p.relatorio_verificacao || "—"}</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {p.data_verificacao
                              ? format(new Date(p.data_verificacao), "dd/MM/yy HH:mm", { locale: ptBR })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reverificaMutation.mutate(p.id)}
                              disabled={isActing}
                              className="text-xs text-orange-700 border-orange-200 hover:bg-orange-50"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Reverificar
                            </Button>
                            {s !== "aprovado" && (
                              <Button
                                size="sm"
                                onClick={() => aprovaMutation.mutate(p.id)}
                                disabled={isActing}
                                className="text-xs bg-orange-600 hover:bg-orange-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprovar
                              </Button>
                            )}
                            {s !== "reprovado" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => reprovaMutation.mutate(p.id)}
                                disabled={isActing}
                                className="text-xs"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reprovar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}