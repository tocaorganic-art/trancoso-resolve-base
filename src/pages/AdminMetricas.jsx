import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart2, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import TabVisaoGeral from "@/components/admin/metricas/TabVisaoGeral";
import TabSEO from "@/components/admin/metricas/TabSEO";
import TabLeads from "@/components/admin/metricas/TabLeads";
import TabPrestadores from "@/components/admin/metricas/TabPrestadores";

export default function AdminMetricas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sendingReport, setSendingReport] = useState(false);

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!loadingUser) {
      if (!user) base44.auth.redirectToLogin("/admin/metricas");
      else if (user.role !== "admin") navigate("/");
    }
  }, [user, loadingUser, navigate]);

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["adminLeads"],
    queryFn: () => base44.entities.LeadPreLancamento.list('-created_date', 500),
    enabled: !!user && user.role === "admin",
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["adminProviders"],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 200),
    enabled: !!user && user.role === "admin",
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["adminRequests"],
    queryFn: () => base44.entities.ServiceRequest.list('-created_date', 500),
    enabled: !!user && user.role === "admin",
  });

  const { data: searchPages = [] } = useQuery({
    queryKey: ["searchPages"],
    queryFn: () => base44.entities.SearchPageWeekly.list('-week_start', 100),
    enabled: !!user && user.role === "admin",
  });

  const { data: searchKeywords = [] } = useQuery({
    queryKey: ["searchKeywords"],
    queryFn: () => base44.entities.SearchKeywordWeekly.list('-week_start', 100),
    enabled: !!user && user.role === "admin",
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["adminLeads"] });
    queryClient.invalidateQueries({ queryKey: ["adminProviders"] });
    queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
    toast.success("Dados atualizados!");
  };

  const handleSendReport = async () => {
    setSendingReport(true);
    try {
      await base44.functions.invoke('generateWeeklyReport', {});
      toast.success("Relatório semanal enviado para tocaorganic@gmail.com!");
    } catch {
      toast.error("Erro ao gerar relatório.");
    } finally {
      setSendingReport(false);
    }
  };

  if (loadingUser || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isLoading = loadingLeads || loadingProviders || loadingRequests;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-orange-400" />
          <h1 className="text-2xl font-bold text-foreground">Métricas e Relatórios</h1>
          {isLoading && <div className="w-4 h-4 border-2 border-border border-t-orange-400 rounded-full animate-spin" />}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </Button>
          <Button size="sm" onClick={handleSendReport} disabled={sendingReport} className="gap-2 bg-orange-600 hover:bg-orange-700">
            <Send className="w-4 h-4" /> {sendingReport ? "Enviando..." : "Relatório Semanal"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="visao-geral" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-muted-foreground border-b-2 border-transparent data-[state=active]:border-orange-400">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-muted-foreground border-b-2 border-transparent data-[state=active]:border-orange-400">
            SEO / Buscas
          </TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-muted-foreground border-b-2 border-transparent data-[state=active]:border-orange-400">
            Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="prestadores" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-muted-foreground border-b-2 border-transparent data-[state=active]:border-orange-400">
            Prestadores ({providers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <TabVisaoGeral leads={leads} requests={requests} providers={providers} />
        </TabsContent>

        <TabsContent value="seo">
          <TabSEO pages={searchPages} keywords={searchKeywords} />
        </TabsContent>

        <TabsContent value="leads">
          <TabLeads leads={leads} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="prestadores">
          <TabPrestadores providers={providers} requests={requests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}