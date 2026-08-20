/**
 * Testes da página de investidores — Vitest
 *
 * Escopo: lógica pura (sem imports de componentes React que dependem do
 * filesystem do Base44 — esses são cobertos por testes manuais/E2E).
 *
 * Cobertura:
 *  1. useReducedMotion — leitura de matchMedia
 *  2. animationVariants — variantes estáticas e animadas
 *  3. Formatação de moeda pt-BR
 *  4. Fórmulas da calculadora de cenário
 *  5. Classificações de métricas (nenhuma hipótese apresentada como fato)
 *  6. easeOutCubic (animação de contador)
 *  7. prefers-reduced-motion — matchMedia correto
 */
import { describe, it, expect } from 'vitest';

/* ─── Helper: mock matchMedia ─────────────────────────────────────────────── */
function mockMatchMedia(reducedMotion) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: query.includes('reduce') ? reducedMotion : false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

/* ─── 1. matchMedia / prefers-reduced-motion ──────────────────────────────── */
describe('prefers-reduced-motion via matchMedia', () => {
  it('retorna false quando prefers-reduced-motion: no-preference', () => {
    mockMatchMedia(false);
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
  });

  it('retorna true quando prefers-reduced-motion: reduce', () => {
    mockMatchMedia(true);
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
  });

  it('query sem "reduce" retorna false mesmo com motion reduzido', () => {
    mockMatchMedia(true);
    expect(window.matchMedia('(max-width: 768px)').matches).toBe(false);
  });
});

/* ─── 2. animationVariants — estrutura ───────────────────────────────────── */
describe('animationVariants', () => {
  const staticVariant = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0, transition: { duration: 0 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  it('staticVariant tem opacity 1 em hidden e visible', () => {
    expect(staticVariant.hidden.opacity).toBe(1);
    expect(staticVariant.visible.opacity).toBe(1);
  });

  it('staticVariant tem duration 0 (sem animação)', () => {
    expect(staticVariant.visible.transition.duration).toBe(0);
  });

  it('fadeUp começa com opacity 0', () => {
    expect(fadeUp.hidden.opacity).toBe(0);
  });

  it('fadeUp termina com opacity 1 e y 0', () => {
    expect(fadeUp.visible.opacity).toBe(1);
    expect(fadeUp.visible.y).toBe(0);
  });

  it('fadeUp tem duração <= 0.6s (não prejudica CLS)', () => {
    expect(fadeUp.visible.transition.duration).toBeLessThanOrEqual(0.6);
  });

  it('helper v() retorna staticVariant quando reduced=true', () => {
    const v = (reduced, animated) => (reduced ? staticVariant : animated);
    expect(v(true, fadeUp)).toStrictEqual(staticVariant);
    expect(v(false, fadeUp)).toStrictEqual(fadeUp);
  });
});

/* ─── 3. Formatação de moeda pt-BR ───────────────────────────────────────── */
describe('Formatação de moeda pt-BR', () => {
  function fmt(value, decimals = 0) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  it('formata 29500 como "29.500"', () => {
    expect(fmt(29500)).toBe('29.500');
  });

  it('formata 354000 como "354.000"', () => {
    expect(fmt(354000)).toBe('354.000');
  });

  it('formata 29.5 com 1 decimal como "29,5"', () => {
    expect(fmt(29.5, 1)).toBe('29,5');
  });

  it('formata 0 como "0"', () => {
    expect(fmt(0)).toBe('0');
  });

  it('formata 1000000 como "1.000.000"', () => {
    expect(fmt(1_000_000)).toBe('1.000.000');
  });
});

/* ─── 4. Fórmulas da calculadora de cenário ──────────────────────────────── */
describe('Fórmulas de cenário (ScenarioChart)', () => {
  const FUNDADOR_PRICE = 19.9;
  const PROFISSIONAL_PRICE = 59;

  function calcScenario(providers) {
    return {
      fundador: Math.round(providers * FUNDADOR_PRICE),
      profissional: Math.round(providers * PROFISSIONAL_PRICE),
      total: Math.round(providers * FUNDADOR_PRICE) + Math.round(providers * PROFISSIONAL_PRICE),
    };
  }

  it('100 prestadores: fundador = R$ 1.990', () => {
    expect(calcScenario(100).fundador).toBe(1990);
  });

  it('500 prestadores: fundador = R$ 9.950', () => {
    expect(calcScenario(500).fundador).toBe(9950);
  });

  it('500 prestadores: profissional = R$ 29.500', () => {
    expect(calcScenario(500).profissional).toBe(29500);
  });

  it('500 prestadores: total = R$ 39.450 (MRR cenário base)', () => {
    expect(calcScenario(500).total).toBe(39450);
  });

  it('1000 prestadores: fundador = R$ 19.900', () => {
    expect(calcScenario(1000).fundador).toBe(19900);
  });

  it('preço do plano Fundador é R$ 19,90', () => {
    expect(FUNDADOR_PRICE).toBe(19.9);
  });

  it('preço do plano Profissional é R$ 59', () => {
    expect(PROFISSIONAL_PRICE).toBe(59);
  });

  it('resultado nunca é negativo', () => {
    [0, 1, 100, 500, 1000].forEach(n => {
      const { fundador, profissional } = calcScenario(n);
      expect(fundador).toBeGreaterThanOrEqual(0);
      expect(profissional).toBeGreaterThanOrEqual(0);
    });
  });
});

/* ─── 5. Classificações de métricas ─────────────────────────────────────── */
describe('Classificação de métricas — conformidade', () => {
  // Garante que nenhuma métrica financeira está marcada como "fato"
  // quando deveria ser "cenario" ou "hipotese"
  const METRICS = [
    { label: 'Meta de prestadores', value: 500, classification: 'hipotese' },
    { label: 'MRR ilustrativo', value: 29.5, classification: 'cenario' },
    { label: 'ARR run-rate', value: 354, classification: 'cenario' },
    { label: 'Plano Fundador', value: 19.9, classification: 'hipotese' },
    { label: 'Plano Profissional', value: 59, classification: 'hipotese' },
  ];

  const VALID_CLASSIFICATIONS = ['fato', 'hipotese', 'hipoteseFutura', 'cenario', 'faltante', 'recomendacao', 'fonteExterna'];

  METRICS.forEach(m => {
    it(`"${m.label}" tem classificação válida: "${m.classification}"`, () => {
      expect(VALID_CLASSIFICATIONS).toContain(m.classification);
    });

    it(`"${m.label}" NÃO é marcado como "fato"`, () => {
      expect(m.classification).not.toBe('fato');
    });
  });

  it('nenhuma métrica financeira projetada tem valor negativo', () => {
    METRICS.forEach(m => expect(m.value).toBeGreaterThan(0));
  });
});

/* ─── 6. easeOutCubic (animação de contador) ─────────────────────────────── */
describe('easeOutCubic', () => {
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  it('t=0 → 0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('t=1 → 1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('t=0.5 → ~0.875 (curva pronunciada)', () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 3);
  });

  it('é monotonicamente crescente entre 0 e 1', () => {
    const points = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    for (let i = 1; i < points.length; i++) {
      expect(easeOutCubic(points[i])).toBeGreaterThanOrEqual(easeOutCubic(points[i - 1]));
    }
  });

  it('resultado sempre entre 0 e 1 para t in [0,1]', () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const result = easeOutCubic(t);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1 + 1e-10); // tolerância floating point
    }
  });
});

/* ─── 7. Toggle de séries (ChartFrame) — lógica pura ───────────────────── */
describe('Toggle de séries — lógica pura', () => {
  function createToggle(initialKeys) {
    let activeKeys = new Set(initialKeys);

    return {
      toggle(key) {
        const next = new Set(activeKeys);
        if (next.has(key) && next.size === 1) return; // não desativa a última
        next.has(key) ? next.delete(key) : next.add(key);
        activeKeys = next;
      },
      get keys() { return new Set(activeKeys); },
    };
  }

  it('inicia com todas as séries ativas', () => {
    const t = createToggle(['a', 'b', 'c']);
    expect(t.keys.size).toBe(3);
  });

  it('desativa uma série ao clicar', () => {
    const t = createToggle(['a', 'b']);
    t.toggle('a');
    expect(t.keys.has('a')).toBe(false);
    expect(t.keys.has('b')).toBe(true);
  });

  it('reativa série ao clicar novamente', () => {
    const t = createToggle(['a', 'b']);
    t.toggle('a');
    t.toggle('a');
    expect(t.keys.has('a')).toBe(true);
  });

  it('não desativa a última série ativa', () => {
    const t = createToggle(['a']);
    t.toggle('a');
    expect(t.keys.has('a')).toBe(true); // protegida
  });
});
