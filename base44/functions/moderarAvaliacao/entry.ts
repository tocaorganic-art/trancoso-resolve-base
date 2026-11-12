import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Moderação automática de avaliações ──────────────────────────────────────
// Gatilho: criação de ServiceReview (workflow "Moderação Automática de Avaliações").
// Se o comentário tiver contato fora da plataforma, dado pessoal ou linguagem
// ofensiva, a avaliação vai para status 'pending' (sai do ar, não é apagada) e
// a equipe recebe um alerta. Nada é apagado.
// Origem aceita: segredo de automação (x-automation-secret) ou usuário admin.

// INICIO_REGRAS_MODERACAO
const PADROES: Array<{ motivo: string; re: RegExp }> = [
  { motivo: 'telefone', re: /(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[\s.-]?\d{4}/ },
  { motivo: 'e-mail', re: /[\w.+-]+@[\w-]+\.[\w.]+/ },
  { motivo: 'link externo', re: /(https?:\/\/|www\.)\S+|wa\.me|chat\.whatsapp/i },
  { motivo: 'CPF', re: /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/ },
  { motivo: 'linguagem ofensiva', re: /\b(idiota|imbecil|otári[oa]|vagabund[oa]|lixo|merda|porra|caralho|puta|desgraçad[oa]|filh[oa] da puta)\b/i },
];

export function motivosModeracao(comentario: unknown): string[] {
  const texto = typeof comentario === 'string' ? comentario : '';
  if (!texto.trim()) return [];
  return PADROES.filter((p) => p.re.test(texto)).map((p) => p.motivo);
}
// FIM_REGRAS_MODERACAO

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const expected = Deno.env.get('AUTOMATION_WEBHOOK_SECRET') ?? '';
    const received = req.headers.get('x-automation-secret') ?? '';
    let autorizado = expected.length > 0 && timingSafeEqual(expected, received);
    if (!autorizado) {
      const user = await base44.auth.me().catch(() => null);
      autorizado = user?.role === 'admin';
    }
    if (!autorizado) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const review = body?.data || {};
    const reviewId = review.id || body?.event?.entity_id || body?.review_id;
    if (!reviewId) return Response.json({ error: 'review_id ausente' }, { status: 400 });

    const motivos = motivosModeracao(review.comment);
    if (!motivos.length) return Response.json({ ok: true, moderado: false });

    await base44.asServiceRole.entities.ServiceReview.update(reviewId, { status: 'pending' });
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'suporte@trancosoresolve.com.br',
      subject: '[Trancoso Resolve] Avaliação retida para moderação',
      body: [
        `A avaliação ${reviewId} saiu do ar e aguarda revisão.`,
        `Motivo: ${motivos.join(', ')}.`,
        review.provider_id ? `Prestador: ${review.provider_id}` : '',
        '',
        'Para publicar, mude o status da avaliação para published no painel. Para remover, use removed.',
      ].filter(Boolean).join('\n'),
    });
    return Response.json({ ok: true, moderado: true, motivos });
  } catch (error) {
    console.error('[moderarAvaliacao] erro:', (error as Error).message);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
});
