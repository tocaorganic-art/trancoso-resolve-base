import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors = {
  'captured': { bg: '#dcfce7', color: '#15803d', label: 'Pago', Icon: CheckCircle2 },
  'requires_payment_method': { bg: '#fef9c3', color: '#854d0e', label: 'Aguardando Pagamento' },
  'requires_capture': { bg: '#dbeafe', color: '#1d4ed8', label: 'Em Custódia', Icon: DollarSign },
  'canceled': { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelado' },
  'disputed': { bg: '#fee2e2', color: '#dc2626', label: 'Em Disputa', Icon: ShieldAlert },
  'refunded': { bg: '#f3e8ff', color: '#6b21a8', label: 'Reembolsado' },
};

function StatusBadge({ status }) {
  const cfg = statusColors[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  const Icon = cfg.Icon;
  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: cfg.bg,
      color: cfg.color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {cfg.label}
    </span>
  );
}

export default function AdminPagamentosPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ['allPayments'],
    queryFn: () => base44.entities.Payment.list('-created_date', 200),
    enabled: !!user && user.role === 'admin',
    initialData: [],
    staleTime: 0,
  });

  const { data: providers } = useQuery({
    queryKey: ['allProviders'],
    queryFn: () => base44.entities.ServiceProvider.list(),
    initialData: [],
  });

  // Aguarda usuário carregar (undefined = ainda carregando)
  if (user === undefined) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

  // Usuário não autenticado → redireciona para login
  if (user === null) {
    base44.auth.redirectToLogin(window.location.pathname);
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

  // Usuário autenticado mas sem role admin
  if (user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-bold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground max-w-sm">Esta página é exclusiva para administradores da plataforma.</p>
        <button onClick={() => base44.auth.redirectToLogin()} className="text-sm text-orange-600 underline">Entrar com outra conta</button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const filtered = payments.filter(p => {
    const matchSearch = !search ||
      p.client_email?.toLowerCase().includes(search.toLowerCase()) ||
      p.request_id?.includes(search) ||
      p.stripe_payment_intent_id?.includes(search);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Paginação
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedData = filtered.slice(startIndex, endIndex);
  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const nextPage = () => setPage(p => Math.min(totalPages, p + 1));

  // Métricas
  const totalCaptured = filtered.filter(p => p.status === 'captured').reduce((s, p) => s + (p.amount_total || 0), 0);
  const totalPlatform = filtered.filter(p => p.status === 'captured').reduce((s, p) => s + (p.amount_platform || 0), 0);
  const pendingCapture = filtered.filter(p => p.status === 'requires_capture').length;
  const disputed = filtered.filter(p => p.status === 'disputed').length;

  const providerMap = Object.fromEntries(providers.map(p => [p.id, p]));

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .table-container { overflow-x: auto; }
          .filter-bar { flex-direction: column; }
        }
      `}</style>

      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Pagamentos</h1>
          <p className="text-muted-foreground text-sm">Monitoramento de transações e split</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Cards de métricas */}
        <div className="kpi-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card style={{ borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #22c55e', display: 'flex', flexDirection: 'column', gap: 8 }} className="bg-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Volume Capturado</span>
              </div>
              {totalCaptured === 0 ? (
                <span className="text-muted-foreground text-xs">Nenhuma transação ainda</span>
              ) : (
                <p className="text-xl font-bold text-foreground">R$ {(totalCaptured / 100).toFixed(2)}</p>
              )}
            </CardContent>
          </Card>
          <Card style={{ borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: 8 }} className="bg-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                <span className="text-xs text-muted-foreground">Comissão Plataforma (20%)</span>
              </div>
              {totalPlatform === 0 ? (
                <span className="text-muted-foreground text-xs">Nenhuma transação ainda</span>
              ) : (
                <p className="text-xl font-bold text-foreground">R$ {(totalPlatform / 100).toFixed(2)}</p>
              )}
            </CardContent>
          </Card>
          <Card style={{ borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: 8 }} className="bg-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Em Custódia</span>
              </div>
              {pendingCapture === 0 ? (
                <span className="text-muted-foreground text-xs">Nenhuma transação ainda</span>
              ) : (
                <p className="text-xl font-bold text-foreground">{pendingCapture}</p>
              )}
            </CardContent>
          </Card>
          <Card style={{ borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', gap: 8 }} className="bg-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Em Disputa</span>
              </div>
              {disputed === 0 ? (
                <span className="text-muted-foreground text-xs">Nenhuma transação ainda</span>
              ) : (
                <p className="text-xl font-bold text-red-500">{disputed}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="filter-bar flex flex-col sm:flex-row gap-3 items-center">
          <input
            placeholder="Buscar por email, ID da solicitação..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm w-full"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm min-w-[140px]"
          >
            <option value="all">Todos os status</option>
            <option value="requires_payment_method">Aguardando Pagamento</option>
            <option value="requires_capture">Em Custódia</option>
            <option value="captured">Capturado</option>
            <option value="canceled">Cancelado</option>
            <option value="disputed">Em Disputa</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>

        {/* Tabela */}
        <Card className="table-container bg-card border-border">
          <CardContent className="p-0 overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-6">
                <p className="text-lg font-semibold text-muted-foreground mt-3">Nenhuma transação encontrada</p>
                <p className="text-sm text-muted-foreground">As transações aparecerão aqui assim que ocorrerem.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left px-4 py-3">Data</th>
                    <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left px-4 py-3">Cliente</th>
                    <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left px-4 py-3">Prestador</th>
                    <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right px-4 py-3">Total</th>
                    <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right px-4 py-3">Prestador (80%)</th>
                    <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right px-4 py-3">Plataforma (20%)</th>
                    <th className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((payment, index) => {
                    const provider = providerMap[payment.provider_id];
                    return (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-left">
                          {format(new Date(payment.created_date), 'dd/MM/yy HH:mm', { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 text-foreground text-left">{payment.client_email}</td>
                        <td className="px-4 py-3 text-foreground text-left">{provider?.full_name || payment.provider_id}</td>
                        <td className="px-4 py-3 text-foreground font-semibold text-right">R$ {((payment.amount_total || 0) / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-[#3E8E5A] text-right">R$ {((payment.amount_provider || 0) / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-orange-600 text-right">R$ {((payment.amount_platform || 0) / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-left">
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            
            {/* Paginação */}
            {filtered.length > 0 && (
              <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-border text-muted-foreground text-sm">
                <span>Mostrando {startIndex + 1}–{endIndex} de {filtered.length} transações</span>
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded border border-border bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded border border-border bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
