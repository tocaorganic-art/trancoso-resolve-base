/**
 * animationVariants.js
 * Variantes Framer Motion reutilizáveis em toda a página de investidores.
 *
 * Padrão de uso:
 *   const reduced = useReducedMotion();
 *   <motion.div variants={reduced ? VARIANTS.static : VARIANTS.fadeUp} ... />
 *
 * Regras:
 * - Só transform + opacity (sem width/height/top/left → evita reflow)
 * - Duração máxima: 0,6 s em desktop, 0,4 s em mobile (via className md:)
 * - Easing: ease-out ou spring suave
 */

// ─── Variante "estática" — conteúdo visível imediatamente (reduced-motion) ───
export const staticVariant = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

// ─── Fade + subida curta (uso geral) ─────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Fade simples (textos, badges) ───────────────────────────────────────────
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

// ─── Entrada da esquerda (hero title) ────────────────────────────────────────
export const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Entrada da direita ───────────────────────────────────────────────────────
export const fadeRight = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Escala suave (cards, métricas) ──────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Container com stagger (lista de cards) ───────────────────────────────────
export const staggerContainer = (stagger = 0.1, delayChildren = 0.05) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// ─── Item do stagger (filho) ──────────────────────────────────────────────────
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Helper: retorna variante correta conforme reduced-motion ─────────────────
export function v(reduced, animated) {
  return reduced ? staticVariant : animated;
}
