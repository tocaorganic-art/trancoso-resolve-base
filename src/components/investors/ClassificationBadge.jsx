const STYLES = {
  fato: 'bg-[#3E8E5A]/15 text-[#3E8E5A] border-[#3E8E5A]/30',
  hipotese: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  hipoteseFutura: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 border-dashed',
  cenario: 'bg-[#2D7D8A]/15 text-[#2D7D8A] border-[#2D7D8A]/30',
  faltante: 'bg-[#D7382B]/10 text-[#D7382B] border-[#D7382B]/25',
  recomendacao: 'bg-olive-500/15 text-olive-700 dark:text-olive-300 border-olive-500/30',
  fonteExterna: 'bg-muted text-muted-foreground border-border',
};

export default function ClassificationBadge({ type, label, className = '' }) {
  const style = STYLES[type] || STYLES.fonteExterna;
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-3 py-1 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${style} ${className}`}
    >
      {label}
    </span>
  );
}
