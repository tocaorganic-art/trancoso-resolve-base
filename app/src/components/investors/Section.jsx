/**
 * Section — wrapper de seção com scroll-reveal e useReducedMotion.
 * Substitui o motion hardcoded anterior pelo sistema central de variantes.
 */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeUp, staticVariant, staggerContainer, staggerItem } from '@/lib/animationVariants';

const TONES = {
  default: 'bg-background',
  sand: 'bg-sand/40 dark:bg-neutral-900/60',
  dark: 'bg-[#1A1208] text-white',
};

export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  tone = 'default',
  className = '',
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  const headerVariant = reduced ? staticVariant : staggerContainer(0.08, 0);
  const itemVariant   = reduced ? staticVariant : staggerItem;
  const isDark        = tone === 'dark';

  return (
    <section
      id={id}
      className={`scroll-mt-24 py-16 md:py-24 ${TONES[tone] ?? TONES.default} ${className}`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {(eyebrow || title || subtitle) && (
          <motion.div
            ref={ref}
            variants={headerVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="mb-10 md:mb-14 max-w-3xl"
          >
            {eyebrow && (
              <motion.p
                variants={itemVariant}
                className={`text-xs font-bold uppercase tracking-[0.12em] mb-3 ${
                  isDark ? 'text-orange-400' : 'text-orange-700'
                }`}
              >
                {eyebrow}
              </motion.p>
            )}
            {title && (
              <motion.h2
                variants={reduced ? staticVariant : fadeUp}
                className={`text-3xl md:text-4xl font-display font-extrabold leading-tight tracking-[-0.02em] ${
                  isDark ? 'text-white' : 'text-foreground'
                }`}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                variants={itemVariant}
                className={`mt-4 text-base md:text-lg leading-relaxed ${
                  isDark ? 'text-white/70' : 'text-muted-foreground'
                }`}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
