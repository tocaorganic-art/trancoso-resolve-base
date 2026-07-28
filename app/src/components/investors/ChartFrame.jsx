/**
 * ChartFrame
 * Wrapper acessível para qualquer gráfico Recharts.
 *
 * Recursos:
 *  - título semântico (<h3>)
 *  - badge de classificação + período + fonte
 *  - tabela textual acessível (<details> + <table>) para screen readers
 *  - toggle de série via teclado (passa activeKeys para o filho)
 *  - lazy render: só monta o gráfico após entrar no viewport
 *  - prefers-reduced-motion: animações dos gráficos zeradas
 *
 * Props:
 *  title        string     — título do gráfico
 *  classification string   — badge type
 *  classLabel   string     — badge text
 *  period       string     — ex: 'Cenário ilustrativo · 2026–2027'
 *  source       string     — origem dos dados
 *  series       {key, label, color}[] — séries do gráfico (para toggle + tabela)
 *  tableData    {label, ...values}[]  — dados tabulares (acessibilidade)
 *  children     (activeKeys: Set<string>) => ReactNode
 */
import { useRef, useState, useCallback } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import ClassificationBadge from './ClassificationBadge';

export default function ChartFrame({
  title,
  classification,
  classLabel,
  period,
  source,
  series = [],
  tableData = [],
  children,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  // Lazy: só monta chart após entrar no viewport
  const inView = useInView(ref, { once: true, margin: '-100px 0px' });

  // Toggle de séries ativas
  const [activeKeys, setActiveKeys] = useState(
    () => new Set(series.map(s => s.key))
  );

  const toggleKey = useCallback((key) => {
    setActiveKeys(prev => {
      const next = new Set(prev);
      // Não permite desativar a última série
      if (next.has(key) && next.size === 1) return prev;
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleKey(key);
    }
  }, [toggleKey]);

  return (
    <figure
      ref={ref}
      aria-label={title}
      className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4 shadow-warm-sm"
    >
      {/* Cabeçalho */}
      <figcaption className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base md:text-lg font-bold text-foreground">{title}</h3>
          {classification && classLabel && (
            <ClassificationBadge type={classification} label={classLabel} />
          )}
        </div>
        {period && (
          <p className="text-xs text-muted-foreground">{period}</p>
        )}
      </figcaption>

      {/* Toggle de séries */}
      {series.length > 1 && (
        <div
          role="group"
          aria-label="Filtrar séries do gráfico"
          className="flex flex-wrap gap-2"
        >
          {series.map(s => {
            const active = activeKeys.has(s.key);
            return (
              <button
                key={s.key}
                role="checkbox"
                aria-checked={active}
                onClick={() => toggleKey(s.key)}
                onKeyDown={(e) => handleKeyDown(e, s.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                  ${active
                    ? 'border-current opacity-100'
                    : 'border-border opacity-40'
                  }`}
                style={{ color: active ? s.color : undefined }}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Gráfico (lazy + reduced-motion flag passado via children fn) */}
      <div
        className="w-full overflow-x-auto"
        style={{ minHeight: 220 }}
        aria-hidden={!inView}
      >
        {inView && children({ activeKeys, reduced })}
      </div>

      {/* Tabela textual acessível */}
      {tableData.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded">
            Ver dados em formato de tabela
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {Object.keys(tableData[0]).map(k => (
                    <th
                      key={k}
                      scope="col"
                      className="border border-border px-2 py-1 text-left font-semibold bg-muted/30"
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="odd:bg-muted/10">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="border border-border px-2 py-1">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* Fonte */}
      {source && (
        <p className="text-xs text-muted-foreground/60 italic border-t border-border pt-2">
          Fonte: {source}
        </p>
      )}
    </figure>
  );
}
