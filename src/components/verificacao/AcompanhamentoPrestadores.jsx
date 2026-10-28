import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Check, MessageCircle, ThumbsUp, FileCheck2, ShieldCheck, Phone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const PASSOS = [
  { key: "contatado", label: "Contatado", icon: MessageCircle },
  { key: "respondeu", label: "Respondeu", icon: ThumbsUp },
  { key: "documentos_enviados", label: "Docs enviados", icon: FileCheck2 },
  { key: "aprovado", label: "Aprovado", icon: Check },
];

const toList = (res) => (Array.isArray(res) ? res : res?.items || []);

export default function AcompanhamentoPrestadores() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [savingId, setSavingId] = useState(null);

  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ["prestadoresSemVerificacao"],
    queryFn: async () => {
      const list = toList(await base44.entities.ServiceProvider.filter({}, "-created_date", 500));
      return list.filter((p) => p.verified !== true && p.status_verificacao !== "aprovado");
    },
    staleTime: 0,
  });

  const { data: acompanhamentos = [], isLoading: isLoadingAcomp } = useQuery({
    queryKey: ["acompanhamentoVerificacao"],
    queryFn: async () => toList(await base44.entities.AcompanhamentoVerificacao.filter({}, "-created_date", 500)),
    staleTime: 0,
  });

  const byProvider = useMemo(() => {
    const map = {};
    acompanhamentos.forEach((a) => {
      if (a.provider_id) map[a.provider_id] = a;
    });
    return map;
  }, [acompanhamentos]);

  const handleToggle = async (provider, key) => {
    const atual = byProvider[provider.id];
    const novoValor = !atual?.[key];
    const dados = { [key]: novoValor, [`${key}_em`]: novoValor ? new Date().toISOString() : null };
    setSavingId(provider.id);
    try {
      if (atual) {
        await base44.entities.AcompanhamentoVerificacao.update(atual.id, dados);
      } else {
        await base44.entities.AcompanhamentoVerificacao.create({
          provider_id: provider.id,
          provider_name: provider.full_name,
          provider_email: provider.email,
          provider_phone: provider.phone,
          ocupacao: provider.occupation,
          ...dados,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["acompanhamentoVerificacao"] });
    } catch (error) {
      toast.error("Não foi possível salvar.", { description: error.message });
    } finally {
      setSavingId(null);
    }
  };

  const rows = providers
    .filter((p) => {
      const acomp = byProvider[p.id];
      if (filter === "sem_contato") return !acomp?.contatado;
      if (filter === "aguardando_docs") return acomp?.contatado && !acomp?.documentos_enviados;
      if (filter === "aprovados") return !!acomp?.aprovado;
      return true;
    })
    .filter((p) => {
      if (!search.trim()) return true;
      const termo = search.toLowerCase();
      return [p.full_name, p.email, p.phone, p.occupation].some((v) => (v || "").toLowerCase().includes(termo));
    });

  const totals = providers.reduce(
    (acc, p) => {
      const acomp = byProvider[p.id] || {};
      acc.total += 1;
      if (acomp.contatado) acc.contatados += 1;
      if (acomp.respondeu) acc.responderam += 1;
      if (acomp.documentos_enviados) acc.docs += 1;
      if (acomp.aprovado) acc.aprovados += 1;
      return acc;
    },
    { total: 0, contatados: 0, responderam: 0, docs: 0, aprovados: 0 }
  );

  const isLoading = isLoadingProviders || isLoadingAcomp;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Sem verificação", value: totals.total, color: "border-border bg-card", text: "text-foreground" },
          { label: "Contatados", value: totals.contatados, color: "border-amber-200 bg-amber-50", text: "text-amber-700" },
          { label: "Docs enviados", value: totals.docs, color: "border-orange-200 bg-orange-50", text: "text-orange-700" },
          { label: "Aprovados", value: totals.aprovados, color: "border-accent/30 bg-accent/10", text: "text-accent" },
        ].map(({ label, value, color, text }) => (
          <Card key={label} className={`border ${color}`}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
              <p className={`text-xs font-medium ${text} opacity-80 mt-0.5`}>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou ocupação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "todos", label: "Todos" },
                { key: "sem_contato", label: "Sem contato" },
                { key: "aguardando_docs", label: "Aguardando docs" },
                { key: "aprovados", label: "Aprovados" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={filter === key ? "default" : "outline"}
                  onClick={() => setFilter(key)}
                  className={filter === key ? "bg-brand-primary hover:bg-orange-700 text-white" : ""}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {rows.length} {rows.length === 1 ? "prestador" : "prestadores"} para acompanhar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">Nenhum prestador nesta condição</p>
              <p className="text-muted-foreground text-sm mt-1 opacity-70">
                Todos os cadastros aparecem aqui já foram verificados ou não batem com o filtro.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">Prestador</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Cadastro</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Checklist</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">Progresso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((p) => {
                    const acomp = byProvider[p.id] || {};
                    const concluidos = PASSOS.filter(({ key }) => acomp[key]).length;
                    const isSaving = savingId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-muted transition-colors align-top">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.photo_url ? (
                                <img src={p.photo_url} alt={p.full_name || "Prestador"} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-amber-700 font-semibold text-xs">
                                  {p.full_name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{p.full_name || "Sem nome"}</p>
                              <p className="text-xs text-muted-foreground">{p.occupation || "Ocupação não informada"}</p>
                              {p.email && <p className="text-xs text-muted-foreground truncate">{p.email}</p>}
                              {p.phone && (
                                <a
                                  href={`https://wa.me/55${p.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline mt-0.5"
                                >
                                  <Phone className="w-3 h-3" />
                                  {p.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {p.created_date ? format(new Date(p.created_date), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {PASSOS.map(({ key, label, icon: Icon }) => {
                              const ativo = !!acomp[key];
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleToggle(p, key)}
                                  aria-pressed={ativo}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-60 ${
                                    ativo
                                      ? "bg-accent/10 text-accent border-accent/40"
                                      : "bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                          {isSaving && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                              <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-brand-primary transition-all"
                                style={{ width: `${(concluidos / PASSOS.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{concluidos}/4</span>
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