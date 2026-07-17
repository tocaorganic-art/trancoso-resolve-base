import { CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

const statusConfig = {
  pendente: {
    icon: Clock,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    title: "Verificação em andamento",
    message: "Estamos realizando sua verificação de segurança em bases oficiais. Assim que concluída, seu perfil poderá aparecer para os clientes.",
  },
  aprovado: {
    icon: CheckCircle,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-500",
    title: "Perfil verificado ✓",
    message: "Seu perfil foi verificado com sucesso. Você já pode aparecer nas buscas e receber pedidos.",
  },
  em_analise_manual: {
    icon: AlertTriangle,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    title: "Em análise pela equipe",
    message: "Sua verificação está em análise pela nossa equipe. Entraremos em contato pelo e-mail cadastrado em breve.",
  },
  reprovado: {
    icon: XCircle,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    title: "Perfil não aprovado",
    message: "Não foi possível ativar seu perfil neste momento. Entre em contato pelo e-mail contato@tocaexperience.com.br para mais informações.",
  },
};

export default function VerificacaoStatusBlock({ status }) {
  const cfg = statusConfig[status] || statusConfig.pendente;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${cfg.color}`}>
      <div className={`mt-0.5 ${cfg.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm">{cfg.title}</p>
        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{cfg.message}</p>
      </div>
    </div>
  );
}