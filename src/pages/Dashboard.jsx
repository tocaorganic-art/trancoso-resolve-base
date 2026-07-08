import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock, TrendingUp, Loader2 } from "lucide-react";
import VerificacaoStatusBlock from "@/components/verificacao/VerificacaoStatusBlock";
import FinancialDashboard from "../components/financial/FinancialDashboard";
import AssistenteFinanceiro from "../components/financial/AssistenteFinanceiro";
import GettingStartedGuide from "../components/dashboard/GettingStartedGuide";
import PermissionChecker from "../components/auth/PermissionChecker";
import SubscriptionPaywall from "../components/dashboard/SubscriptionPaywall";
import CheckoutSuccessBanner from "../components/dashboard/CheckoutSuccessBanner";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <PermissionChecker requiredUserType="prestador">
      <DashboardContent />
    </PermissionChecker>
  );
}

function DashboardContent() {
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutSuccess = urlParams.get('checkout') === 'success';

  // Flag temporária de 5 min: bypass do paywall enquanto webhook processa OU trial está sendo criado
  const [hasTempFlag] = React.useState(() => {
    const flag = localStorage.getItem('assinatura_ativa_temporaria') || localStorage.getItem('trial_pendente');
    if (flag) {
      // Remove após 5 minutos (já configurado na gravação) ou na próxima leitura após expirar
      return true;
    }
    return false;
  });

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Verifica assinatura ativa (trial ou active)
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const today = new Date().toISOString().split('T')[0];
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs?.find(sub => {
        if (sub.status === 'active') {
          if (sub.next_billing_date && today > sub.next_billing_date) return false;
          return true;
        }
        if (sub.status === 'trial') {
          return sub.trial_end && today <= sub.trial_end;
        }
        return false;
      }) || null;
    },
    enabled: !!user,
  });

  const { data: allSubs } = useQuery({
    queryKey: ['allMySubscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: providerProfile } = useQuery({
    queryKey: ['myProviderProfile', user?.email],
    queryFn: () => base44.entities.ServiceProvider.filter({ created_by: user.email }),
    enabled: !!user,
    select: (data) => data?.[0] || null,
  });

  const { data: serviceRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['serviceRequests', providerProfile?.id],
    queryFn: () => base44.entities.ServiceRequest.filter({ provider_id: providerProfile?.id }, '-created_date'),
    enabled: !!providerProfile?.id,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({}, '-created_date'),
    enabled: !!user,
    initialData: [],
  });

  // Grava flag de checkout no localStorage por 5 min (para reload/refetch)
  useEffect(() => {
    if (checkoutSuccess) {
      localStorage.setItem('assinatura_ativa_temporaria', 'true');
      setTimeout(() => localStorage.removeItem('assinatura_ativa_temporaria'), 300000);
    }
  }, [checkoutSuccess]);

  // Remove trial_pendente após carregar com sucesso (trial foi criado)
  useEffect(() => {
    if (subscription) {
      localStorage.removeItem('trial_pendente');
      localStorage.removeItem('assinatura_ativa_temporaria');
    }
  }, [subscription]);

  const isLoading = isUserLoading || isLoadingRequests || isLoadingTransactions || isLoadingSubscription;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
      </div>
    );
  }

  // Paywall: sem assinatura ativa e sem flags temporárias (exceto para admins)
  if (!subscription && !checkoutSuccess && !hasTempFlag && user?.role !== 'admin') {
    const lastSub = allSubs?.[0];
    const isTrial = lastSub?.status === 'trial' || lastSub?.plan === 'trial';
    const hasAnySubscription = !!(allSubs && allSubs.length > 0);
    return (
      <SubscriptionPaywall
        subscriptionStatus={lastSub?.status}
        isTrial={isTrial}
        hasAnySubscription={hasAnySubscription}
        userEmail={user?.email}
      />
    );
  }

  const pendingRequests = serviceRequests?.filter(req => req.status === 'Pendente').length || 0;
  const confirmedServices = serviceRequests?.filter(req => req.status === 'Confirmado').length || 0;

  const totalReceita = (transactions || [])
    .filter(t => t.type === "Receita" && t.status === "Validado")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a1628] pb-24">
    {checkoutSuccess && <CheckoutSuccessBanner />}

    <div className="mb-8 pt-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Painel do Prestador</h1>
          <p className="text-slate-400 text-sm">Bem-vindo(a) de volta, {user?.full_name || 'Prestador'}! 🌴</p>
        </div>
      </div>
    </div>
      
      {/* Alerta: prestador sem telefone cadastrado */}
      {user && !user.phone && (
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-400 text-xl mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-300 text-sm">Complete seu perfil — WhatsApp obrigatório</p>
            <p className="text-amber-200/80 text-xs mt-0.5">Clientes não conseguem entrar em contato sem seu WhatsApp.</p>
          </div>
          <Link to={createPageUrl("MeuPerfilPrestador")}>
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shrink-0">Completar</Button>
          </Link>
        </div>
      )}

      {/* Bloco de status de verificação de antecedentes */}
      {providerProfile && (
        <div className="mb-6">
          <VerificacaoStatusBlock status={providerProfile.status_verificacao || 'pendente'} />
        </div>
      )}

      {serviceRequests?.length === 0 && (
        <div className="mb-6">
          <GettingStartedGuide />
        </div>
      )}

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card 
            style={{
              background: 'rgba(251, 191, 36, 0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-amber-200">Solicitações Pendentes</CardTitle>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))',
                  border: '1px solid rgba(251, 191, 36, 0.25)'
                }}
              >
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white mb-1">{pendingRequests}</div>
              <p className="text-xs text-amber-200/70">Aguardando sua confirmação</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card 
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-blue-200">Serviços Confirmados</CardTitle>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                  border: '1px solid rgba(59, 130, 246, 0.25)'
                }}
              >
                <CalendarCheck className="w-5 h-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white mb-1">{confirmedServices}</div>
              <p className="text-xs text-blue-200/70">Agendados para os próximos dias</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card 
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-green-200">Receita Total</CardTitle>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2))',
                  border: '1px solid rgba(34, 197, 94, 0.25)'
                }}
              >
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="text-3xl font-extrabold mb-1"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-200/70">Total recebido dos serviços concluídos</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      <div className="mt-10">
         <h2 className="text-xl font-bold text-white mb-4">Visão Geral Financeira 💰</h2>
         {(transactions && transactions.length > 0) ? (
            <>
                <AssistenteFinanceiro transacoes={transactions} />
                <FinancialDashboard transactions={transactions} />
            </>
        ) : (
            <div className="text-center py-12 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">Seus dados financeiros aparecerão aqui assim que você registrar sua primeira transação.</p>
                <Link to={createPageUrl("Financeiro")}>
                    <Button variant="secondary" className="mt-4">Ir para Financeiro</Button>
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}