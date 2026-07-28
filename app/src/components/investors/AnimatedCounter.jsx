/**
 * AnimatedCounter
 * Card de métrica com:
 *  - contagem progressiva (desabilitada se prefers-reduced-motion)
 *  - unidade, período, classificação, fonte, tooltip
 *  - ClassificationBadge integrado
 *
 * Props:
 *  value        number           — valor final
 *  prefix       string           — ex: 'R$'
 *  suffix       string           — ex: ' mil', '%'
 *  decimals     number           — casas decimais (default 0)
 *  label        string           — nome da métrica
 *  period       string           — ex: 'hipótese · 500 prestadores'
 *  classification string         — chave do ClassificationBadge
 *  classLabel   string           — texto do badge
 *  source       string           — origem do dado (aparece no tooltip)
 *  description  string           — explicação longa (tooltip)
 *  duration     number           — duração da contagem em ms (default 1800)
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { scaleIn, staticVariant } from '@/lib/animationVariants';
import ClassificationBadge from './ClassificationBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp({ target, duration, start, reduced }) {
  const [display, setDisplay] = useState(reduced ? target : start ?? 0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (reduced) { setDisplay(target); return; }
    const startVal = start ?? 0;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = startVal + (target - startVal) * easeOutCubic(progress);
      setDisplay(current);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, start, reduced]);

  return display;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  label,
  period,
  classification,
  classLabel,
  source,
  description,
  duration = 1800,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    if (inView) setCounting(true);
  }, [inView]);

  const displayed = useCountUp({
    target: value,
    duration,
    start: 0,
    reduced: reduced || !counting,
  });

  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayed);

  const hasTooltip = !!(source || description);

  return (
    <motion.div
      ref={ref}
      variants={reduced ? staticVariant : scaleIn}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="group relative flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-warm-sm hover:shadow-warm-md transition-shadow"
      role="region"
      aria-label={label}
    >
      {/* Valor */}
      <p
        className="text-3xl md:text-4xl font-bold text-foreground tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        <span aria-hidden="true">{prefix}{formatted}{suffix}</span>
        {/* texto para leitores de tela — valor final imediato */}
        <span className="sr-only">{prefix}{value}{suffix}</span>
      </p>

      {/* Label */}
      <p className="text-sm font-semibold text-muted-foreground leading-snug">{label}</p>

      {/* Período */}
      {period && (
        <p className="text-xs text-muted-foreground/70">{period}</p>
      )}

      {/* Badge de classificação */}
      {classification && classLabel && (
        <ClassificationBadge type={classification} label={classLabel} />
      )}

      {/* Tooltip com fonte/descrição */}
      {hasTooltip && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={`Mais informações sobre ${label}`}
                className="absolute top-3 right-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
              >
                <Info className="w-4 h-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs leading-relaxed">
              {description && <p className="mb-1">{description}</p>}
              {source && <p className="text-muted-foreground italic">Fonte: {source}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </motion.div>
  );
}
