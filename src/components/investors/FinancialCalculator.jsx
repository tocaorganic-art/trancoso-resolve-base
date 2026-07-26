import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

const DEFAULTS = {
  fundadorProviders: 0,
  profissionalProviders: 500,
  fundadorPrice: 19.9,
  profissionalPrice: 59,
};

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function FinancialCalculator() {
  const { t } = useInvestorLang();
  const c = t.calculator;
  const [state, setState] = useState(DEFAULTS);

  const { mrr, arr, totalProviders } = useMemo(() => {
    const mrrValue = state.fundadorProviders * state.fundadorPrice + state.profissionalProviders * state.profissionalPrice;
    return {
      mrr: mrrValue,
      arr: mrrValue * 12,
      totalProviders: state.fundadorProviders + state.profissionalProviders,
    };
  }, [state]);

  const update = (key) => (e) => {
    const value = Number(e.target.value);
    setState((s) => ({ ...s, [key]: Number.isFinite(value) ? value : 0 }));
  };

  return (
    <Section id="calculadora" eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-brand-lg border border-border bg-card p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="fundadorProviders" className="text-sm font-semibold text-foreground">{c.fundadorLabel}</label>
              <span className="text-sm font-bold text-orange-700">{state.fundadorProviders}</span>
            </div>
            <input
              id="fundadorProviders"
              type="range"
              min={0}
              max={1000}
              step={10}
              value={state.fundadorProviders}
              onChange={update('fundadorProviders')}
              className="w-full accent-orange-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="profissionalProviders" className="text-sm font-semibold text-foreground">{c.profissionalLabel}</label>
              <span className="text-sm font-bold text-orange-700">{state.profissionalProviders}</span>
            </div>
            <input
              id="profissionalProviders"
              type="range"
              min={0}
              max={1000}
              step={10}
              value={state.profissionalProviders}
              onChange={update('profissionalProviders')}
              className="w-full accent-orange-600"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="fundadorPrice" className="block text-sm font-semibold text-foreground mb-1.5">{c.fundadorPriceLabel}</label>
              <input
                id="fundadorPrice"
                type="number"
                min={0}
                step={0.1}
                value={state.fundadorPrice}
                onChange={update('fundadorPrice')}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label htmlFor="profissionalPrice" className="block text-sm font-semibold text-foreground mb-1.5">{c.profissionalPriceLabel}</label>
              <input
                id="profissionalPrice"
                type="number"
                min={0}
                step={0.1}
                value={state.profissionalPrice}
                onChange={update('profissionalPrice')}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <button
            onClick={() => setState(DEFAULTS)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-orange-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {c.resetLabel}
          </button>
        </div>

        <div className="lg:col-span-2 rounded-brand-lg bg-[#1A1208] text-white p-6 flex flex-col justify-center gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/50">{c.resultProviders}</p>
            <p className="text-2xl font-display font-extrabold mt-1">{totalProviders.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/50">{c.resultMrr}</p>
            <p className="text-3xl font-display font-extrabold mt-1 text-orange-400">{formatBRL(mrr)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/50">{c.resultArr}</p>
            <p className="text-2xl font-display font-extrabold mt-1">{formatBRL(arr)}</p>
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground italic max-w-2xl">{c.disclaimer}</p>
    </Section>
  );
}
