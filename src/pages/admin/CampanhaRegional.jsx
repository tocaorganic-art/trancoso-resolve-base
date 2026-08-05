import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Megaphone, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import VisaoGeralTab from "@/components/admin/campanha/VisaoGeralTab";
import CalendarioEditorialTab from "@/components/admin/campanha/CalendarioEditorialTab";
import ConteudosPrioritarios from "@/components/admin/campanha/ConteudosPrioritarios";
import MetricasTab from "@/components/admin/campanha/MetricasTab";

export default function CampanhaRegional() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!loadingUser) {
      if (!user) base44.auth.redirectToLogin("/admin/campanha-regional");
      else if (user.role !== "admin") navigate("/");
    }
  }, [user, loadingUser, navigate]);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["campaignPosts"],
    queryFn: () => base44.entities.CampaignPost.list("campaign_day", 500),
    enabled: !!user && user.role === "admin",
  });

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ["campaignLeads"],
    queryFn: () => base44.entities.Lead.filter({ origem: "costa-do-descobrimento" }, "-created_date", 500),
    enabled: !!user && user.role === "admin",
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["campaignMetrics"],
    queryFn: () => base44.entities.CampaignMetric.list("-date", 500),
    enabled: !!user && user.role === "admin",
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["contentApprovals"],
    queryFn: () => base44.entities.ContentApproval.list("-reviewed_at", 200),
    enabled: !!user && user.role === "admin",
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["campaignPosts"] });
    queryClient.invalidateQueries({ queryKey: ["campaignLeads"] });
    queryClient.invalidateQueries({ queryKey: ["campaignMetrics"] });
    queryClient.invalidateQueries({ queryKey: ["contentApprovals"] });
    toast.success("Dados atualizados!");
  };

  if (loadingUser || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isLoading = loadingPosts || loadingLeads;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-[#F26A21]" />
          <h1 className="text-2xl font-bold text-foreground font-heading">Campanha Regional</h1>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-border border-t-[#F26A21] rounded-full animate-spin" />
          )}
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </Button>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger
            value="visao-geral"
            className="data-[state=active]:bg-[#F26A21] data-[state=active]:text-white text-muted-foreground"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="calendario"
            className="data-[state=active]:bg-[#F26A21] data-[state=active]:text-white text-muted-foreground"
          >
            Calendário Editorial
          </TabsTrigger>
          <TabsTrigger
            value="prioritarios"
            className="data-[state=active]:bg-[#F26A21] data-[state=active]:text-white text-muted-foreground"
          >
            Conteúdos Prioritários
          </TabsTrigger>
          <TabsTrigger
            value="metricas"
            className="data-[state=active]:bg-[#F26A21] data-[state=active]:text-white text-muted-foreground"
          >
            Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <VisaoGeralTab posts={posts} leads={leads} approvals={approvals} />
        </TabsContent>
        <TabsContent value="calendario">
          <CalendarioEditorialTab posts={posts} onRefresh={handleRefresh} />
        </TabsContent>
        <TabsContent value="prioritarios">
          <ConteudosPrioritarios />
        </TabsContent>
        <TabsContent value="metricas">
          <MetricasTab metrics={metrics} posts={posts} onRefresh={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}