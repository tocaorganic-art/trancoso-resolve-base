import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Contador server-side e auditável de vagas de Prestador Fundador.
// Este é o ÚNICO DTO público sobre o programa Fundador — não expõe e-mail,
// nome, provider_id, motivo de revogação nem qualquer registro individual de
// FounderGrant (que é privada, ver base44/entities/FounderGrant.jsonc).
//
// REGRA COMERCIAL IMUTÁVEL: posições revogadas continuam consumindo uma das
// 100 vagas originais. Quem cancelou e voltou NÃO recupera o selo. Por isso
// "taken" conta TODOS os grants (active + revoked), não apenas os ativos.
// Exemplo: 100 grants, 10 revogados → taken=100, active=90, remaining=0, open=false.
//
// Contrato de resposta (sempre HTTP 200 — ver nota sobre fail-closed):
//   sucesso:      { taken, active, remaining, limit, open, unavailable: false }
//   indisponível: { taken: null, active: null, remaining: null, limit,
//                   open: false, unavailable: true, error: "FOUNDER_STATS_UNAVAILABLE" }
//
// Por que sempre 200 (e não 503) em erro:
// @base44/sdk usa axios internamente para functions.invoke(), e axios lança
// exceção em qualquer resposta HTTP não-2xx. Um 503 faria o SDK jogar a Promise
// em reject, e os consumidores (FounderCounter.jsx, Planos.jsx) cairiam de volta
// no estado inicial otimista — recriando o fail-open que esta função elimina.

const FOUNDER_LIMIT = 100;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Lista todos os grants — ativos E revogados.
    // Todos consomem uma das 100 vagas permanentemente.
    const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
    const allGrants = grants || [];

    // taken = total de vagas PERMANENTEMENTE consumidas (active + revoked)
    const taken = allGrants.length;
    // active = fundadores que ainda mantêm o selo vigente
    const active = allGrants.filter((g: { status?: string }) => g.status === 'active').length;

    return Response.json({
      taken,                                          // vagas usadas permanentemente
      active,                                         // fundadores com selo vigente
      remaining: Math.max(0, FOUNDER_LIMIT - taken),  // vagas ainda disponíveis
      limit: FOUNDER_LIMIT,
      open: taken < FOUNDER_LIMIT,
      unavailable: false,
    });
  } catch (error) {
    console.error('[getFounderStats] erro ao consultar disponibilidade:', (error as Error).message);

    // Fail-closed: nunca inventar vagas quando a consulta real falhou.
    return Response.json({
      taken: null,
      active: null,
      remaining: null,
      limit: FOUNDER_LIMIT,
      open: false,
      unavailable: true,
      error: 'FOUNDER_STATS_UNAVAILABLE',
    });
  }
});
