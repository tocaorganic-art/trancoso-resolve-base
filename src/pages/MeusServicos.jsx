import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import LazyImage from "@/components/ui/LazyImage";
import PermissionChecker from "@/components/auth/PermissionChecker";
import ServiceFormModal from "@/components/services/ServiceFormModal";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MeusServicosPage() {
  return (
    <PermissionChecker requiredUserType="prestador">
      <MeusServicosContent />
    </PermissionChecker>
  );
}

function MeusServicosContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: provider, isLoading: isProviderLoading } = useQuery({
    queryKey: ['myServiceProvider', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.ServiceProvider.filter({ created_by: user.email });
      return results[0] || null;
    },
    enabled: !!user,
  });

  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ['myServiceListings', provider?.id],
    queryFn: () => base44.entities.ServiceListing.filter({ provider_id: provider.id }),
    enabled: !!provider,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceListing.create({ ...data, provider_id: provider.id, active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myServiceListings']);
      toast.success('Serviço criado com sucesso!');
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceListing.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myServiceListings']);
      toast.success('Serviço atualizado!');
      setModalOpen(false);
      setEditingService(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.ServiceListing.update(id, { active }),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ['myServiceListings', provider?.id] });
      const previous = queryClient.getQueryData(['myServiceListings', provider?.id]);
      queryClient.setQueryData(['myServiceListings', provider?.id], (old) =>
        (old || []).map((s) => s.id === id ? { ...s, active } : s)
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Status atualizado!');
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['myServiceListings', provider?.id], context.previous);
      }
      toast.error('Erro ao atualizar status.', { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['myServiceListings']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceListing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myServiceListings']);
      toast.success('Serviço removido!');
    },
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleSubmit = (formData) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLoading = isUserLoading || isProviderLoading || isServicesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="px-5 py-12">
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Complete seu Perfil</h2>
          <p className="text-slate-400 mb-6">Primeiro você precisa completar seu perfil de prestador para cadastrar serviços.</p>
          <Link to={createPageUrl("MeuPerfilPrestador")}>
            <button className="px-6 py-3 rounded-xl gradient-amber text-white font-semibold">
              Completar Perfil
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] pb-24">
      {/* HEADER PADRÃO */}
      <header className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Meus Serviços</h1>
        <p className="text-sm text-slate-400 mt-1">Gerencie os serviços que você oferece</p>
      </header>

      <div className="px-5 mt-6">
        <button 
          onClick={handleOpenCreate}
          className="w-full gradient-amber-hover text-white font-semibold py-3 rounded-xl mb-6 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Nenhum serviço cadastrado</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6">Comece cadastrando seu primeiro serviço.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 transition hover:scale-[1.02]"
              >
                {service.images?.[0] && (
                  <LazyImage src={service.images[0]} alt={service.title} className="w-full h-44 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-white">{service.title}</h3>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full border",
                      service.active 
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                        : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                    )}>
                      {service.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{service.description}</p>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      R$ {service.price?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-slate-500">por {service.price_unit}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: service.id, active: !service.active })}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 transition"
                    >
                      {service.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="flex-1 py-2.5 rounded-xl gradient-amber-hover text-white text-sm font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => { if (confirm('Tem certeza?')) deleteMutation.mutate(service.id); }}
                      className="px-4 py-2.5 rounded-xl bg-red-500/90 text-white hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ServiceFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingService(null); }}
        onSubmit={handleSubmit}
        initialData={editingService}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}