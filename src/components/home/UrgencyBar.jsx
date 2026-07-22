import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function UrgencyBar({ user }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('urgency_bar_dismissed')) setDismissed(true);
  }, []);

  const { data: allProviders } = useQuery({
    queryKey: ['allProvidersUrgency'],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 200),
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const total = allProviders?.filter(p =>
    p.tipo_pessoa === 'pf' ||
    (p.tipo_pessoa === 'mei' && !p.tem_ponto_fisico_em_trancoso) ||
    (p.tipo_pessoa === 'pj' && !p.tem_ponto_fisico_em_trancoso)
  ).length || 0;

  const vagasRestantes = Math.max(0, 50 - total);

  if (dismissed || vagasRestantes === 0) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('urgency_bar_dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="w-full text-white text-xs md:text-sm flex items-center justify-between px-3 md:px-6 py-2 gap-2 z-50" style={{ background: '#7F1D1D' }}>
      <div className="flex-1 text-center">
        <span className="mr-1">🔴</span>
        <strong>Lançamento:</strong> apenas{" "}
        <strong className="text-amber-300">{vagasRestantes} vagas</strong> a R$29,90/mês com 2 meses grátis
        {" "}— <span className="text-amber-200">{total} já garantidas</span>{" "}
        <Link to="/Planos" className="inline-flex items-center gap-0.5 underline text-amber-300 hover:text-amber-100 font-bold ml-1 whitespace-nowrap">
          Garantir minha vaga <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <button onClick={handleDismiss} className="shrink-0 text-white/70 hover:text-white ml-2" aria-label="Fechar">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}