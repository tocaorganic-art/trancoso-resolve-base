import { useState } from 'react';
import { Menu, X, Download } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { useInvestorLang } from './InvestorLangContext';

export default function InvestorNav() {
  const { t, lang, setLang, langs } = useInvestorLang();
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between gap-4">
        <a href="/investidores" className="shrink-0">
          <Logo className="" markClassName="h-9 w-9" textClassName="text-xs" />
        </a>

        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
          {t.nav.sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-orange-700 transition-colors whitespace-nowrap"
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-pill border border-border p-0.5" role="group" aria-label={t.nav.langLabel}>
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                className={`px-2.5 py-1 text-xs font-bold rounded-pill transition-colors ${
                  lang === l.code ? 'bg-brand-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollTo('downloads')}
            className="hidden md:inline-flex items-center gap-1.5 rounded-pill bg-brand-primary text-white text-sm font-bold px-4 py-2 hover:bg-brand-primary-hover transition-colors"
          >
            <Download className="w-4 h-4" /> {t.hero.ctaPrimary}
          </button>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setOpen((o) => !o)}
            aria-label={t.nav.langLabel}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {t.nav.sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="px-3 py-1.5 rounded-pill border border-border text-sm font-semibold"
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center rounded-pill border border-border p-0.5 w-fit">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                aria-pressed={lang === l.code}
                className={`px-3 py-1 text-xs font-bold rounded-pill transition-colors ${
                  lang === l.code ? 'bg-brand-primary text-white' : 'text-muted-foreground'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
