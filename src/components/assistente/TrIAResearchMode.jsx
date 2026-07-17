import { useState } from 'react';
import { Globe, Search, Sparkles, Loader2, TrendingUp, BookOpen, MapPin } from 'lucide-react';

const RESEARCH_TOPICS = [
  { icon: MapPin, label: 'Locais em Trancoso', color: 'from-orange-500 to-red-500', query: 'pontos turísticos em Trancoso Bahia' },
  { icon: TrendingUp, label: 'Tendências locais', color: 'from-green-500 to-emerald-500', query: 'o que está em alta em Trancoso' },
  { icon: BookOpen, label: 'História de Trancoso', color: 'from-purple-500 to-pink-500', query: 'história de Trancoso colonização' },
  { icon: Globe, label: 'Eventos próximos', color: 'from-blue-500 to-cyan-500', query: 'eventos em Trancoso próximos' },
];

export default function TrIAResearchMode() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    // Simular busca
    setTimeout(() => {
      setResults({
        query,
        count: Math.floor(Math.random() * 5) + 3,
        timestamp: new Date().toLocaleString('pt-BR'),
      });
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-slate-900 to-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pesquisa Profunda</h1>
            <p className="text-xs text-slate-400">Busque informações em tempo real</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Pesquise sobre Trancoso, eventos, roteiros..."
              className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-purple-500 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-colors focus:shadow-lg focus:shadow-purple-500/20"
            />
          </div>
          <button
            onClick={() => handleSearch(searchQuery)}
            disabled={!searchQuery.trim() || isSearching}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Results or Topics */}
      <div className="flex-1 p-6 md:p-8">
        {results ? (
          <div className="max-w-2xl">
            <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-cyan-300">{results.count} resultados</span> encontrados para{' '}
                <span className="font-semibold text-white">"{results.query}"</span>
              </p>
              <p className="text-xs text-slate-500 mt-2">Atualizado em {results.timestamp}</p>
            </div>

            {/* Sample Results */}
            <div className="space-y-3">
              {[...Array(results.count)].map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer group"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-12 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate mb-1">
                        Resultado {idx + 1} - {results.query}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                        Descrição resumida do resultado da busca sobre {results.query} com informações relevantes...
                      </p>
                      <p className="text-xs text-purple-400">Saiba mais →</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setResults(null)}
              className="mt-6 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Voltar aos tópicos
            </button>
          </div>
        ) : (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Tópicos em destaque</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {RESEARCH_TOPICS.map((topic, idx) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSearch(topic.query)}
                    className={`group relative p-4 rounded-lg bg-gradient-to-br ${topic.color} overflow-hidden transition-all transform hover:scale-105`}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-white text-sm">{topic.label}</h3>
                        <p className="text-xs text-white/80">Pesquisa rápida</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 p-6 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <h3 className="font-semibold text-white">Dicas de pesquisa</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Use termos específicos para resultados mais precisos</li>
                <li>• Combine palavras-chave (ex: "roteiro + gastronomia")</li>
                <li>• Pesquise por datas para informações atualizadas</li>
                <li>• Mencione "Toca TrIA" para recomendações personalizadas</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}