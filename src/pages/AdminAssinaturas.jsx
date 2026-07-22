import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard, Check, X, Clock, Search, Users, TrendingUp 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminAssinaturasPage() {
  useEffect(() => {
    document.title = "Administração de Assinaturas | Trancoso Resolve";
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'Painel administrativo de assinaturas e planos ativos da Trancoso Resolve. Controle de prestadores, status de pagamentos e renovações.');
    setMeta('og:title', 'Admin Assinaturas — Trancoso Resolve', true);
    setMeta('og:description', 'Gestão centralizada de assinaturas e planos da plataforma Trancoso Resolve.', true);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
    initialData: [],
    enabled: user?.role === 'admin',
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
  });

  const handleActivateSubscription = (subscription) => {
    const today = new Date();
    const nextBilling = new Date(today);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    updateSubscriptionMutation.mutate({
      id: subscription.id,
      data: {
        status: "active",
        plan: "monthly",
        subscription_start: today.toISOString().split('T')[0],
        next_billing_date: nextBilling.toISOString().split('T')[0]
      }
    });
  };

  const handleExpireSubscription = (subscription) => {
    updateSubscriptionMutation.mutate({
      id: subscription.id,
      data: {
        status: "expired"
      }
    });
  };

  const handleCancelSubscription = (subscription) => {
    if (window.confirm(`Cancelar assinatura de ${subscription.user_email}?`)) {
      updateSubscriptionMutation.mutate({
        id: subscription.id,
        data: {
          status: "cancelled"
        }
      });
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h2>
            <p className="text-red-700">Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: subscriptions.length,
    trial: subscriptions.filter(s => s.status === 'trial').length,
    active: subscriptions.filter(s => s.status === 'active').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    revenue: subscriptions.filter(s => s.status === 'active').length * 99
  };

  const statusColors = {
    trial: "bg-amber-100 text-amber-800 border-amber-200",
    active: "bg-[#3E8E5A]/10 text-[#3E8E5A] border-[#3E8E5A]/30",
    expired: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-muted text-foreground border-border"
  };

  const statusLabels = {
    trial: "Trial",
    active: "Ativo",
    expired: "Expirado",
    cancelled: "Cancelado"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-muted rounded-xl">
            <CreditCard className="w-8 h-8 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Assinaturas</h1>
            <p className="text-muted-foreground">Painel administrativo</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Trial</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-amber-600">{stats.trial}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Ativos</span>
                <Check className="w-5 h-5 text-[#3E8E5A]" />
              </div>
              <p className="text-3xl font-bold text-[#3E8E5A]">{stats.active}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Expirados</span>
                <X className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-orange-700 font-medium">MRR</span>
                <TrendingUp className="w-5 h-5 text-brand-primary" />
              </div>
              <p className="text-3xl font-bold text-brand-primary">
                R$ {stats.revenue.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Próxima Cobrança</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma assinatura encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted">
                      <TableCell className="font-medium">{sub.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sub.plan === 'trial' ? 'Trial' : 'Mensal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[sub.status]}>
                          {statusLabels[sub.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.trial_end ? (
                          <>
                            {new Date(sub.trial_end).toLocaleDateString('pt-BR')}
                          </>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.next_billing_date ? (
                          <>
                            {new Date(sub.next_billing_date).toLocaleDateString('pt-BR')}
                          </>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        R$ {sub.amount || 99}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {sub.status === 'trial' && (
                            <Button
                              size="sm"
                              onClick={() => handleActivateSubscription(sub)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Ativar
                            </Button>
                          )}
                          {sub.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExpireSubscription(sub)}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Expirar
                            </Button>
                          )}
                          {(sub.status === 'active' || sub.status === 'trial') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelSubscription(sub)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6 border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-amber-900 mb-3">📋 Como usar este painel:</h3>
          <ul className="text-sm text-amber-800 space-y-2">
            <li><strong>1.</strong> Usuários começam automaticamente com 7 dias de trial</li>
            <li><strong>2.</strong> Quando pagarem no Mercado Pago, clique em "Ativar" para liberar acesso</li>
            <li><strong>3.</strong> Use "Expirar" se o pagamento não for confirmado</li>
            <li><strong>4.</strong> O sistema bloqueia acesso automaticamente para expirados</li>
            <li><strong>5.</strong> MRR = Receita Recorrente Mensal (apenas assinaturas ativas)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}