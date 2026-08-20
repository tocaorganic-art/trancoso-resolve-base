/**
 * AnimatedNarrativeSection
 * Bloco narrativo reutilizável com entrada por scroll.
 *
 * Props:
 *  eyebrow       string          — label pequeno acima do título
 *  title         string|ReactNode — título principal
 *  description   string          — parágrafo descritivo
 *  highlights    string[]        — palavras-chave destacadas no description
 *  steps         {icon, label, text}[] — etapas sequenciais
 *  alignment     'left'|'center' — alinhamento (default: 'left')
 *  animVariant   'fadeUp'|'fadeLeft'|'fadeRight'|'scaleIn'
 *  children      ReactNode       — conteúdo livre embaixo
 *  reducedMotionFallback ReactNode — substitui animações se reduced-motion
 */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeUp, fadeLeft, fadeRight, scaleIn, staticVariant, staggerContainer, staggerItem, v } from '@/lib/animationVariants';

const VARIANTS_MAP = { fadeUp, fadeLeft, fadeRight, scaleIn };

function highlightText(text, keywords = []) {
  if (!keywords.length) return text;
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-transparent text-brand-primary font-semibold not-italic">{part}</mark>
      : part
  );
}

export default function AnimatedNarrativeSection({
  eyebrow,
  title,
  description,
  highlights = [],
  steps = [],
  alignment = 'left',
  animVariant = 'fadeUp',
  children,
  reducedMotionFallback,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  const baseVariant = reduced ? staticVariant : (VARIANTS_MAP[animVariant] || fadeUp);
  const containerVariant = reduced ? staticVariant : staggerContainer(0.1, 0.05);
  const itemVariant = reduced ? staticVariant : staggerItem;
  const center = alignment === 'center';

  if (reduced && reducedMotionFallback) return reducedMotionFallback;

  return (
    <motion.div
      ref={ref}
      variants={containerVariant}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={`space-y-5 ${center ? 'text-center' : ''}`}
    >
      {eyebrow && (
        <motion.p
          variants={v(reduced, fadeIn)}
          className="text-xs font-bold uppercase tracking-widest text-brand-primary"
        >
          {eyebrow}
        </motion.p>
      )}

      {title && (
        <motion.h2
          variants={baseVariant}
          className={`text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight ${center ? 'mx-auto max-w-2xl' : ''}`}
        >
          {title}
        </motion.h2>
      )}

      {description && (
        <motion.p
          variants={itemVariant}
          className={`text-base md:text-lg text-muted-foreground leading-relaxed ${center ? 'mx-auto max-w-2xl' : 'max-w-prose'}`}
        >
          {highlightText(description, highlights)}
        </motion.p>
      )}

      {steps.length > 0 && (
        <motion.ol
          variants={containerVariant}
          className={`space-y-3 ${center ? 'mx-auto max-w-2xl text-left' : ''}`}
        >
          {steps.map((step, i) => (
            <motion.li
              key={i}
              variants={itemVariant}
              className="flex items-start gap-3 group"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold"
              >
                {step.icon || i + 1}
              </span>
              <div>
                {step.label && (
                  <p className="font-semibold text-foreground text-sm mb-0.5">{step.label}</p>
                )}
                {step.text && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                )}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      )}

      {children && (
        <motion.div variants={itemVariant}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// Variante de import nomeado para uso inline
export { highlightText };
