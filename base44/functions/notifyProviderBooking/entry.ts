import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Called by automation — use service role
    const { event, data } = payload;

    if (!data) {
      return Response.json({ error: 'No data in payload' }, { status: 400 });
    }

    const request = data;

    // Find provider to get their email
    const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ id: request.provider_id });
    const provider = providers?.[0];

    if (!provider) {
      console.log('Provider not found for id:', request.provider_id);
      return Response.json({ ok: true, note: 'provider not found' });
    }

    // Email do prestador: tenta provider.email, fallback para created_by (email do dono do registro)
    const providerEmail = provider.email || provider.created_by;

    if (!providerEmail) {
      console.log('No email for provider:', provider.full_name);
      return Response.json({ ok: true, note: 'no provider email' });
    }

    // Find service details
    const services = await base44.asServiceRole.entities.ServiceListing.filter({ id: request.service_id });
    const service = services?.[0];

    const dateFormatted = request.date ? new Date(request.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Data não informada';
    const timeFormatted = request.time || 'Horário a combinar';

    const emailBody = `
Olá, ${provider.full_name.split(' ')[0]}! 🌴

Você tem uma nova solicitação de agendamento na plataforma Trancoso Resolve.

━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETALHES DO AGENDAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Cliente: ${request.client_name}
📱 Telefone: ${request.client_phone}
🔧 Serviço: ${service?.title || 'Serviço solicitado'}
📅 Data: ${dateFormatted}
🕐 Horário: ${timeFormatted}
${request.urgency === 'Urgente' ? '⚡ URGÊNCIA: Este pedido é URGENTE!\n' : ''}
${request.message ? `💬 Mensagem do cliente: "${request.message}"` : ''}
${request.location?.address ? `📍 Local: ${request.location.address}${request.location.number ? ', ' + request.location.number : ''}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━

Por favor, acesse seu painel (Minha Agenda) para confirmar ou recusar esta solicitação.

Acesse: https://trancosoresolve.base44.app/MinhaAgenda

Um abraço,
Equipe Trancoso Resolve 🌊
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: providerEmail,
      subject: `🌴 Nova solicitação de agendamento — ${request.client_name}`,
      body: emailBody,
      from_name: 'Trancoso Resolve'
    });

    console.log(`Notificação enviada para ${providerEmail} — pedido de ${request.client_name}`);
    return Response.json({ ok: true, sent_to: providerEmail });

  } catch (error) {
    console.error('Erro ao notificar prestador:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});