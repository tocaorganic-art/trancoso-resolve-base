import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Alerta à equipe quando um prestador precisa de olho humano ──────────────
// Gatilho: atualização de ServiceProvider em que status_verificacao mudou para
// 'em_analise_manual' ou 'reprovado' (workflow "Alerta Equipe - Verificação
// Precisa de Revisão"). Cobre consulta desligada, PJ, dados faltando, erro e
// reprovação. Não muda nenhum dado. Sem CPF ou dado sensível no e-mail.
// Origem aceita: segredo de automação (x-automation-secret) ou usuário admin.

// INICIO_REGRAS_ALERTA
const STATUS_ALERTA = ['em_analise_manual', 'reprovado'];

export function precisaAlertarEquipe(p: { status_verificacao?: string }): boolean {
  return !!p.status_verificacao && STATUS_ALERTA.includes(p.status_verificacao);
}

export function semDadoSensivel(texto: string): string {
  return String(texto || '').replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '***.***.***-**').slice(0, 300);
}
// FIM_REGRAS_ALERTA

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
    const p = body?.data || {};
    const id = p.id || body?.event?.entity_id;
    if (!id) return Response.json({ error: 'id ausente' }, { status: 400 });
    if (!precisaAlertarEquipe(p)) return Response.json({ ok: true, alertado: false });

    const titulo = p.status_verificacao === 'reprovado' ? 'reprovado na verificação' : 'em análise manual';
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'suporte@trancosoresolve.com.br',
      subject: `[Trancoso Resolve] Prestador ${titulo}`,
      body: [
        `Prestador ${id}: ${titulo}.`,
        p.full_name ? `Nome: ${String(p.full_name).slice(0, 80)}` : '',
        p.relatorio_verificacao ? `Motivo registrado: ${semDadoSensivel(p.relatorio_verificacao)}` : '',
        '',
        'Painel: https://trancosoresolve.com.br/FilaVerificacao',
      ].filter(Boolean).join('\n'),
    });
    return Response.json({ ok: true, alertado: true });
  } catch (error) {
    console.error('[notificarAdminVerificacao] erro:', (error as Error).message);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
});
