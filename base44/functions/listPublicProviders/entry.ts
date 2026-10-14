import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * listPublicProviders — Endpoint público sanitizado para listar prestadores verificados.
 *
 * SEGURANÇA:
 * - Impõe verified=true no servidor, ignorando qualquer filtro do cliente.
 * - Retorna apenas campos públicos (sem CPF, CNPJ, telefone, email, documentos, created_by,
 *   endereço ou lat/lng — apenas cidade/bairro aproximados).
 * - Exclui prestadores de teste/demo (mesma heurística antes aplicada no frontend).
 * - Suporta filtros opcionais de profissão (occupation) e ID específico.
 * - Paginação limitada (max 50 por página).
 *
 * Chamada: POST com body { occupation?, provider_id?, page?, limit? }
 */

// Heurística de prestador de teste/demo — movida do frontend para cá porque depende do
// email, que nunca é exposto publicamente.
function isTestProvider(p: any): boolean {
  if (!p) return false;
  if (p.full_name?.toLowerCase().includes('teste')) return true;
  if (p.email?.match(/@(teste|email|test|demo|example|sample)\.com/i)) return true;
  if (p.bio && /[ytdgfutyfyuftyuftuyfytufytukfjtyufjyt]{20,}/.test(p.bio.replace(/\s/g, ''))) return true;
  return false;
}

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

    const visibleProviders = (providers || []).filter((p) => !isTestProvider(p));

    // ── Busca só em lookup de prestador único (provider_id): evita N+1 em listagens.
    let activeSubscriptionProviderId: string | null = null;
    if (providerId && visibleProviders.length === 1 && visibleProviders[0].created_by) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const subs = await base44.asServiceRole.entities.Subscription.filter({
          user_email: visibleProviders[0].created_by,
        });
        const hasActive = (subs || []).some((s: any) => {
          if (s.status === 'active') {
            return !s.next_billing_date || today <= s.next_billing_date;
          }
          if (s.status === 'trial') {
            return s.trial_end && today <= s.trial_end;
          }
          return false;
        });
        if (hasActive) activeSubscriptionProviderId = visibleProviders[0].id;
      } catch (subErr) {
        console.warn('[listPublicProviders] Falha ao checar assinatura:', (subErr as Error).message);
      }
    }

    // ── Sanitização: mapeia apenas campos públicos
    const publicProviders = visibleProviders.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      photo_url: p.photo_url,
      cover_photo_url: p.cover_photo_url,
      occupation: p.occupation,
      bio: p.bio,
      experience_years: p.experience_years,
      specialties: p.specialties,
      price_range: p.price_range,
      rates: p.rates,
      rating: p.rating,
      total_reviews: p.total_reviews,
      verified: p.verified,
      status_verificacao: p.status_verificacao,
      portfolio_images: p.portfolio_images,
      // Localização: apenas cidade/bairro aproximados (sem endereço, lat/lng)
      location: {
        city: p.location?.city || null,
        neighborhood: p.location?.neighborhood || null,
      },
      availability: p.availability,
      tipo_pessoa: p.tipo_pessoa,
      tem_ponto_fisico_em_trancoso: p.tem_ponto_fisico_em_trancoso,
      has_active_subscription: p.id === activeSubscriptionProviderId,
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