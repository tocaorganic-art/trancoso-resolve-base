import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { investorContent, LANGS } from '@/data/investors/content';

const STORAGE_KEY = 'investorLang';
const InvestorLangContext = createContext(null);

function detectInitialLang() {
  if (typeof window === 'undefined') return 'pt';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && investorContent[saved]) return saved;
  const nav = (window.navigator.language || 'pt').slice(0, 2).toLowerCase();
  return investorContent[nav] ? nav : 'pt';
}

export function InvestorLangProvider({ children }) {
  const [lang, setLang] = useState(detectInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: investorContent[lang], langs: LANGS }), [lang]);

  return <InvestorLangContext.Provider value={value}>{children}</InvestorLangContext.Provider>;
}

export function useInvestorLang() {
  const ctx = useContext(InvestorLangContext);
  if (!ctx) throw new Error('useInvestorLang must be used within InvestorLangProvider');
  return ctx;
}
