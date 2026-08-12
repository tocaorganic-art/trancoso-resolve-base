import { ShieldCheck, CreditCard, Users, MapPin } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function SocialProofBar({ totalVerificados = 0 }) {
  const { t } = useApp();
  const prestadoresDisplay = totalVerificados > 0 ? totalVerificados : 19;

  const metrics = [
    { icon: Users, value: `${prestadoresDisplay} ${t('stats.professionals')}`, label: t('stats.registered') },
    { icon: ShieldCheck, value: t('stats.verified'), label: t('stats.backgroundChecked') },
    { icon: MapPin, value: t('stats.destinations'), label: t('stats.destinationList') },
    { icon: CreditCard, value: t('stats.securePayment'), label: t('stats.allServices') },
  ];

  return (
    <div className="bg-card border-b border-border py-5 px-4" aria-label={t('stats.aria')}>
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-center gap-4 md:gap-10 flex-wrap">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={m.value} className="contents">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
