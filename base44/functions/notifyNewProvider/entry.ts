import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Alerta de Novo Prestador ─────────────────────────────────────────────────
// Disparado por automação de entidade (ServiceProvider → create).
// Envia email instantâneo para a equipe com link wa.me de um toque para
// contato imediato via WhatsApp.

const ADMIN_EMAIL = 'contato@trancosoresolve.com.br';
const ADMIN_WHATSAPP = '5573998283579'; // número da equipe (footer do site)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Suporta automação de entidade (body.data) ou chamada direta (providerId)
    let provider = body.data || null;

    if (!provider) {
      const providerId = body.providerId || body.event?.entity_id;
      if (!providerId) {
        return Response.json({ error: 'providerId is required' }, { status: 400 });
      }
      const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ id: providerId });
      provider = providers?.[0];
    }

    if (!provider) {
      return Response.json({ error: 'Provider not found' }, { status: 404 });
    }

    const phoneClean = (provider.phone || '').replace(/\D/g, '');
    // wa.me exige DDI 55 + DDD + número
    const whatsappLink = phoneClean ? `https://wa.me/55${phoneClean}` : null;
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia', dateStyle: 'short', timeStyle: 'short' });

    const occupation = provider.occupation || 'Não informado';
    const city = provider.location?.city || 'Não informado';
    const neighborhood = provider.location?.neighborhood || '—';
    const tipoPessoa = provider.tipo_pessoa === 'pj' ? 'PJ (Empresa)' : provider.tipo_pessoa === 'mei' ? 'MEI' : 'Pessoa Física';
    const experiencia = provider.experience_years != null ? `${provider.experience_years} anos` : 'Não informado';

    // Mensagem pré-preenchida para o WhatsApp do prestador
    const waMessage = whatsappLink
      ? `${whatsappLink}?text=${encodeURIComponent(`Olá ${provider.full_name}! Recebemos seu cadastro na Trancoso Resolve como ${occupation}. Vamos conversar sobre os próximos passos. 🎉`)}`
      : null;

    // Email com formato de alerta rápido — assunto curto e urgente para gerar push
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      from_name: 'Trancoso Resolve — Novo Prestador',
      subject: `🆕 Novo prestador: ${provider.full_name} — ${occupation}`,
      body: `🆕 NOVO PRESTADOR CADASTRADO

━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DADOS DO PRESTADOR
━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${provider.full_name}
Ocupação: ${occupation}
Tipo: ${tipoPessoa}
Experiência: ${experiencia}
Email: ${provider.email || '(não informado)'}
Telefone: ${provider.phone || '(não informado)'}
Cidade: ${city}
Bairro: ${neighborhood}

━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 Cadastrado em: ${now}
━━━━━━━━━━━━━━━━━━━━━━━━━

${waMessage ? `👉 ABRIR WHATSAPP AGORA (1 toque):
${waMessage}

` : ''}👉 Acessar fila de verificação:
https://trancosoresolve.com.br/FilaVerificacao

---
Email automático — Trancoso Resolve`,
    });

    console.log(`[notifyNewProvider] Prestador ${provider.id} notificado: ${provider.full_name} (${occupation})`);
    return Response.json({ success: true, message: 'Provider notification sent', whatsapp_link: waMessage });
  } catch (error) {
    console.error('[notifyNewProvider] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});