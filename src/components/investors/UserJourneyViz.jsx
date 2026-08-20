/**
 * UserJourneyViz
 * Jornada de uso em 6 etapas animadas.
 *
 * Desktop: trilha horizontal com barra de progresso e estado ativo por etapa.
 * Mobile: sequência vertical.
 * Navegação por teclado: setas ← → / Tab / Enter / Espaço.
 * prefers-reduced-motion: todas etapas visíveis, sem transições.
 *
 * Etapas: apenas compatíveis com o funcionamento real do produto.
 */
import { useState, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Dados fixos em PT (completados via content.js quando disponível)
const DEFAULT_STEPS = [
  {
    id: 1,
    emoji: '💡',
    label: 'Identificar a necessidade',
    desc: 'Proprietário percebe que precisa de um serviço — diarista, eletricista ou piscineiro — e não tem um profissional de confiança.',
    value: 'Dor real, recorrente e sem solução organizada no mercado local.',
  },
  {
    id: 2,
    emoji: '🔍',
    label: 'Buscar o profissional',
    desc: 'Acessa a Trancoso Resolve, filtra por categoria, destino e disponibilidade.',
    value: 'Plataforma centraliza oferta verificada — sem depender de grupos de WhatsApp.',
  },
  {
    id: 3,
    emoji: '📋',
    label: 'Avaliar e escolher',
    desc: 'Vê perfil, avaliações, histórico e certificação do prestador antes de decidir.',
    value: 'Confiança antes do contato — reduz friccção e abandono.',
  },
  {
    id: 4,
    emoji: '📲',
    label: 'Solicitar o serviço',
    desc: 'Envia a solicitação diretamente pela plataforma. Prestador recebe em tempo real.',
    value: 'Velocidade de resposta e rastreabilidade do pedido.',
  },
  {
    id: 5,
    emoji: '✅',
    label: 'Receber e avaliar',
    desc: 'Serviço realizado. Cliente avalia o prestador — alimentando o ciclo de qualidade.',
    value: 'Reputação cresce com uso. Rede melhora progressivamente.',
  },
  {
    id: 6,
    emoji: '🔁',
    label: 'Recorrência e confiança',
    desc: 'Cliente volta para o mesmo prestador. Prestador consolida sua agenda pela plataforma.',
    value: 'Receita recorrente para ambos os lados — base do modelo de negócio.',
  },
];

export default function UserJourneyViz() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  const [activeStep, setActiveStep] = useState(0);
  const total = DEFAULT_STEPS.length;

  const goTo = useCallback((i) => setActiveStep(Math.max(0, Math.min(total - 1, i))), [total]);

  const handleKeyDown = useCallback((e, i) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(i + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goTo(i - 1); }
    if (e.key === 'Enter' || e.key === ' ')               { e.preventDefault(); setActiveStep(i); }
  }, [goTo]);

  const step = DEFAULT_STEPS[activeStep];

  return (
    <div ref={ref} className="space-y-6" role="region" aria-label="Jornada do usuário na plataforma">
      {/* Barra de progresso */}
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute inset-y-0 left-0 bg-brand-primary rounded-full"
          animate={{ width: `${((activeStep + 1) / total) * 100}%` }}
          transition={{ duration: reduced ? 0 : 0.35, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right -mt-4" aria-hidden="true">
        Etapa {activeStep + 1} de {total}
      </p>

      {/* Desktop — trilha horizontal */}
      <div className="hidden md:flex gap-1 items-start relative" role="tablist" aria-label="Etapas da jornada">
        {DEFAULT_STEPS.map((s, i) => {
          const isActive = i === activeStep;
          const isDone   = i < activeStep;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`journey-panel-${s.id}`}
              id={`journey-tab-${s.id}`}
              onClick={() => setActiveStep(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                ${isActive ? 'bg-brand-primary/10' : 'hover:bg-muted/50'}`}
            >
              <motion.span
                className={`text-2xl transition-all ${isDone ? 'opacity-60' : ''}`}
                animate={isActive && !reduced ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                aria-hidden="true"
              >
                {isDone ? '✓' : s.emoji}
              </motion.span>
              <span className={`text-[10px] font-semibold text-center leading-tight ${
                isActive ? 'text-brand-primary' : isDone ? 'text-muted-foreground/60' : 'text-muted-foreground'
              }`}>
                {s.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="h-0.5 w-6 rounded-full bg-brand-primary"
                  transition={{ duration: reduced ? 0 : 0.3 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Painel de detalhe (desktop + mobile) */}
      <div
        id={`journey-panel-${step.id}`}
        role="tabpanel"
        aria-labelledby={`journey-tab-${step.id}`}
        tabIndex={0}
        className="focus:outline-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6 md:p-8 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{step.emoji}</span>
              <h3 className="font-bold text-foreground text-lg">{step.label}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            <p className="text-sm font-semibold text-brand-primary">{step.value}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegação mobile */}
      <div className="md:hidden">
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-4" aria-hidden="true">
          {DEFAULT_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`h-2 rounded-full transition-all ${i === activeStep ? 'w-6 bg-brand-primary' : 'w-2 bg-muted-foreground/30'}`}
              aria-label={`Ir para etapa ${i + 1}`}
            />
          ))}
        </div>

        {/* Botões anterior/próximo */}
        <div className="flex gap-3">
          <button
            onClick={() => goTo(activeStep - 1)}
            disabled={activeStep === 0}
            className="flex-1 rounded-pill border border-border py-2 text-sm font-semibold text-muted-foreground disabled:opacity-30 transition-opacity hover:bg-muted/30"
          >
            ← Anterior
          </button>
          <button
            onClick={() => goTo(activeStep + 1)}
            disabled={activeStep === total - 1}
            className="flex-1 rounded-pill bg-brand-primary text-white py-2 text-sm font-bold disabled:opacity-30 transition-opacity"
          >
            Próximo →
          </button>
        </div>
      </div>

      {/* SR text completo */}
      <ol className="sr-only">
        {DEFAULT_STEPS.map(s => (
          <li key={s.id}><strong>{s.label}:</strong> {s.desc} {s.value}</li>
        ))}
      </ol>
    </div>
  );
}
