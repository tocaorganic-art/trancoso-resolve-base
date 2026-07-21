import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";

const FOUNDER_LIMIT = 100;

export default function FounderBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("founder_banner_dismissed") === "1"
  );

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: mySubscription } = useQuery({
    queryKey: ["mySubscription", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs?.find(s => s.status === "active" || s.status === "trial") || null;
    },
    enabled: !!user,
  });

  const { data: founderStats } = useQuery({
    queryKey: ["founderProgress"],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.list("-created_date", 200);
      const taken =
        subs?.filter(
          s =>
            (s.status === "active" || s.status === "trial") &&
            (s.plan === "profissional" ||
              s.plan === "lancamento" ||
              s.plan === "prestador_profissional")
        ).length || 0;
      return { taken, remaining: Math.max(0, FOUNDER_LIMIT - taken) };
    },
    staleTime: 60000,
  });

  if (dismissed || mySubscription) return null;
  if (founderStats && founderStats.remaining === 0) return null;

  const taken = founderStats?.taken ?? 0;
  const remaining = founderStats?.remaining ?? FOUNDER_LIMIT;
  const progress = Math.min(100, Math.round((taken / FOUNDER_LIMIT) * 100));
  const isUrgent = remaining <= 20;

  const handleDismiss = () => {
    localStorage.setItem("founder_banner_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div
      className={`relative rounded-2xl border-2 p-4 md:p-5 overflow-hidden ${
        isUrgent
          ? "border-red-500 bg-gradient-to-r from-red-950/40 to-orange-950/40"
          : "border-orange-500 bg-gradient-to-r from-orange-950/40 to-amber-950/30"
      }`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pr-6">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            isUrgent ? "bg-red-500/20" : "bg-orange-500/20"
          }`}
        >
          <Shield
            className={`w-6 h-6 ${isUrgent ? "text-red-400" : "text-orange-400"}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${
              isUrgent ? "text-red-400" : "text-orange-400"
            }`}
          >
            {isUrgent ? `⚠️ Últimas ${remaining} vagas!` : "Prestador Fundador"}
          </p>
          <h3 className="font-extrabold text-foreground text-base leading-snug">
            Restam{" "}
            <span className={isUrgent ? "text-red-400" : "text-orange-400"}>
              {remaining} vagas
            </span>{" "}
            de Prestador Fundador em Trancoso
          </h3>
          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
            Os primeiros {FOUNDER_LIMIT} prestadores verificados ganham o{" "}
            <strong className="text-foreground">Selo Fundador</strong> para sempre — e o preço
            de lançamento{" "}
            <strong className="text-orange-400">R$19,90/mês</strong> nunca mais vai baixar assim.
          </p>

          <div className="mt-3 max-w-sm">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{taken} de {FOUNDER_LIMIT} vagas preenchidas</span>
              <span>{remaining} restantes</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isUrgent ? "bg-red-500" : "bg-orange-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <Link to="/Planos" className="shrink-0 mt-1 md:mt-0">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-5 shadow-md whitespace-nowrap">
            Garantir meu selo Fundador →
          </Button>
        </Link>
      </div>
    </div>
  );
}
