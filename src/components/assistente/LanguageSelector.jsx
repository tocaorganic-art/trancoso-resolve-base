import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export default function LanguageSelector({ currentLanguage, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLang = LANGUAGES.find(l => l.code === currentLanguage);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-orange-900/20 hover:bg-orange-900/40 border border-orange-800/30 hover:border-orange-700/50 text-[#F2DEC4] rounded-pill px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Selecionar idioma"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-orange-400" />
        <span className="text-xs font-semibold">
          {currentLang?.flag} {currentLang?.name || 'PT'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[#130D06] border border-orange-900/30 rounded-brand-sm shadow-warm-md z-50 overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                currentLanguage === lang.code
                  ? 'bg-orange-500/20 text-orange-300 border-l-2 border-orange-500 font-semibold'
                  : 'text-[#C8A882] hover:bg-orange-900/20'
              }`}
              aria-current={currentLanguage === lang.code}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}