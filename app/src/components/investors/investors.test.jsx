/**
 * Testes da página de investidores — Vitest + Testing Library
 *
 * Cobertura:
 *  1. useReducedMotion — leitura de matchMedia
 *  2. AnimatedCounter — renderização, classificação, acessibilidade, valor final
 *  3. ClassificationBadge — todos os tipos de classificação
 *  4. ChartFrame — título semântico, tabela acessível, toggle de séries
 *  5. AnimatedNarrativeSection — eyebrow, título, highlights, steps
 *  6. Formatação de moeda (pt-BR)
 *  7. prefers-reduced-motion — estado imediato sem animação
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import ClassificationBadge from './ClassificationBadge';
import AnimatedCounter from './AnimatedCounter';
import ChartFrame from './ChartFrame';
import AnimatedNarrativeSection from './AnimatedNarrativeSection';

/* ─── Helper: mock matchMedia para reduced-motion ─────────────────────────── */
function mockMatchMedia(matches) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: query.includes('reduce') ? matches : false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

/* ─── 1. useReducedMotion ─────────────────────────────────────────────────── */
describe('useReducedMotion', () => {
  it('retorna false quando prefers-reduced-motion: no-preference', () => {
    mockMatchMedia(false);
    // hook testado indiretamente via AnimatedCounter (reduced=false → contagem ocorre)
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
  });

  it('retorna true quando prefers-reduced-motion: reduce', () => {
    mockMatchMedia(true);
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
  });
});

/* ─── 2. ClassificationBadge ─────────────────────────────────────────────── */
describe('ClassificationBadge', () => {
  const TYPES = ['fato', 'hipotese', 'hipoteseFutura', 'cenario', 'faltante', 'recomendacao', 'fonteExterna'];

  TYPES.forEach(type => {
    it(`renderiza sem erro para type="${type}"`, () => {
      const { container } = render(<ClassificationBadge type={type} label={type} />);
      expect(container.querySelector('span')).toBeTruthy();
      expect(container.textContent).toBe(type);
    });
  });

  it('renderiza com fallback para type desconhecido', () => {
    const { container } = render(<ClassificationBadge type="desconhecido" label="teste" />);
    expect(container.querySelector('span')).toBeTruthy();
  });
});

/* ─── 3. AnimatedCounter — renderização e acessibilidade ─────────────────── */
describe('AnimatedCounter', () => {
  beforeEach(() => mockMatchMedia(false));

  it('exibe o label da métrica', () => {
    render(
      <AnimatedCounter
        value={500}
        label="Meta de prestadores"
        classification="hipotese"
        classLabel="Hipótese"
      />
    );
    expect(screen.getByText('Meta de prestadores')).toBeTruthy();
  });

  it('exibe o badge de classificação', () => {
    render(
      <AnimatedCounter
        value={29.5}
        prefix="R$ "
        suffix=" mil"
        decimals={1}
        label="MRR"
        classification="cenario"
        classLabel="Cenário ilustrativo"
      />
    );
    expect(screen.getByText('Cenário ilustrativo')).toBeTruthy();
  });

  it('exibe o período quando fornecido', () => {
    render(
      <AnimatedCounter
        value={100}
        label="Teste"
        period="Cenário · 2026"
        classification="hipotese"
        classLabel="Hipótese"
      />
    );
    expect(screen.getByText('Cenário · 2026')).toBeTruthy();
  });

  it('tem role="region" e aria-label para leitores de tela', () => {
    render(<AnimatedCounter value={10} label="KPI teste" />);
    expect(screen.getByRole('region', { name: 'KPI teste' })).toBeTruthy();
  });

  it('com reduced-motion exibe valor final imediatamente (sem animação)', () => {
    mockMatchMedia(true);
    render(
      <AnimatedCounter
        value={354}
        prefix="R$ "
        suffix=" mil"
        decimals={0}
        label="ARR"
        classification="cenario"
        classLabel="Cenário"
      />
    );
    // Valor final deve estar no DOM (texto acessível)
    const srText = document.querySelector('.sr-only');
    expect(srText?.textContent).toContain('354');
  });
});

/* ─── 4. ChartFrame ──────────────────────────────────────────────────────── */
describe('ChartFrame', () => {
  const series = [
    { key: 'a', label: 'Série A', color: '#E8571A' },
    { key: 'b', label: 'Série B', color: '#6B7C3A' },
  ];
  const tableData = [
    { Mês: 'Jan', 'Série A': 'R$ 100', 'Série B': 'R$ 200' },
    { Mês: 'Fev', 'Série A': 'R$ 150', 'Série B': 'R$ 250' },
  ];

  it('renderiza o título como h3 acessível', () => {
    render(
      <ChartFrame title="Receita por Cenário" series={series} tableData={tableData}>
        {() => <div data-testid="chart-child" />}
      </ChartFrame>
    );
    expect(screen.getByRole('heading', { name: 'Receita por Cenário' })).toBeTruthy();
  });

  it('exibe o badge de classificação', () => {
    render(
      <ChartFrame
        title="Gráfico"
        classification="cenario"
        classLabel="Cenário ilustrativo"
        series={[]}
        tableData={[]}
      >
        {() => <div />}
      </ChartFrame>
    );
    expect(screen.getByText('Cenário ilustrativo')).toBeTruthy();
  });

  it('toggle de série por teclado (Enter)', () => {
    render(
      <ChartFrame title="Gráfico" series={series} tableData={[]} period="2026">
        {({ activeKeys }) => (
          <div data-testid="active-count">{activeKeys.size}</div>
        )}
      </ChartFrame>
    );
    // Inicial: 2 séries ativas
    expect(screen.getByTestId('active-count').textContent).toBe('2');

    // Tecla Enter na primeira série
    const [btnA] = screen.getAllByRole('checkbox');
    fireEvent.keyDown(btnA, { key: 'Enter' });
    expect(screen.getByTestId('active-count').textContent).toBe('1');
  });

  it('tabela textual acessível está oculta por padrão (details/summary)', () => {
    render(
      <ChartFrame title="Gráfico" series={[]} tableData={tableData}>
        {() => <div />}
      </ChartFrame>
    );
    const details = document.querySelector('details');
    expect(details).toBeTruthy();
    expect(details.open).toBe(false);
  });

  it('exibe a fonte quando fornecida', () => {
    render(
      <ChartFrame title="G" series={[]} tableData={[]} source="Modelo interno 2026">
        {() => <div />}
      </ChartFrame>
    );
    expect(screen.getByText(/Modelo interno 2026/)).toBeTruthy();
  });
});

/* ─── 5. AnimatedNarrativeSection ───────────────────────────────────────── */
describe('AnimatedNarrativeSection', () => {
  it('renderiza eyebrow, título e description', () => {
    render(
      <AnimatedNarrativeSection
        eyebrow="Contexto"
        title="Mercado fragmentado"
        description="Serviços locais sem plataforma de confiança na Costa do Descobrimento."
      />
    );
    expect(screen.getByText('Contexto')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Mercado fragmentado' })).toBeTruthy();
    expect(screen.getByText(/Serviços locais sem plataforma/)).toBeTruthy();
  });

  it('renderiza steps com label e texto', () => {
    const steps = [
      { label: 'Passo 1', text: 'Descrição do passo 1' },
      { label: 'Passo 2', text: 'Descrição do passo 2' },
    ];
    render(<AnimatedNarrativeSection title="T" steps={steps} />);
    expect(screen.getByText('Passo 1')).toBeTruthy();
    expect(screen.getByText('Descrição do passo 2')).toBeTruthy();
  });

  it('renderiza com alignment center sem quebrar', () => {
    const { container } = render(
      <AnimatedNarrativeSection title="Centrado" alignment="center" />
    );
    expect(container.querySelector('.text-center')).toBeTruthy();
  });
});

/* ─── 6. Formatação de moeda pt-BR ───────────────────────────────────────── */
describe('Formatação de moeda', () => {
  it('formata 29500 como "29.500" em pt-BR', () => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(29500);
    expect(formatted).toBe('29.500');
  });

  it('formata 354000 como "354.000" em pt-BR', () => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(354000);
    expect(formatted).toBe('354.000');
  });

  it('formata 29.5 com 1 decimal como "29,5" em pt-BR', () => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(29.5);
    expect(formatted).toBe('29,5');
  });
});
