import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import RequestDetailsModal from "@/components/agenda/RequestDetailsModal";
import DisponibilidadeEditor from "@/components/agenda/DisponibilidadeEditor";
import { format } from 'date-fns';
import { toast } from "sonner";
import PermissionChecker from "../components/auth/PermissionChecker";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const RequestCard = ({ request, service, onConfirm, onReject }) => {
  const initial = request.client_name?.charAt(0).toUpperCase() || 'C';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-card border border-border p-4 mb-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full gradient-amber flex items-center justify-center font-bold text-white shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground truncate">{request.client_name}</p>
          <p className="text-xs text-muted-foreground truncate">{service?.title || 'Serviço'}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        <p>📅 {format(new Date(request.date), "dd/MM/yyyy")}</p>
        <p>📍 {request.location?.address || 'Endereço não informado'}</p>
      </div>
      {request.status === 'Pendente' && (
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => onConfirm(request.id)}
            className="flex-1 py-2.5 rounded-xl gradient-amber text-white font-semibold text-sm"
          >
            Aceitar
          </button>
          <button
            onClick={() => onReject(request)}
            className="flex-1 py-2.5 rounded-xl bg-muted border border-border text-muted-foreground font-medium text-sm"
          >
            Recusar
          </button>
        </div>
      )}
    </motion.div>
  );
};

function MinhaAgendaContent() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Pendente');

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myProvider, isLoading: isProviderLoading } = useQuery({
    queryKey: ['myProviderProfile', user?.email],
    queryFn: async () => {
      const results = await base44.entities.ServiceProvider.filter({ created_by: user.email });
      return results[0] || null;
    },
    enabled: !!user?.email,
  });

  const providerId = myProvider?.id;

  // CORREÇÃO CRÍTICA: Filtrar por provider_email (não por provider_id)
  // provider_id é o ID da entidade ServiceProvider, mas provider_email é o email do usuário logado
  const { data: serviceRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['serviceRequests', user?.email],
    queryFn: async () => {
      // Buscar todas as solicitações onde o prestador é o usuário logado (por email)
      const allRequests = await base44.entities.ServiceRequest.filter({}, '-created_date');
      return allRequests.filter(req => req.provider_email === user.email);
    },
    enabled: !!user?.email && !!providerId,
    refetchInterval: 5000, // Refresh a cada 5 segundos para atualizações em tempo real
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['allProviderServices', providerId],
    queryFn: async () => {
      const providerServices = await base44.entities.ServiceListing.filter({ provider_id: providerId });
      const serviceMap = {};
      providerServices.forEach(s => {
        serviceMap[s.id] = s;
      });
      return serviceMap;
    },
    enabled: !!providerId,
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceRequest.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['serviceRequests', user?.email] });
      const previous = queryClient.getQueryData(['serviceRequests', user?.email]);
      queryClient.setQueryData(['serviceRequests', user?.email], (old) =>
        (old || []).map((r) => r.id === id ? { ...r, ...data } : r)
      );
      return { previous };
    },
    onSuccess: (updatedRequest) => {
      toast.success(`Solicitação ${updatedRequest.status.toLowerCase()} com sucesso!`);
      setIsModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['serviceRequests', user?.email], context.previous);
      }
      toast.error("Erro ao atualizar solicitação.", { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
    },
  });

  const handleConfirm = (id) => {
    updateRequestMutation.mutate({ id, data: { status: 'Confirmado' } });
  };

  const handleReject = (id, reason) => {
    updateRequestMutation.mutate({ id, data: { status: 'Rejeitado', provider_response: reason } });
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Delay closing to allow for animation
    setTimeout(() => setSelectedRequest(null), 300);
  };

  const requestsByStatus = useMemo(() => {
    const statuses = {
      Pendente: [],
      Confirmado: [],
      Concluído: [],
      Rejeitado: [],
      Cancelado: []
    };
    (serviceRequests || []).forEach(req => {
      if (statuses[req.status]) {
        statuses[req.status].push(req);
      }
    });
    return statuses;
  }, [serviceRequests]);

  const isLoading = isUserLoading || isProviderLoading || (!!providerId && (isLoadingRequests || isLoadingServices));

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-orange-600" /></div>;
  }

  const renderRequestList = (requests, status) => {
    if (!requests || requests.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-bold text-foreground">Nenhum agendamento {status === 'Pendente' ? 'pendente' : 'nesta categoria'}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {status === 'Pendente' 
              ? 'Quando clientes solicitarem, aparecerão aqui.'
              : 'Esta categoria está vazia.'}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {requests.map((req, index) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <RequestCard
              request={req}
              service={services?.[req.service_id]}
              onConfirm={handleConfirm}
              onReject={(req) => openModal(req)}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* HEADER PADRÃO */}
      <header className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Minha Agenda</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie solicitações e disponibilidade</p>
      </header>

      <div className="px-5 mt-6">
        {/* ABAS SIMPLIFICADAS */}
        <div className="flex gap-2 bg-muted p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('Pendente')}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition",
              activeTab === 'Pendente' 
                ? "gradient-amber text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pendentes <span className="ml-1 px-1.5 rounded-full bg-muted-foreground/20 text-xs">{requestsByStatus.Pendente.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('Confirmado')}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition",
              activeTab === 'Confirmado'
                ? "gradient-amber text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Confirmados
          </button>
          <button
            onClick={() => setActiveTab('Disponibilidade')}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition",
              activeTab === 'Disponibilidade'
                ? "gradient-amber text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Horários
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        {activeTab === 'Pendente' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderRequestList(requestsByStatus.Pendente, 'Pendente')}
          </motion.div>
        )}
        {activeTab === 'Confirmado' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            {renderRequestList(requestsByStatus.Confirmado, 'Confirmado')}
          </motion.div>
        )}
        {activeTab === 'Disponibilidade' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl bg-card border border-border p-4"
          >
            <DisponibilidadeEditor providerId={providerId} />
          </motion.div>
        )}
      </div>

      {selectedRequest && services && (
        <RequestDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          request={selectedRequest}
          service={services[selectedRequest.service_id]}
          onConfirm={handleConfirm}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default function MinhaAgendaPage() {
  return (
    <PermissionChecker requiredUserType="prestador">
      <MinhaAgendaContent />
    </PermissionChecker>
  );
}