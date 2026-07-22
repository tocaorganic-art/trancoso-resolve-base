import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Megaphone, Eye, MousePointerClick, Percent } from "lucide-react";
import { toast } from "sonner";
import PermissionChecker from "@/components/auth/PermissionChecker";
import AnuncioFormModal from "@/components/anuncios/AnuncioFormModal";

export default function DashboardLojistaPage() {
  return (
    <PermissionChecker requiredUserType="lojista">
      <DashboardLojistaContent />
    </PermissionChecker>
  );
}

function DashboardLojistaContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: anuncios, isLoading: isAnunciosLoading } = useQuery({
    queryKey: ['myAnuncios', user?.id],
    queryFn: () => base44.entities.Anuncio.filter({ lojista_id: user.id }),
    enabled: !!user,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Anuncio.create({ ...data, lojista_id: user.id, ativo: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myAnuncios']);
      toast.success('Anúncio criado com sucesso!');
      setModalOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao criar anúncio.', { description: error.message });
    },
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: ({ id, ativo }) => base44.entities.Anuncio.update(id, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myAnuncios']);
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status.', { description: error.message });
    },
  });

  const isLoading = isUserLoading || isAnunciosLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const safeAnuncios = Array.isArray(anuncios) ? anuncios : [];
  const totalImpressoes = safeAnuncios.reduce((sum, a) => sum + (a.impressoes || 0), 0);
  const totalCliques = safeAnuncios.reduce((sum, a) => sum + (a.cliques || 0), 0);
  const ctr = totalImpressoes > 0 ? (totalCliques / totalImpressoes) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Megaphone className="w-7 h-7 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Anúncios</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho dos seus anúncios em Trancoso.</p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-brand-primary hover:bg-orange-700 rounded-pill">
          <Plus className="w-5 h-5 mr-2" />
          Criar novo anúncio
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-none shadow-warm-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <p className="text-sm font-medium">Impressões</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalImpressoes.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-warm-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <MousePointerClick className="w-4 h-4" />
              <p className="text-sm font-medium">Cliques</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalCliques.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-warm-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Percent className="w-4 h-4" />
              <p className="text-sm font-medium">CTR</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{ctr.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de anúncios */}
      {safeAnuncios.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">Nada por aqui ainda</h3>
          <p className="text-sm text-muted-foreground mt-2">Que tal criar seu primeiro anúncio?</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeAnuncios.map((anuncio) => (
            <Card key={anuncio.id} className="border-none shadow-warm-sm">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground truncate">{anuncio.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(anuncio.impressoes || 0).toLocaleString('pt-BR')} impressões · {(anuncio.cliques || 0).toLocaleString('pt-BR')} cliques
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground">{anuncio.ativo ? 'Ativo' : 'Inativo'}</span>
                  <Switch
                    checked={!!anuncio.ativo}
                    onCheckedChange={(checked) => toggleAtivoMutation.mutate({ id: anuncio.id, ativo: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AnuncioFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
