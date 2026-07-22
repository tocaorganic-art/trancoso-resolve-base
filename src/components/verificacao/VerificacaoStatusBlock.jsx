import { CheckCircle, Clock, AlertTriangle, XCircle, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SUPORTE_WHATSAPP = "https://wa.me/5573999999999?text=Olá%2C+preciso+de+ajuda+com+a+aprovação+do+meu+perfil+na+Trancoso+Resolve.";
const SUPORTE_EMAIL = "mailto:contato@tocaexperience.com.br?subject=Aprovação+de+perfil+—+Trancoso+Resolve";

const statusConfig = {
  pendente: {
    icon: Clock,
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    title: "Verificação em andamento",
    message: "Estamos realizando sua verificação de segurança em bases oficiais. Assim que concluída, seu perfil poderá aparecer para os clientes.",
    ctas: [
      { label: "Completar meu perfil", to: "/MeuPerfilPrestador", variant: "outline" },
      { label: "Falar com suporte", href: SUPORTE_WHATSAPP, variant: "ghost", icon: MessageCircle },
    ],
  },
  aprovado: {
    icon: CheckCircle,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-500",
    title: "Perfil verificado ✓",
    message: "Seu perfil foi verificado com sucesso. Você já pode aparecer nas buscas e receber pedidos.",
    ctas: [],
  },
  em_analise_manual: {
    icon: AlertTriangle,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    title: "Em análise pela equipe",
    message: "Sua verificação está em análise pela nossa equipe. Entraremos em contato pelo e-mail cadastrado em breve.",
    ctas: [
      { label: "Completar meu perfil", to: "/MeuPerfilPrestador", variant: "outline" },
      { label: "Falar com suporte", href: SUPORTE_EMAIL, variant: "ghost", icon: MessageCircle },
    ],
  },
  reprovado: {
    icon: XCircle,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    title: "Perfil não aprovado",
    message: "Não foi possível ativar seu perfil neste momento. Complete as informações abaixo ou entre em contato com o suporte.",
    ctas: [
      { label: "Completar meu perfil", to: "/MeuPerfilPrestador", variant: "default" },
      { label: "Falar com suporte", href: SUPORTE_WHATSAPP, variant: "outline", icon: MessageCircle },
    ],
  },
};

export default function VerificacaoStatusBlock({ status }) {
  const cfg = statusConfig[status] || statusConfig.pendente;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border p-4 ${cfg.color}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{cfg.title}</p>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">{cfg.message}</p>

          {cfg.ctas?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {cfg.ctas.map((cta) => {
                const CIcon = cta.icon;
                if (cta.to) {
                  return (
                    <Link key={cta.label} to={cta.to}>
                      <Button size="sm" variant={cta.variant} className="h-8 text-xs gap-1.5">
                        {CIcon && <CIcon className="w-3.5 h-3.5" />}
                        {cta.label}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  );
                }
                return (
                  <a key={cta.label} href={cta.href} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant={cta.variant} className="h-8 text-xs gap-1.5">
                      {CIcon && <CIcon className="w-3.5 h-3.5" />}
                      {cta.label}
                    </Button>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
