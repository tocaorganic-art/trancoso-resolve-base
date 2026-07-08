import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const categoryAliases = {
  'faxina': 'Limpeza',
  'faxina-domestica': 'Limpeza',
  'diarista': 'Limpeza',
  'limpeza': 'Limpeza',
  'eletricista': 'Eletricista',
  'encanador': 'Encanador',
  'encanação': 'Encanador',
  'jardinagem': 'Jardinagem',
  'jardineiro': 'Jardinagem',
  'cozinheiro': 'Cozinheiro',
  'chef': 'Cozinheiro',
  'gastronomia': 'Cozinheiro',
  'babá': 'Babá',
  'nanny': 'Babá',
  'pedreiro': 'Pedreiro',
  'pedraria': 'Pedreiro',
  'pintor': 'Pintor',
  'pintura': 'Pintor',
  'garçom': 'Garçom',
  'garcom': 'Garçom',
  'passador': 'Outro',
};

function normalizeCategory(query) {
  const normalized = query.toLowerCase().trim();
  return categoryAliases[normalized] || normalized;
}

function calculateRelevance(service, query) {
  let score = 0;
  const queryWords = query.toLowerCase().split(' ');
  
  queryWords.forEach(word => {
    if (service.name?.toLowerCase().includes(word)) score += 30;
    if (service.summary?.toLowerCase().includes(word)) score += 20;
    if (service.description?.toLowerCase().includes(word)) score += 10;
    if (service.category?.toLowerCase().includes(word)) score += 25;
  });
  
  // Boost for verified providers
  if (service.verified) score += 15;
  // Boost for high ratings
  if (service.rating && service.rating >= 4.5) score += 10;
  
  return score;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { query, limit = 10, filters = {} } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const normalizedCategory = normalizeCategory(query);
    
    // Build query filter
    const queryFilter = {
      active: true,
      category: normalizedCategory,
      ...(filters.minRating && { rating: { $gte: filters.minRating } }),
      ...(filters.maxPrice && { price_range: { $lte: filters.maxPrice } }),
      ...(filters.verified && { verified: true })
    };

    // Busca serviços pela categoria normalizada
    const services = await base44.entities.ServiceListing.filter(
      queryFilter,
      '-created_date',
      limit * 2 // Fetch extra to filter by relevance
    );

    if (!services || services.length === 0) {
      return Response.json({
        success: true,
        query: query,
        normalized_category: normalizedCategory,
        results: [],
        total: 0,
        search_type: 'category'
      });
    }

    // Score by relevance
    const scored = services.map(s => ({
      ...s,
      relevance_score: calculateRelevance(s, query)
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, limit);

    console.log(`[searchServices] Query: "${query}" → Category: "${normalizedCategory}" → Found: ${scored.length}`);

    return Response.json({
      success: true,
      query: query,
      normalized_category: normalizedCategory,
      results: scored,
      total: scored.length,
      search_type: 'semantic'
    });

  } catch (error) {
    console.error('[searchServices] Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});