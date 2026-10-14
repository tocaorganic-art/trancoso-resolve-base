import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { isTrustedCaller } from './security.ts';
import { maskName } from './piiMask.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Segurança: payload `data` só é confiável com segredo de automação ou admin.
    // Caso contrário, o lead é resolvido SEMPRE pelo ID no banco — destinatário e
    // conteúdo vêm do registro real, nunca do chamador.
    const isInternal = await isTrustedCaller(req, base44, body);
    const leadId = body.leadId || body.event?.entity_id || body.data?.id;
    let lead: any = null;
    if (leadId) {
      const rows = await base44.asServiceRole.entities.InvestorLead.filter({ id: leadId });
      lead = rows?.[0] || null;
    }
    if (!lead && isInternal && body.data) lead = body.data;

    if (!lead) {
      if (!isInternal) {
        return Response.json({ error: 'Não autorizado' }, { status: 401 });
      }
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia', dateStyle: 'short', timeStyle: 'short' });
    const tipoLabel = {
      angel: 'Investidor-anjo',
      vc: 'Venture Capital',
      family_office: 'Family Office',
      corporate: 'Investidor Corporativo',
      outro: 'Outro perfil',
    }[lead.investor_type] || 'Não informado';

    if (lead.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: lead.email,
        from_name: 'Trancoso Resolve',
        subject: `${lead.name}, recebemos seu contato sobre a tese de investimento`,
        body: `Olá, ${lead.name}!

Obrigado pelo interesse na tese de investimento da Trancoso Resolve.

Nossa equipe vai analisar sua mensagem e retornar em breve pelo email ou WhatsApp informado.

Enquanto isso, o pacote completo para investidores (deck, memorando, plano de execução e modelo financeiro) está disponível para download na página: https://www.trancosoresolve.com.br/investidores

Att,
Tony Monteiro
Trancoso Resolve`,
      });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'tocaorganic@gmail.com',
      from_name: 'Trancoso Resolve | Sistema',
      subject: `🔔 Novo lead de investidor: ${lead.name} (${tipoLabel})`,
      body: `Novo lead capturado na página de investidores!

📋 DADOS DO LEAD
━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${lead.name}
Perfil: ${tipoLabel}
Organização: ${lead.organization || '(não informado)'}
Email: ${lead.email}
Telefone/WhatsApp: ${lead.phone || '(não informado)'}
Faixa de ticket: ${lead.ticket_range || '(não informado)'}
Idioma da página: ${lead.language || 'pt'}
Mensagem: ${lead.message || '(não informado)'}
Consentimento LGPD: ${lead.consent ? 'Sim' : 'Não'}
━━━━━━━━━━━━━━━━━━━━━━━━
🕐 Recebido em: ${now}
`,
    });

    console.log(`[notifyInvestorLead] Lead ${lead.id} notificado: ${maskName(lead.name)}`);
    return Response.json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    console.error('[notifyInvestorLead] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});