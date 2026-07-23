import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  TrendingUp, Upload, FileText, 
  AlertCircle, Download, Plus, Star, Loader2, RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FinancialDashboard from "../components/financial/FinancialDashboard";
import TransactionForm from "../components/financial/TransactionForm";
import TransactionList from "../components/financial/TransactionList";
import DocumentUpload from "../components/financial/DocumentUpload";
import FinancialReports from "../components/financial/FinancialReports";
import AssistenteFinanceiro from "../components/financial/AssistenteFinanceiro";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import PermissionChecker from "../components/auth/PermissionChecker"; // Added import

export default function FinanceiroPage() {
  useEffect(() => {
    document.title = "Financeiro — Gestão de Receitas e Pagamentos | Trancoso Resolve";
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'Acompanhe seus ganhos, histórico de pagamentos e desempenho financeiro como prestador na Trancoso Resolve. Dashboard completo em um só lugar.');
    setMeta('og:title', 'Financeiro — Trancoso Resolve', true);
    setMeta('og:description', 'Gerencie seus recebimentos e acompanhe sua evolução financeira na plataforma Trancoso Resolve.', true);
  }, []);

  return (
    <PermissionChecker requiredUserType="prestador">
      <FinanceiroContent />
    </PermissionChecker>
  );
}

function FinanceiroContent() { // Renamed from FinanceiroPage
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: user, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // This useEffect block is removed as PermissionChecker now handles the user type redirection.
  // useEffect(() => {
  //   if (!isUserLoading && user?.user_type !== 'prestador') {
  //     window.location.replace(createPageUrl('Home'));
  //   }
  // }, [user, isUserLoading]);

  const { data: transactions, isLoading: isTransactionsLoading, error: transactionsError, refetch } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ created_by: user.email }, '-date'),
    initialData: [],
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
  });

  const isLoading = isUserLoading || isTransactionsLoading;
  const hasError = isUserError || transactionsError;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary mb-4" />
        <p className="text-muted-foreground">Carregando dados financeiros...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Erro ao Carregar Dados</h2>
            <p className="text-red-700 mb-4">Não foi possível buscar suas informações financeiras.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetch()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </Button>
              <Button variant="outline" onClick={() => window.location.href = createPageUrl('Home')}>
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalReceita = safeTransactions
    .filter(t => t.type === "Receita" && (t.status === "Validado" || t.status === "Pendente"))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalDespesa = safeTransactions
    .filter(t => t.type === "Despesa" && (t.status === "Validado" || t.status === "Pendente"))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const saldo = totalReceita - totalDespesa;
  const servicosConcluidos = safeTransactions.filter(t => t.type === "Receita" && t.status === "Validado").length;
  const mediaAvaliacao = 4.8;

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{`
        .kpi-section-reputacao { 
          margin-top: 8px; 
          padding-top: 8px; 
          border-top: 1px solid rgba(255,255,255,0.1); 
        }
        .chart-card { 
          background: #0f1b2d; 
          border: 1px solid #2a3a50; 
          border-radius: 12px; 
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-7 h-7 text-brand-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Portal Financeiro</h1>
                <p className="text-muted-foreground">Sua central de ganhos, despesas e relatórios.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <Link to={createPageUrl("Planos")}>
                <Button variant="outline">Ver Planos</Button>
             </Link>
             <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-brand-primary hover:bg-orange-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Transação
              </Button>
          </div>
        </div>

        {/* KPIs Financeiros - Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card className={`border-2 shadow-sm transition-all ${
            saldo < 0 ? 'border-red-400 bg-red-50/50' : 'border-[#3E8E5A]/40'
          }`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Saldo Disponível</p>
                {saldo < 0 && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>
              <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-brand-primary' : 'text-red-600'}`}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {saldo < 0 && (
                <p className="text-xs text-red-600 mt-2 font-medium">Atenção: saldo negativo</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Faturado (mês)</p>
              <p className="text-3xl font-bold text-[#3E8E5A]">
                R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas de Reputação - Linha 2 */}
        <div className="kpi-section-reputacao grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 md:col-span-2">Reputação</p>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-2">Serviços Concluídos</p>
              <p className="text-3xl font-bold text-amber-600">{servicosConcluidos}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-2">Sua Avaliação Média</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-amber-600">{mediaAvaliacao}</p>
                <Star className="w-6 h-6 text-amber-500 fill-current" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <TransactionForm onClose={() => setShowForm(false)} />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <FileText className="w-4 h-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar com IA
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Download className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AssistenteFinanceiro transacoes={safeTransactions} />
          <FinancialDashboard transactions={safeTransactions} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={safeTransactions} />
        </TabsContent>

        <TabsContent value="upload">
          <DocumentUpload />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports transactions={safeTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}