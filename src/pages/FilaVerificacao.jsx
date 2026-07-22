import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Loader2, ShieldCheck, BadgeCheck, Clock, XCircle, AlertTriangle,
  Eye, CheckCircle, XOctagon, Filter, Search, Calendar, Phone, User, CreditCard, RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import VerificacaoBadge from "@/components/verificacao/VerificacaoBadge";

// Status normalizados (apenas português)
const STATUS_MAP = {
  'in_progress': 'Em Análise',
  'pending': 'Pendente',
  'awaiting_admin': 'Aguardando Admin',
  'approved': 'Verificado',
  'rejected': 'Rejeitado',
  'Em Análise': 'Em Análise',
  'Pendente': 'Pendente',
  'Aguardando Admin': 'Aguardando Admin',
  'Verificado': 'Verificado',
  'Rejeitado': 'Rejeitado',
};

const normalizeStatus = (status) => STATUS_MAP[status] || 'Pendente';

const statusConfig = {
"Em Análise": { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
"Aguardando Admin": { color: "bg-amber-100 text-amber-700 border-amber-200", icon: ShieldCheck },
"Pendente": { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
"Verificado": { color: "bg-[#3E8E5A]/10 text-[#3E8E5A] border-[#3E8E5A]/30", icon: BadgeCheck },
"Rejeitado": { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || {};
  const Icon = cfg.icon || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function ReviewModal({ verificacao, isOpen, onClose, onAction }) {
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: provider } = useQuery({
    queryKey: ['providerForVerificacao', verificacao?.user_email],
    queryFn: async () => {
      if (!verificacao?.user_email) return null;
      const results = await base44.entities.ServiceProvider.filter({ email: verificacao.user_email });
      return results[0] || null;
    },
    enabled: !!verificacao?.user_email && isOpen,
  });

  const normalizeStatus = (status) => {
    const STATUS_MAP = {
      'in_progress': 'Em Análise',
      'pending': 'Pendente',
      'awaiting_admin': 'Aguardando Admin',
      'approved': 'Verificado',
      'rejected': 'Rejeitado',
    };
    return STATUS_MAP[status] || status;
  };

  const tipoPessoaLabel = { pf: 'Pessoa Física', mei: 'MEI', pj: 'Pessoa Jurídica' };

  const handleAction = async (action) => {
    if (action === "rejeitar" && !motivo.trim()) {
      toast.error("Informe o motivo da rejeição.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onAction(verificacao.id, action, motivo);
      onClose();
      setMotivo("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!verificacao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-muted-foreground" />
            Analisar Documento — {verificacao.user_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-2">
          {/* Imagem do documento */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Documento Enviado</Label>
            <div className="rounded-xl border bg-muted overflow-hidden">
              <img
                src={verificacao.document_url}
                alt="Documento"
                className="w-full object-contain max-h-64"
              />
            </div>
          </div>

          {/* Fotos do prestador para confronto visual */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Fotos do Prestador</Label>
            {provider ? (
              <div className="flex gap-2 flex-wrap">
                {provider.full_body_photo_url && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Corpo inteiro</p>
                    <img src={provider.full_body_photo_url} alt="Foto de corpo inteiro" className="h-44 rounded-lg object-cover border" />
                  </div>
                )}
                {provider.photo_url && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Perfil</p>
                    <img src={provider.photo_url} alt="Foto de perfil" className="h-44 w-28 rounded-lg object-cover border" />
                  </div>
                )}
                {!provider.full_body_photo_url && !provider.photo_url && (
                  <p className="text-sm text-muted-foreground italic">Nenhuma foto enviada ainda.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Carregando...</p>
            )}
          </div>

          {/* Detalhes */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Usuário</Label>
              <p className="font-medium text-foreground mt-0.5">{verificacao.user_name}</p>
              <p className="text-sm text-muted-foreground">{verificacao.user_email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo Doc.</Label>
                <p className="font-medium text-sm mt-0.5">{verificacao.document_type}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                <div className="mt-0.5">
                  <StatusBadge status={normalizeStatus(verificacao.status)} />
                </div>
              </div>
            </div>

            {/* Dados do prestador */}
            {provider && (
              <div className="bg-muted border border-border rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dados do Prestador</p>
                {provider.phone && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <a href={`https://wa.me/55${provider.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-[#3E8E5A] hover:underline font-medium">{provider.phone}</a>
                  </div>
                )}
                {provider.cpf && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>CPF: {provider.cpf}</span>
                  </div>
                )}
                {provider.cnpj && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>CNPJ: {provider.cnpj}</span>
                  </div>
                )}
                {provider.tipo_pessoa && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{tipoPessoaLabel[provider.tipo_pessoa] || provider.tipo_pessoa} — {provider.occupation}</span>
                  </div>
                )}
                {provider.razao_social && (
                  <p className="text-xs text-muted-foreground">Razão Social: {provider.razao_social}</p>
                )}
              </div>
            )}

            {verificacao.ai_extracted_name && (
              <div className="bg-muted border border-border rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Análise da IA</p>
                <p className="text-sm text-foreground">
                  <span className="text-brand-primary font-medium">Nome extraído:</span> {verificacao.ai_extracted_name}
                </p>
                {verificacao.ai_extracted_dob && (
                  <p className="text-sm text-foreground">
                    <span className="text-brand-primary font-medium">Data nasc.:</span> {verificacao.ai_extracted_dob}
                  </p>
                )}
                {verificacao.ai_confidence != null && (
                  <p className="text-sm text-foreground">
                    <span className="text-brand-primary font-medium">Confiança:</span> {Math.round((verificacao.ai_confidence || 0) * 100)}%
                  </p>
                )}
              </div>
            )}

            {verificacao.admin_notes && (
              <div className="bg-muted border border-border rounded-lg p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{verificacao.admin_notes}</p>
              </div>
            )}

            {/* Motivo rejeição */}
            {["Em Análise", "Aguardando Admin", "Pendente"].includes(verificacao.status) && (
              <div className="space-y-1.5">
                <Label htmlFor="motivo" className="text-xs text-muted-foreground uppercase tracking-wide">
                  Motivo da rejeição (se for rejeitar)
                </Label>
                <Textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Documento ilegível, foto não corresponde ao nome..."
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Fechar</Button>
          {["Em Análise", "Aguardando Admin", "Pendente"].includes(verificacao.status) && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleAction("rejeitar")}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XOctagon className="w-4 h-4" />}
                Rejeitar
              </Button>
              <Button
                onClick={() => handleAction("aprovar")}
                disabled={isSubmitting}
                className="bg-brand-primary hover:bg-orange-700 gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Aprovar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FilaVerificacaoPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selected, setSelected] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [quickActionId, setQuickActionId] = useState(null);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: verificacoes, isLoading } = useQuery({
    queryKey: ["todasVerificacoes"],
    queryFn: () => base44.entities.Verificacao.filter({}, "-created_date", 200),
    enabled: !!user && user?.role === "admin",
    staleTime: 0,
  });

  const handleAction = async (id, action, motivo) => {
    setQuickActionId(id);
    try {
      const verificacao = verificacoes.find(v => v.id === id);
      if (!verificacao) throw new Error('Verificação não encontrada');

      // Atualizar status da verificação (sempre salvar em português para consistência)
      const newStatus = action === "aprovar" ? "Verificado" : "Rejeitado";
      await base44.entities.Verificacao.update(id, {
        status: newStatus,
        ...(action === "rejeitar" && { rejection_reason: motivo }),
        admin_action_date: new Date().toISOString(),
      });

      // Se aprovado, atualizar ServiceProvider para aprovado
      if (action === "aprovar" && verificacao.provider_id) {
        await base44.entities.ServiceProvider.update(verificacao.provider_id, {
          status_verificacao: "aprovado",
          verified: true,
          verification_approved_date: new Date().toISOString(),
        });
      } else if (action === "rejeitar" && verificacao.provider_id) {
        await base44.entities.ServiceProvider.update(verificacao.provider_id, {
          status_verificacao: "reprovado",
          verified: false,
          rejection_reason: motivo,
        });
      }

      toast.success(action === "aprovar" ? "✅ Identidade aprovada!" : "❌ Verificação rejeitada.");
      queryClient.invalidateQueries({ queryKey: ["todasVerificacoes"] });
    } catch (error) {
      toast.error("Erro ao processar.", { description: error.message });
    } finally {
      setQuickActionId(null);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
        <XCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-bold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-sm">Esta página é exclusiva para administradores da plataforma.</p>
      </div>
    );
  }

  const filtered = (verificacoes || []).filter((v) => {
    const normalizedStatus = normalizeStatus(v.status);
    const matchStatus = statusFilter === "Todos" || normalizedStatus === statusFilter;
    const matchSearch = !search.trim() ||
      (v.user_name || v.user_email)?.toLowerCase().includes(search.toLowerCase()) ||
      v.user_email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = (verificacoes || []).reduce((acc, v) => {
    const normalized = normalizeStatus(v.status);
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-7 h-7 text-amber-600" />
            <h1 className="text-2xl font-bold text-foreground">Fila de Verificação</h1>
          </div>
          <p className="text-muted-foreground text-sm">Analise os documentos enviados e aprove ou rejeite identidades.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["todasVerificacoes"] })}
          className="gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Em Análise", key: "Em Análise", color: "border-amber-200 bg-amber-50", textColor: "text-amber-700" },
          { label: "Aguardando Admin", key: "Aguardando Admin", color: "border-orange-200 bg-orange-50", textColor: "text-orange-700" },
          { label: "Pendente", key: "Pendente", color: "border-orange-200 bg-orange-50", textColor: "text-orange-700" },
          { label: "Verificado", key: "Verificado", color: "border-[#3E8E5A]/30 bg-[#3E8E5A]/10", textColor: "text-[#3E8E5A]" },
          { label: "Rejeitado", key: "Rejeitado", color: "border-red-200 bg-red-50", textColor: "text-red-700" },
        ].map(({ label, key, color, textColor }) => (
          <Card key={key} className={`border ${color} cursor-pointer hover:shadow-sm transition-shadow`} onClick={() => setStatusFilter(key)}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${textColor}`}>{counts[key] || 0}</p>
              <p className={`text-xs font-medium ${textColor} opacity-80 mt-0.5`}>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os status</SelectItem>
                <SelectItem value="Em Análise">Em Análise</SelectItem>
                <SelectItem value="Aguardando Admin">Aguardando Admin</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Verificado">Verificado</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtered.length} {statusFilter === "Todos" ? "verificações" : `em status "${statusFilter}"`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
              <p className="text-muted-foreground font-medium">Nenhuma verificação encontrada</p>
              <p className="text-muted-foreground text-sm mt-1 opacity-70">
                {statusFilter === "Em Análise" ? "Não há documentos aguardando análise." : "Tente outro filtro."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">Usuário</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">Tipo</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Enviado em</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((v) => {
                    const normalizedStatus = normalizeStatus(v.status);
                    const isPending = ["Em Análise", "Aguardando Admin", "Pendente"].includes(normalizedStatus);
                    const isProcessing = quickActionId === v.id;
                    const displayName = v.user_name || v.user_email || 'Usuário removido';
                    return (
                    <tr key={v.id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <span className="text-amber-700 font-semibold text-xs">
                              {displayName?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                              {displayName}
                              {normalizedStatus === "Verificado" && <VerificacaoBadge verified size="xs" />}
                            </p>
                            <p className="text-xs text-muted-foreground">{v.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-sm font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                          {v.document_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {v.submission_date
                            ? format(new Date(v.submission_date), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : format(new Date(v.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={normalizeStatus(v.status)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => { setSelected(v); setReviewOpen(true); }}
                                          className="text-xs hover:border-amber-400 hover:text-amber-700 transition-colors"
                                        >
                                          <Eye className="w-3.5 h-3.5 mr-1" />
                                          Ver
                                        </Button>
                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isProcessing}
                                onClick={() => handleAction(v.id, "rejeitar", "Rejeitado via ação rápida")}
                                className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                              >
                                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XOctagon className="w-3.5 h-3.5" />}
                              </Button>
                              <Button
                                              size="sm"
                                              disabled={isProcessing}
                                              onClick={() => handleAction(v.id, "aprovar", "")}
                                              className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                            >
                                              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                            </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );})}  
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewModal
        verificacao={selected}
        isOpen={reviewOpen}
        onClose={() => { setReviewOpen(false); setSelected(null); }}
        onAction={handleAction}
      />
    </div>
  );
}