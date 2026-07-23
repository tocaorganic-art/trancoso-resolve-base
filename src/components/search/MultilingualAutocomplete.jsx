import { useState, useCallback, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MultilingualAutocomplete({ 
  onSelect, 
  language = 'pt',
  placeholder = 'Buscar serviços...'
}) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const cacheRef = useRef({});

  const searchWithSemantic = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const cacheKey = `${language}:${query.toLowerCase()}`;
    if (cacheRef.current[cacheKey]) {
      setSuggestions(cacheRef.current[cacheKey]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('searchServices', {
        query,
        language,
        limit: 8
      });

      const results = result.services || [];
      cacheRef.current[cacheKey] = results;
      setSuggestions(results);
    } catch (err) {
      console.error('Erro na busca:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setSelectedIndex(-1);
    searchWithSemantic(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      onSelect(suggestions[selectedIndex]);
      setInput('');
      setSuggestions([]);
    }
  };

  const handleSelect = (suggestion) => {
    onSelect(suggestion);
    setInput('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 w-4 h-4 text-cyan-500 animate-spin" />
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={`${suggestion.id}-${idx}`}
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left px-4 py-2 transition-colors ${
                idx === selectedIndex
                  ? 'bg-slate-700'
                  : 'hover:bg-slate-700'
              }`}
            >
              <div className="font-medium text-white">{suggestion.name}</div>
              <div className="text-xs text-slate-400">{suggestion.category}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}