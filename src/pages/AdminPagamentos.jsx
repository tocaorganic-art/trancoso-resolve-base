import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusPagamentoBadge from '@/components/pagamento/StatusPagamentoBadge';

const statusColors = {
  'captured': { bg: '#dcfce7', color: '#15803d', label: '✅ Pago' },
  'requires_payment_method': { bg: '#fef9c3', color: '#854d0e', label: 'Aguardando Pagamento' },
  'requires_capture': { bg: '#dbeafe', color: '#1d4ed8', label: '💰 Em Custódia' },
  'canceled': { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelado' },
  'disputed': { bg: '#fee2e2', color: '#dc2626', label: '⚠️ Em Disputa' },
  'refunded': { bg: '#f3e8ff', color: '#6b21a8', label: 'Reembolsado' },
};

function StatusBadge({ status }) {
  const cfg = statusColors[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: cfg.bg,
      color: cfg.color,
      display: 'inline-block'
    }}>
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
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  // Usuário não autenticado → redireciona para login
  if (user === null) {
    base44.auth.redirectToLogin(window.location.pathname);
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  // Usuário autenticado mas sem role admin
  if (user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
        <p className="text-slate-500 max-w-sm">Esta página é exclusiva para administradores da plataforma.</p>
        <button onClick={() => base44.auth.redirectToLogin()} className="text-sm text-blue-600 underline">Entrar com outra conta</button>
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
    <div className="min-h-screen bg-slate-950">
      <style>{`
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .table-container { overflow-x: auto; }
          .filter-bar { flex-direction: column; }
        }
      `}</style>
      
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white">Dashboard de Pagamentos</h1>
          <p className="text-slate-400 text-sm">Monitoramento de transações e split</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Cards de métricas */}
        <div className="kpi-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card style={{ background: '#111827', borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #22c55e', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-400">Volume Capturado</span>
              </div>
              {totalCaptured === 0 ? (
                <span style={{color:'#4b5563', fontSize:13}}>Nenhuma transação ainda</span>
              ) : (
                <p className="text-xl font-bold text-white">R$ {(totalCaptured / 100).toFixed(2)}</p>
              )}
            </CardContent>
          </Card>
          <Card style={{ background: '#111827', borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-400">Comissão Plataforma (20%)</span>
              </div>
              {totalPlatform === 0 ? (
                <span style={{color:'#4b5563', fontSize:13}}>Nenhuma transação ainda</span>
              ) : (
                <p className="text-xl font-bold text-white">R$ {(totalPlatform / 100).toFixed(2)}</p>
              )}
            </CardContent>
          </Card>
          <Card style={{ background: '#111827', borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-400">Em Custódia</span>
              </div>
              {pendingCapture === 0 ? (
                <span style={{color:'#4b5563', fontSize:13}}>Nenhuma transação ainda</span>
              ) : (
                <p className="text-xl font-bold text-white">{pendingCapture}</p>
              )}
            </CardContent>
          </Card>
          <Card style={{ background: '#111827', borderRadius: 12, padding: '20px 24px', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-slate-400">Em Disputa</span>
              </div>
              {disputed === 0 ? (
                <span style={{color:'#4b5563', fontSize:13}}>Nenhuma transação ainda</span>
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
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #374151',
              background: '#1f2937',
              color: '#fff',
              fontSize: 14,
              width: '100%'
            }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #374151',
              background: '#1f2937',
              color: '#fff',
              fontSize: 14,
              minWidth: 140
            }}
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
        <Card className="table-container" style={{ background: '#0b1120', border: '1px solid #1e293b' }}>
          <CardContent className="p-0 overflow-x-auto">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
                <span style={{ fontSize: 40 }}>💳</span>
                <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600, color: '#9ca3af' }}>Nenhuma transação encontrada</p>
                <p style={{ fontSize: 13 }}>As transações aparecerão aqui assim que ocorrerem.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#1f2937' }}>
                    <th style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', padding: '12px 16px' }}>Data</th>
                    <th style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', padding: '12px 16px' }}>Cliente</th>
                    <th style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', padding: '12px 16px' }}>Prestador</th>
                    <th style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right', padding: '12px 16px' }}>Total</th>
                    <th style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right', padding: '12px 16px' }}>Prestador (80%)</th>
                    <th style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right', padding: '12px 16px' }}>Plataforma (20%)</th>
                    <th style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((payment, index) => {
                    const provider = providerMap[payment.provider_id];
                    return (
                      <tr 
                        key={payment.id} 
                        style={{ 
                          background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)'}
                      >
                        <td style={{ padding: '12px 16px', color: '#9ca3af', textAlign: 'left' }}>
                          {format(new Date(payment.created_date), 'dd/MM/yy HH:mm', { locale: ptBR })}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#e5e7eb', textAlign: 'left' }}>{payment.client_email}</td>
                        <td style={{ padding: '12px 16px', color: '#e5e7eb', textAlign: 'left' }}>{provider?.full_name || payment.provider_id}</td>
                        <td style={{ padding: '12px 16px', color: '#f9fafb', fontWeight: 600, textAlign: 'right' }}>R$ {((payment.amount_total || 0) / 100).toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', color: '#86efac', textAlign: 'right' }}>R$ {((payment.amount_provider || 0) / 100).toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', color: '#fcd34d', textAlign: 'right' }}>R$ {((payment.amount_platform || 0) / 100).toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'left' }}>
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
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                padding: '12px 16px',
                borderTop: '1px solid #374151',
                color: '#9ca3af',
                fontSize: 13
              }}>
                <span>Mostrando {startIndex + 1}–{endIndex} de {filtered.length} transações</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={prevPage} 
                    disabled={page === 1}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: '1px solid #374151',
                      background: page === 1 ? '#1f2937' : 'transparent',
                      color: page === 1 ? '#6b7280' : '#fff',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    ← Anterior
                  </button>
                  <button 
                    onClick={nextPage} 
                    disabled={page === totalPages}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: '1px solid #374151',
                      background: page === totalPages ? '#1f2937' : 'transparent',
                      color: page === totalPages ? '#6b7280' : '#fff',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.5 : 1
                    }}
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