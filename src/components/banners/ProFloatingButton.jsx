import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Zap, X } from "lucide-react";

const TRIAL_DAYS = 30;
const HIDDEN_PATHS = ["/Planos", "/planos", "/Login", "/Register", "/CadastroTipo"];

export default function ProFloatingButton() {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("pro_float_dismissed") === "1"
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

  // Ocultar em páginas específicas, se já dispensado ou se já é assinante
  if (dismissed) return null;
  if (!user) return null;
  if (mySubscription) return null;
  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null;

  // Ocultar após 30 dias de cadastro
  if (user.created_at) {
    const daysSinceCreation =
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > TRIAL_DAYS) return null;
  }

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem("pro_float_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div
      className="md:hidden fixed z-40 flex items-center gap-2"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 64px)", right: "16px" }}
    >
      <Link
        to="/Planos"
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-lg active:scale-95 transition-all"
      >
        <Zap className="w-4 h-4" />
        Virar PRO
      </Link>
      <button
        onClick={handleDismiss}
        className="w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center shadow-md text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
