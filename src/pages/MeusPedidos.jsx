import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Info, Star, CreditCard, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReviewModal from '@/components/reviews/ReviewModal';
import ConfirmarServicoButton from '@/components/pagamento/ConfirmarServicoButton';
import StatusPagamentoBadge from '@/components/pagamento/StatusPagamentoBadge';

const statusConfig = {
  Pendente: { color: "bg-amber-100 text-amber-800 border-amber-200", text: "Pendente" },
  Confirmado: { color: "bg-[#3E8E5A]/10 text-[#3E8E5A] border-[#3E8E5A]/30", text: "Confirmado" },
  "Em Andamento": { color: "bg-orange-100 text-orange-800 border-orange-200", text: "Em Andamento" },
  Concluído: { color: "bg-muted text-foreground border-border", text: "Concluído" },
  Rejeitado: { color: "bg-red-100 text-red-800 border-red-200", text: "Rejeitado" },
  Cancelado: { color: "bg-muted text-foreground border-border", text: "Cancelado" },
};

function RequestCard({ request, provider, onReviewClick, hasReview, payment, onPaymentConfirmed }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Prestador:</p>
            <CardTitle className="text-lg">{provider?.full_name || "Carregando..."}</CardTitle>
          </div>
          <Badge className={`${statusConfig[request.status]?.color} font-medium`}>
            {statusConfig[request.status]?.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{format(new Date(request.date), "PPP", { locale: ptBR })}</span>
        </div>
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md border border-border">{request.message || "Nenhuma observação enviada."}</p>

        {/* Informações de pagamento */}
        {payment && (
          <div className="border border-border rounded-lg p-3 bg-muted space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CreditCard className="w-4 h-4" />
                Pagamento
              </div>
              <StatusPagamentoBadge status={payment.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              <span>Total: <strong>R$ {((payment.amount_total || 0) / 100).toFixed(2)}</strong></span>
            </div>
            {payment.status === 'requires_capture' && payment.auto_capture_after && (
              <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                <Clock className="w-3 h-3 shrink-0" />
                Auto-liberação em: {format(new Date(payment.auto_capture_after), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Botão confirmar serviço (escrow) */}
      {payment && (
        <div className="px-6 pb-3">
          <ConfirmarServicoButton payment={payment} onConfirmed={onPaymentConfirmed} />
        </div>
      )}

      {/* Botão avaliação */}
      {(request.status === 'Concluído' || hasReview) && (
        <div className="p-4 pt-0">
          <Button
            className="w-full border-border text-foreground"
            variant={hasReview ? "secondary" : "outline"}
            onClick={() => !hasReview && onReviewClick(request, provider)}
            disabled={hasReview}
          >
            <Star className="w-4 h-4 mr-2" />
            {hasReview ? "Serviço Avaliado" : "Avaliar Serviço"}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function MeusPedidosPage() {
  const [reviewingRequest, setReviewingRequest] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: requests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['myServiceRequests', user?.email],
    queryFn: () => base44.entities.ServiceRequest.filter({}, '-date'),
    enabled: !!user,
    initialData: [],
  });

  const { data: reviews } = useQuery({
    queryKey: ['myReviews', user?.id],
    queryFn: () => base44.entities.ServiceReview.filter({ created_by: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: providers } = useQuery({
    queryKey: ['allProviders'],
    queryFn: () => base44.entities.ServiceProvider.list(),
    initialData: [],
  });

  const { data: payments, refetch: refetchPayments } = useQuery({
    queryKey: ['myPayments', user?.email],
    queryFn: () => base44.entities.Payment.filter({ client_email: user.email }),
    enabled: !!user,
    initialData: [],
  });

  if (isLoadingRequests) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const reviewedRequestIds = new Set(reviews.map(r => r.request_id));
  const paymentByRequestId = Object.fromEntries((payments || []).map(p => [p.request_id, p]));

  return (
    <div className="bg-background min-h-screen pb-24">
      {reviewingRequest && (
        <ReviewModal
          request={reviewingRequest.request}
          provider={reviewingRequest.provider}
          user={user}
          onClose={() => setReviewingRequest(null)}
        />
      )}
      <header className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Meus Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe, confirme e avalie suas solicitações</p>
      </header>
      <div className="px-5 mt-6">
        {requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => {
              const provider = providers.find(p => p.id === req.provider_id);
              const hasReview = reviewedRequestIds.has(req.id);
              const payment = paymentByRequestId[req.id];
              return (
                <RequestCard
                  key={req.id}
                  request={req}
                  provider={provider}
                  hasReview={hasReview}
                  payment={payment}
                  onPaymentConfirmed={refetchPayments}
                  onReviewClick={(request, provider) => setReviewingRequest({ request, provider })}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-card border border-border">
            <Info className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground mt-2 mb-6">Por enquanto, nada por aqui — assim que pintar algo, te aviso!</p>
            <Link to={createPageUrl("Home")}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">Bora resolver</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}