import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ShieldCheck } from "lucide-react";

// Contador real de vagas de Prestador Fundador — consome getFounderStats (server-side).
export default function FounderCounter({ variant = "hero" }) {
  const [stats, setStats] = useState({ taken: 0, remaining: 100, limit: 100, open: true });
  const [displayTaken, setDisplayTaken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    base44.functions
      .invoke("getFounderStats", {})
      .then((res) => {
        if (!cancelled && res?.data) setStats(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Animação count-up do número de vagas preenchidas
  useEffect(() => {
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

  const pct = Math.round((displayTaken / stats.limit) * 100);

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-2 bg-orange-900/20 border border-orange-600 text-orange-200 text-sm font-semibold rounded-full px-4 py-1.5">
        <ShieldCheck className="w-4 h-4 text-orange-400" />
        {stats.open
          ? `${stats.remaining} vagas restantes de ${stats.limit}`
          : "Vagas encerradas — 100 fundadores selecionados"}
      </div>
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
            {displayTaken}
            <span className="text-base font-normal text-muted-foreground"> / {stats.limit}</span>
          </p>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          {stats.open ? `Restam ${stats.remaining}` : "Encerradas"}
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
        {stats.open
          ? "Contagem real e auditável — apenas prestadores verificados e aprovados."
          : "As 100 vagas foram preenchidas. A promoção está encerrada."}
      </p>
    </motion.div>
  );
}