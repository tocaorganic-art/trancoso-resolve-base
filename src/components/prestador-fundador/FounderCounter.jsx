import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, AlertTriangle } from "lucide-react";

// Contador real de vagas de Prestador Fundador — consome getFounderStats (server-side).
//
// Estado inicial e de erro são propositalmente "unavailable" (não
// taken:0/remaining:100/open:true). Mostrar 100 vagas disponíveis antes da
// resposta real chegar — ou quando ela falha — é exatamente o comportamento
// fail-open que esta tela existe para evitar. Ver getFounderStats/entry.ts.
const UNAVAILABLE_STATE = { taken: null, remaining: null, limit: 100, open: false, unavailable: true };

export default function FounderCounter({ variant = "hero" }) {
  const [stats, setStats] = useState(UNAVAILABLE_STATE);
  const [loading, setLoading] = useState(true);
  const [displayTaken, setDisplayTaken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    base44.functions
      .invoke("getFounderStats", {})
      .then((res) => {
        if (cancelled) return;
        if (res?.data && typeof res.data.taken === "number") {
          setStats(res.data);
        } else {
          // Resposta sem contagem numérica (unavailable:true ou payload inesperado).
          setStats(res?.data || UNAVAILABLE_STATE);
        }
      })
      .catch(() => {
        if (!cancelled) setStats(UNAVAILABLE_STATE);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Animação count-up do número de vagas preenchidas (só roda com contagem real).
  useEffect(() => {
    if (typeof stats.taken !== "number") return;
    const target = stats.taken;
    if (target === displayTaken) return;
    const id = setInterval(() => {
      setDisplayTaken((d) => {
        if (d === target) {
          clearInterval(id);
          return d;
        }
        return d + (target > d ? 1 : -1);
      });
    }, 40);
    return () => clearInterval(id);
  }, [stats.taken]);

  const isUnavailable = stats.unavailable || typeof stats.remaining !== "number";
  const pct = typeof stats.taken === "number" && stats.limit ? Math.round((displayTaken / stats.limit) * 100) : 0;

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-2 bg-orange-900/20 border border-orange-600 text-orange-200 text-sm font-semibold rounded-full px-4 py-1.5">
        <ShieldCheck className="w-4 h-4 text-orange-400" />
        {loading
          ? "Carregando disponibilidade..."
          : isUnavailable
            ? "Disponibilidade temporariamente indisponível"
            : stats.open
              ? `${stats.remaining} vagas restantes de ${stats.limit}`
              : "Vagas encerradas — 100 fundadores selecionados"}
      </div>
    );
  }

  if (!loading && isUnavailable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/60 border border-border rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <span>Disponibilidade temporariamente indisponível. Tente novamente em instantes.</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Vagas Fundador</p>
          <p className="text-3xl font-extrabold text-foreground">
            {loading ? "…" : displayTaken}
            <span className="text-base font-normal text-muted-foreground"> / {stats.limit}</span>
          </p>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          {loading ? "Carregando..." : stats.open ? `Restam ${stats.remaining}` : "Encerradas"}
        </p>
      </div>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {loading
          ? "Consultando disponibilidade..."
          : stats.open
            ? "Contagem real e auditável — apenas prestadores verificados e aprovados."
            : "As 100 vagas foram preenchidas. A promoção está encerrada."}
      </p>
    </motion.div>
  );
}
