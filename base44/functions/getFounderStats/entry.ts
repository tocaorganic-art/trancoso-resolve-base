import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Contador server-side e auditável de vagas de Prestador Fundador.
// Este é o ÚNICO DTO público sobre o programa Fundador — não expõe e-mail,
// nome, provider_id, motivo de revogação nem qualquer registro individual de
// FounderGrant (que agora é privada, ver base44/entities/FounderGrant.jsonc).
//
// Conta apenas FounderGrant com status='active' — ou seja, prestadores que
// concluíram cadastro, foram aprovados na verificação e receberam o selo.
// Não conta cadastros incompletos, rejeitados, duplicados ou revogados.
//
// Contrato de resposta (sempre HTTP 200 — ver nota sobre fail-closed abaixo):
//   sucesso:      { taken, remaining, limit, open, unavailable: false }
//   indisponível: { taken: null, remaining: null, limit, open: false,
//                   unavailable: true, error: "FOUNDER_STATS_UNAVAILABLE" }
//
// Por que sempre 200 (e não 503) em erro:
// @base44/sdk usa axios internamente para functions.invoke(), e axios lança
// exceção em qualquer resposta HTTP não-2xx. Um 503 aqui faria o SDK jogar
// a Promise em reject, o que os consumidores atuais (FounderCounter.jsx,
// Planos.jsx) não tratam de forma segura — cairiam de volta no estado
// inicial otimista (taken:0/remaining:100/open:true), recriando o mesmo
// fail-open que esta correção existe para eliminar. Por isso devolvemos
// 200 com unavailable:true, e os consumidores tratam esse campo
// explicitamente. Se no futuro isso for revisitado, confirmar antes que
// erros HTTP propagam como res.data (e não como exceção) no SDK em uso.
const FOUNDER_LIMIT = 100;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
    const taken = (grants || []).filter((g: { status?: string }) => g.status === 'active').length;

    return Response.json({
      taken,
      remaining: Math.max(0, FOUNDER_LIMIT - taken),
      limit: FOUNDER_LIMIT,
      open: taken < FOUNDER_LIMIT,
      unavailable: false,
    });
  } catch (error) {
    // Log interno apenas com a mensagem do erro — nunca com dados de FounderGrant.
    console.error('[getFounderStats] erro ao consultar disponibilidade:', (error as Error).message);

    // Fail-closed: nunca inventar taken:0/remaining:100/open:true quando a
    // consulta real falhou. taken/remaining vêm como null (não um número)
    // para deixar explícito que não são uma contagem real.
    return Response.json({
      taken: null,
      remaining: null,
      limit: FOUNDER_LIMIT,
      open: false,
      unavailable: true,
      error: 'FOUNDER_STATS_UNAVAILABLE',
    });
  }
});
