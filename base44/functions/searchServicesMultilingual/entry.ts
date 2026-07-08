import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Cache de buscas semânticas (máximo 100 entradas)
const semanticCache = new Map();
const MAX_CACHE_SIZE = 100;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, language = 'pt', limit = 8 } = await req.json();

    if (!query || query.trim().length < 2) {
      return Response.json({ services: [] });
    }

    const cacheKey = `${language}:${query.toLowerCase()}`;
    if (semanticCache.has(cacheKey)) {
      return Response.json({ services: semanticCache.get(cacheKey), cached: true });
    }

    // Busca semântica via LLM
    const searchPrompt = language === 'pt'
      ? `Analise a query de busca: "${query}". Retorne categorias e palavras-chave relevantes em JSON: { "categories": ["cat1"], "keywords": ["kw1"] }`
      : language === 'en'
      ? `Analyze search query: "${query}". Return relevant categories and keywords as JSON: { "categories": ["cat1"], "keywords": ["kw1"] }`
      : language === 'es'
      ? `Analiza la consulta: "${query}". Devuelve categorías y palabras clave relevantes en JSON: { "categories": ["cat1"], "keywords": ["kw1"] }`
      : `Analysez la requête: "${query}". Retournez catégories et mots-clés pertinents en JSON: { "categories": ["cat1"], "keywords": ["kw1"] }`;

    let searchParams = { limit };

    try {
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: searchPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            categories: { type: 'array', items: { type: 'string' } },
            keywords: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      if (aiResult.categories?.length > 0) {
        searchParams.category = aiResult.categories[0];
      }
    } catch (err) {
      console.warn('Erro na busca semântica, usando fallback:', err);
    }

    // Buscar serviços com parâmetros otimizados
    const services = await base44.entities.Service.list();
    
    const filtered = services
      .filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase()) ||
        s.category?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    // Ordenar por relevância
    const scored = filtered.map(s => ({
      ...s,
      score: (
        (s.name.toLowerCase() === query.toLowerCase() ? 100 : 0) +
        (s.name.toLowerCase().includes(query.toLowerCase()) ? 50 : 0) +
        (s.category?.toLowerCase().includes(query.toLowerCase()) ? 25 : 0)
      )
    })).sort((a, b) => b.score - a.score);

    const result = scored.map(({ score, ...s }) => s);

    // Cache com limite
    if (semanticCache.size >= MAX_CACHE_SIZE) {
      const firstKey = semanticCache.keys().next().value;
      semanticCache.delete(firstKey);
    }
    semanticCache.set(cacheKey, result);

    return Response.json({ services: result });
  } catch (error) {
    console.error('Erro em searchServicesMultilingual:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});