import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldCheck, Clock, XCircle, AlertTriangle, Upload, ShieldAlert } from "lucide-react";
import VerificarIdentidadeModal from "./VerificarIdentidadeModal";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  "Em Análise": {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    label: "Documento em análise",
    description: "Seu documento está sendo processado pela IA. Aguarde.",
    showResubmit: false,
    showBadge: true,
  },
  "Aguardando Admin": {
    icon: ShieldAlert,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-300",
    label: "Aguardando aprovação",
    description: "Documento validado pela IA. Um administrador irá revisar em breve.",
    showResubmit: false,
    showBadge: true,
  },
  "Verificado": {
    icon: BadgeCheck,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Verificado",
    description: "Sua identidade foi verificada! O selo azul já aparece no seu perfil.",
    showResubmit: false,
    showBadge: true,
  },
  "Rejeitado": {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700 border-red-300",
    label: "Rejeitado",
    description: "Seu documento foi rejeitado. Envie um novo para tentar novamente.",
    showResubmit: true,
    showBadge: true,
  },
  "Pendente": {
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700 border-orange-300",
    label: "Divergência encontrada",
    description: "Encontramos uma divergência no documento. Um admin irá analisar.",
    showResubmit: true,
    showBadge: true,
  },
};

export default function VerificacaoStatusCard({ user }) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: verificacoes, isLoading } = useQuery({
    queryKey: ["minhaVerificacao", user?.email],
    queryFn: () => base44.entities.Verificacao.filter({ user_email: user.email }, "-submission_date", 1),
    enabled: !!user?.email,
  });

  const latest = verificacoes?.[0];
  const config = latest ? statusConfig[latest.status] : null;
  const StatusIcon = config?.icon;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["minhaVerificacao"] });
    queryClient.invalidateQueries({ queryKey: ["myServiceProvider"] });
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          Verificação de Identidade
        </h3>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-16 rounded-xl bg-slate-100 animate-pulse"
            />
          ) : latest && config ? (
            <motion.div
              key={latest.status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`rounded-xl border p-4 ${config.bg}`}
            >
              <div className="flex items-start gap-3">
                <StatusIcon className={`w-5 h-5 mt-0.5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  {/* Badge visual distinto por status */}
                  {config.showBadge && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border mb-1 ${config.badge}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  )}
                  <p className="text-xs text-slate-600 mt-0.5">{config.description}</p>
                  {latest.admin_notes && latest.status !== "Verificado" && (
                    <p className="text-xs text-slate-500 mt-1.5 bg-white/70 rounded-lg p-2 border border-white/80 leading-relaxed">
                      {latest.admin_notes}
                    </p>
                  )}
                </div>
                {config.showResubmit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModalOpen(true)}
                    className="shrink-0 text-xs gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Reenviar
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            /* Estado inicial — nenhum envio ainda */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Verificar minha identidade</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Envie um documento (CNH ou RG) para receber o selo azul de identidade verificada.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Enviar Documento
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <VerificarIdentidadeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        onSuccess={handleSuccess}
      />
    </>
  );
}