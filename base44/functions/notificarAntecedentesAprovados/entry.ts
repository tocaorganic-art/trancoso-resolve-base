import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { maskEmail } from './piiMask.ts';

// ─── Notificar Antecedentes Aprovados ────────────────────────────────────────
// Envia e-mail ao prestador assim que a verificação de antecedentes criminais
// (status_verificacao) é aprovada no sistema — seja pela consulta automática
// da Infosimples (verificarAntecedentes) ou por aprovação de etapa no painel.
//
// Invocação principal: automação On Update de ServiceProvider com condição
// changed_fields ∋ status_verificacao && data.status_verificacao == 'aprovado'.
// Também aceita payload direto { service_provider_id }.
//
// Guardas:
// - provider.verified === true → já totalmente verificado; o e-mail de boas-vindas
//   do adminVerificacao já cobre a comunicação (evita e-mail duplicado).
// - status_verificacao !== 'aprovado' → nada a notificar.

// Comparacao timing-safe de segredos (mesmo padrão de criarTrialPrestador)
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  try {
    // Protegida por segredo compartilhado — sem isso, um payload.data forjado poderia
    // direcionar o e-mail de aprovação para um endereço arbitrário.
    const expectedSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET') ?? '';
    const receivedSecret = req.headers.get('x-automation-secret') ?? '';
    if (!(expectedSecret.length > 0 && timingSafeEqual(expectedSecret, receivedSecret))) {
      console.warn('[notificarAntecedentesAprovados] Automacao sem segredo valido — rejeitada.');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));

    const providerId =
      payload?.service_provider_id || payload?.data?.id || payload?.event?.entity_id;

    if (!providerId) {
      return Response.json({ error: 'service_provider_id é obrigatório' }, { status: 400 });
    }

    // Se o payload veio truncado (payload_too_large) ou sem o registro, busca no banco.
    // WORKAROUND (06/09/2026): .get(id) via asServiceRole falha em runtime; usar .filter({ id }).
    let provider = payload?.data;
    if (payload?.payload_too_large || !provider?.id) {
      const rows = await base44.asServiceRole.entities.ServiceProvider.filter({ id: providerId });
      provider = (rows && rows.length > 0) ? rows[0] : null;
    }

    if (!provider) {
      console.log('[notificarAntecedentesAprovados] prestador não encontrado:', providerId);
      return Response.json({ ok: true, note: 'prestador não encontrado' });
    }

    if (provider.verified === true) {
      return Response.json({ ok: true, note: 'prestador já totalmente verificado, boas-vindas já enviadas' });
    }

    if (provider.status_verificacao !== 'aprovado') {
      return Response.json({ ok: true, note: 'status_verificacao não é aprovado, nada a notificar' });
    }

    const providerEmail = provider.email || provider.created_by;
    if (!providerEmail) {
      console.log('[notificarAntecedentesAprovados] prestador sem email:', provider.id);
      return Response.json({ ok: true, note: 'prestador sem email' });
    }

    const firstName = (typeof provider.full_name === 'string' && provider.full_name.trim())
      ? provider.full_name.trim().split(' ')[0]
      : 'prestador';

    const emailBody = `Olá, ${firstName}! 🎉

Boas notícias: a verificação de antecedentes criminais do seu cadastro na Trancoso Resolve foi aprovada com sucesso, nada consta!

O que acontece agora:

✅ Se a verificação de identidade (documento com foto) ainda estiver pendente, finalize-a no seu painel para receber o selo de prestador verificado.

✅ Se tudo já estiver completo, nossa equipe fará a revisão final e liberaremos seu perfil em breve.

Acompanhe o andamento no seu painel: https://trancosoresolve.com.br/Dashboard

Qualquer dúvida, responda este e-mail ou fale com o suporte no site.

Um abraço,
Equipe Trancoso Resolve 🌊`.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: providerEmail,
      from_name: 'Trancoso Resolve',
      subject: '✅ Verificação de antecedentes aprovada | Trancoso Resolve',
      body: emailBody,
    });

    console.log(`[notificarAntecedentesAprovados] notificação enviada para ${maskEmail(providerEmail)} (prestador ${provider.id})`);
    return Response.json({ ok: true, sent_to: providerEmail });
  } catch (error) {
    console.error('[notificarAntecedentesAprovados] Error:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});