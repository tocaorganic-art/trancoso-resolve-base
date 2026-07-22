import { createContext, useContext, useState, useEffect } from 'react';
import translations, { LANGUAGES } from '@/i18n/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('tr-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('tr-lang');
    return LANGUAGES.some(l => l.code === stored) ? stored : 'pt';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem('tr-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tr-lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
  }, [lang]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const t = (key) => {
    const dict = translations[lang] ?? translations.pt;
    const parts = key.split('.');
    let val = dict;
    for (const part of parts) {
      val = val?.[part];
      if (val === undefined) break;
    }
    return val ?? key;
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang, t, LANGUAGES }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
