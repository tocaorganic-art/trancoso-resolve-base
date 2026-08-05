import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, Clock, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AutomacaoLeadsTab({ leads = [] }) {
  const [processing, setProcessing] = useState(false);

  const totalLeads = leads.length;
  const enviados = leads.filter((l) => l.email_boas_vindas_enviado === true).length;
  const pendentes = leads.filter((l) => l.email && l.consent && l.email_boas_vindas_enviado !== true).length;
  const falhas = leads.filter((l) => l.email_boas_vindas_status === "failed").length;
  const totalTentativas = leads.reduce((sum, l) => sum + (l.email_boas_vindas_tentativas || 0), 0);
  const ultimoEnvio = leads
    .filter((l) => l.email_boas_vindas_enviado_em)
    .sort((a, b) => (b.email_boas_vindas_enviado_em || "").localeCompare(a.email_boas_vindas_enviado_em || ""))[0];
  const ultimoEnvioData = ultimoEnvio ? new Date(ultimoEnvio.email_boas_vindas_enviado_em).toLocaleString("pt-BR") : "—";

  const handleReprocessar = async () => {
    if (!confirm("Confirmar reprocessamento dos emails pendentes?")) return;
    setProcessing(true);
    try {
      const res = await base44.functions.invoke("reenviarEmailsBoasVindasPendentes", {});
      const data = await res;
      toast.success(`${data.processed || 0} Leads processados. ${data.sent || 0} enviados, ${data.failed || 0} falhas.`);
    } catch {
      toast.error("Erro ao reprocessar. Verifique as permissões.");
    } finally {
      setProcessing(false);
    }
  };

  const stats = [
    { label: "Total de Leads", value: totalLeads, icon: Mail, color: "text-[#F26A21]" },
    { label: "Emails enviados", value: enviados, icon: CheckCircle2, color: "text-green-600" },
    { label: "Pendentes", value: pendentes, icon: Clock, color: "text-[#999]" },
    { label: "Com falha", value: falhas, icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Detalhes da automação</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de tentativas:</span>
              <span className="text-foreground font-medium">{totalTentativas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último envio:</span>
              <span className="text-foreground font-medium">{ultimoEnvioData}</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              onClick={handleReprocessar}
              disabled={processing || pendentes === 0}
              className="bg-[#F26A21] hover:bg-[#d95a1a] text-white gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processando…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Reprocessar pendentes
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Processa no máximo 20 Leads por execução. Apenas Leads com consentimento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}