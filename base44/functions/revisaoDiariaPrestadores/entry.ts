import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Revisão diária de prestadores ───────────────────────────────────────────
// Roda uma vez por dia (workflow "Revisão Diária - Trial e Verificações").
// 1. Avisa o prestador 7 dias e 1 dia antes do fim dos 2 meses grátis.
// 2. Avisa a equipe sobre verificações paradas há mais de 48 horas.
// Não muda status de nada. Aceita { dry_run: true } para só contar.
// Origem aceita: segredo de automação (x-automation-secret) ou usuário admin.

// INICIO_REGRAS_REVISAO
const DIAS_AVISO_TRIAL = [7, 1];
const HORAS_SLA_VERIFICACAO = 48;
const STATUS_VERIFICACAO_ABERTA = ['pending', 'in_progress', 'pending_review'];

export function diaBahia(iso: string): string {
  // America/Bahia = UTC-3, sem horário de verão.
  const d = new Date(new Date(iso).getTime() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

export function diasAte(fimIso: string, agoraIso: string): number {
  const fim = Date.parse(diaBahia(fimIso) + 'T00:00:00Z');
  const hoje = Date.parse(diaBahia(agoraIso) + 'T00:00:00Z');
  return Math.round((fim - hoje) / 86400000);
}

export function deveAvisarTrial(sub: { status?: string; trial_end?: string }, agoraIso: string): number | null {
  if (sub.status !== 'trial' || !sub.trial_end) return null;
  const dias = diasAte(sub.trial_end, agoraIso);
  return DIAS_AVISO_TRIAL.includes(dias) ? dias : null;
}

export function verificacaoAtrasada(v: { status?: string; updated_date?: string; created_date?: string }, agoraIso: string): boolean {
  if (!v.status || !STATUS_VERIFICACAO_ABERTA.includes(v.status)) return false;
  const ref = v.updated_date || v.created_date;
  if (!ref) return false;
  return Date.parse(agoraIso) - Date.parse(ref) > HORAS_SLA_VERIFICACAO * 3600 * 1000;
}

export function analiseManualAtrasada(p: { status_verificacao?: string; data_verificacao?: string }, agoraIso: string): boolean {
  if (p.status_verificacao !== 'em_analise_manual' || !p.data_verificacao) return false;
  return Date.parse(agoraIso) - Date.parse(p.data_verificacao) > HORAS_SLA_VERIFICACAO * 3600 * 1000;
}

export function textoAvisoTrial(dias: number): { subject: string; body: string } {
  const quando = dias === 1 ? 'amanhã' : `em ${dias} dias`;
  return {
    subject: `Seus 2 meses grátis na Trancoso Resolve terminam ${quando}`,
    body: [
      'Olá!',
      '',
      `Seu período de 2 meses grátis na Trancoso Resolve termina ${quando}.`,
      'Você entrou sem cartão e nada é cobrado automaticamente.',
      '',
      'Se quiser continuar aparecendo na vitrine digital oficial de Trancoso e acompanhando as estatísticas de visualizações e cliques do seu perfil, é só escolher seu plano no painel:',
      'https://trancosoresolve.com.br/planos',
      '',
      'Equipe Trancoso Resolve',
    ].join('\n'),
  };
}
// FIM_REGRAS_REVISAO

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function mascararEmail(email: string): string {
  const [u, d] = String(email || '').split('@');
  if (!d) return '***';
  return `${u.slice(0, 2)}***@${d}`;
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
    const dryRun = body?.dry_run === true;
    const agora = new Date().toISOString();
    const db = base44.asServiceRole.entities;

    // 1. Avisos de fim de trial
    const trials = (await db.Subscription.filter({ status: 'trial' })) || [];
    let avisosTrial = 0;
    for (const sub of trials) {
      const dias = deveAvisarTrial(sub, agora);
      if (dias === null || !sub.user_email) continue;
      avisosTrial++;
      if (dryRun) continue;
      const { subject, body: texto } = textoAvisoTrial(dias);
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: sub.user_email, subject, body: texto });
        console.info(`[revisaoDiaria] aviso D-${dias} para ${mascararEmail(sub.user_email)}`);
      } catch (e) {
        console.warn('[revisaoDiaria] aviso de trial falhou:', (e as Error).message);
      }
    }

    // 2. Verificações paradas
    const verificacoes = (await db.Verificacao.list('-updated_date', 500)) || [];
    const atrasadas = verificacoes.filter((v: any) => verificacaoAtrasada(v, agora));
    const prestadores = (await db.ServiceProvider.filter({ status_verificacao: 'em_analise_manual' })) || [];
    const manuais = prestadores.filter((p: any) => analiseManualAtrasada(p, agora));

    if (!dryRun && (atrasadas.length || manuais.length)) {
      const linhas = [
        `Verificações abertas há mais de 48 horas: ${atrasadas.length}`,
        ...atrasadas.slice(0, 50).map((v: any) => `- Verificacao ${v.id} (${v.verification_type || 'sem tipo'}, status ${v.status})`),
        '',
        `Prestadores em análise manual há mais de 48 horas: ${manuais.length}`,
        ...manuais.slice(0, 50).map((p: any) => `- ServiceProvider ${p.id}`),
        '',
        'Painel: https://trancosoresolve.com.br/FilaVerificacao',
      ];
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'suporte@trancosoresolve.com.br',
        subject: `[Trancoso Resolve] ${atrasadas.length + manuais.length} verificações paradas há mais de 48h`,
        body: linhas.join('\n'),
      });
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      avisos_trial: avisosTrial,
      verificacoes_atrasadas: atrasadas.length,
      analises_manuais_atrasadas: manuais.length,
    });
  } catch (error) {
    console.error('[revisaoDiaria] erro:', (error as Error).message);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
});
