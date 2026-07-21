import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Lock } from "lucide-react";

const FEATURE_CONFIGS = {
  max_services: {
    title: "Você atingiu o limite de serviços",
    description: "O plano Gratuito permite 1 serviço ativo. Assine o Profissional e publique até 10 serviços.",
    plan: "Profissional",
    price: "R$19,90/mês",
    trial: "30 dias grátis",
    planKey: "profissional",
    features: [
      "Até 10 serviços ativos simultâneos",
      "Destaque nas buscas da região",
      "Agenda integrada de atendimentos",
      "Selo de prestador verificado",
    ],
  },
  agenda: {
    title: "Agenda integrada é do plano Profissional",
    description: "Gerencie seus atendimentos com agenda inteligente. Disponível a partir do Profissional.",
    plan: "Profissional",
    price: "R$19,90/mês",
    trial: "30 dias grátis",
    planKey: "profissional",
    features: [
      "Agenda de atendimentos integrada",
      "Até 10 serviços ativos",
      "Destaque nas buscas",
      "Verificação de antecedentes",
    ],
  },
  ia: {
    title: "Assistente IA exclusivo do Elite",
    description: "A TrIA ajuda você a captar mais clientes, redigir propostas e analisar seu desempenho.",
    plan: "Premium Elite",
    price: "R$197/mês",
    trial: "7 dias grátis",
    planKey: "prestador_elite",
    features: [
      "Assistente IA premium (TrIA)",
      "Gerador de imagens IA",
      "Serviços ilimitados",
      "Prioridade máxima nas buscas",
    ],
  },
  destaque: {
    title: "Destaque na página inicial é do Elite",
    description: "Apareça em primeiro no topo da plataforma e na página inicial durante o ano todo.",
    plan: "Premium Elite",
    price: "R$197/mês",
    trial: "7 dias grátis",
    planKey: "prestador_elite",
    features: [
      "Destaque na página inicial",
      "Prioridade máxima nas buscas",
      "Serviços ilimitados",
      "Suporte prioritário dedicado",
    ],
  },
  default: {
    title: "Recurso exclusivo do plano Profissional",
    description: "Faça upgrade para desbloquear este recurso e muito mais.",
    plan: "Profissional",
    price: "R$19,90/mês",
    trial: "30 dias grátis",
    planKey: "profissional",
    features: [
      "Tudo do Gratuito, sem limite de tempo",
      "Até 10 serviços ativos",
      "Destaque nas buscas da região",
      "Verificação de antecedentes",
    ],
  },
};

export default function UpgradeModal({ open, onClose, feature = "default" }) {
  const config = FEATURE_CONFIGS[feature] ?? FEATURE_CONFIGS.default;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-white text-lg font-extrabold mb-1">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-orange-100 text-sm leading-relaxed">
            {config.description}
          </DialogDescription>
        </div>

        {/* Plano destaque */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                Desbloqueie com
              </p>
              <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                {config.plan}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-foreground">{config.price}</p>
              <Badge className="bg-green-600 text-white text-xs font-bold">{config.trial}</Badge>
            </div>
          </div>

          <ul className="space-y-1.5 mb-5">
            {config.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <Link to={`/Planos`} onClick={onClose}>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full">
                Ver planos e assinar →
              </Button>
            </Link>
            <button
              onClick={onClose}
              className="w-full text-sm text-muted-foreground hover:text-foreground py-1.5 transition-colors"
            >
              Continuar no plano gratuito
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
