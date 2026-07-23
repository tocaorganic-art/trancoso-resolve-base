import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * listPublicProviders — Endpoint público sanitizado para listar prestadores verificados.
 *
 * SEGURANÇA:
 * - Impõe verified=true no servidor, ignorando qualquer filtro do cliente.
 * - Retorna apenas campos públicos (sem CPF, CNPJ, telefone, email, documentos, localização precisa).
 * - Suporta filtros opcionais de profissão (occupation) e ID específico.
 * - Paginação limitada (max 50 por página).
 *
 * Chamada: POST com body { occupation?, provider_id?, page?, limit? }
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const occupation = body.occupation as string | undefined;
    const providerId = body.provider_id as string | undefined;
    const page = Math.min(Math.max(parseInt(body.page) || 1, 1), 100);
    const limit = Math.min(Math.max(parseInt(body.limit) || 20, 1), 50);
    const skip = (page - 1) * limit;

    // ── Constrói filtro: SEMPRE verified=true, ignorando o cliente
    const filter: Record<string, unknown> = { verified: true };
    if (occupation) filter.occupation = occupation;
    if (providerId) filter.id = providerId;

    const providers = await base44.asServiceRole.entities.ServiceProvider.filter(
      filter,
      '-rating',
      limit,
      skip
    );

    // ── Sanitização: mapeia apenas campos públicos
    const publicProviders = (providers || []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      photo_url: p.photo_url,
      occupation: p.occupation,
      bio: p.bio,
      experience_years: p.experience_years,
      specialties: p.specialties,
      price_range: p.price_range,
      rates: p.rates,
      rating: p.rating,
      total_reviews: p.total_reviews,
      verified: p.verified,
      portfolio_images: p.portfolio_images,
      // Localização: apenas cidade (sem endereço, lat/lng, bairro)
      city: p.location?.city || null,
      availability: p.availability,
    }));

    return Response.json({
      ok: true,
      providers: publicProviders,
      page,
      limit,
      has_more: publicProviders.length === limit,
    });

  } catch (error) {
    console.error('[listPublicProviders] Error:', (error as Error).message);
    return Response.json({ error: 'Erro ao buscar prestadores.' }, { status: 500 });
  }
});