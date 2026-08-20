/**
 * useReducedMotion
 * Respeita a preferência do sistema operacional / navegador
 * `prefers-reduced-motion: reduce`.
 *
 * Uso:
 *   const reduced = useReducedMotion();
 *   // se true → mostrar conteúdo estático, sem transições longas
 */
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const handler = (e) => setReduced(e.matches);
    // addEventListenercompat
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      // Safari < 14 fallback
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, []);

  return reduced;
}
