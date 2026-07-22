import React from "react";
import { ShieldCheck, CreditCard, Users, MapPin } from "lucide-react";

export default function SocialProofBar({ totalVerificados = 0 }) {
  const prestadoresDisplay = totalVerificados > 0 ? totalVerificados : 19;

  const metrics = [
    { icon: Users, value: `${prestadoresDisplay} profissionais`, label: "cadastrados na plataforma" },
    { icon: ShieldCheck, value: "Prestadores verificados", label: "com antecedentes checados" },
    { icon: MapPin, value: "4 destinos", label: "Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva" },
    { icon: CreditCard, value: "Pagamento seguro", label: "para todos os serviços" },
  ];

  return (
    <div className="bg-card border-b border-border py-5 px-4" aria-label="Estatísticas da plataforma">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-center gap-4 md:gap-10 flex-wrap">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <React.Fragment key={m.value}>
                {i > 0 && <div className="hidden md:block w-px h-8 bg-border" />}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-brand-md bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-bold text-sm leading-tight">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
