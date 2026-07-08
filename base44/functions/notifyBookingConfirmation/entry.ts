import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Triggered by entity automation on ServiceRequest create/update.
 * - On CREATE: sends confirmation email to the CLIENT (booking received).
 * - On UPDATE to status=Confirmado: sends confirmation email to BOTH client and provider.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data, old_data } = payload;

    if (!data) {
      return Response.json({ error: 'No data' }, { status: 400 });
    }

    const request = data;
    const eventType = event?.type; // 'create' or 'update'

    // Fetch provider and service in parallel
    const [providers, services] = await Promise.all([
      base44.asServiceRole.entities.ServiceProvider.filter({ id: request.provider_id }),
      base44.asServiceRole.entities.ServiceListing.filter({ id: request.service_id }),
    ]);

    const provider = providers?.[0];
    const service = services?.[0];

    const dateFormatted = request.date
      ? new Date(request.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Data não informada';
    const timeFormatted = request.time || 'Horário a combinar';
    const serviceTitle = service?.title || 'Serviço solicitado';
    const providerName = provider?.full_name || 'Prestador';
    const providerFirstName = providerName.split(' ')[0];

    // ─── CREATE: notify client that booking was received ───
    if (eventType === 'create' && request.client_email) {
      const clientBody = `
Olá, ${request.client_name}! 🌴

Sua solicitação de agendamento foi recebida com sucesso no Trancoso Resolve!

━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RESUMO DO AGENDAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Serviço: ${serviceTitle}
👤 Prestador: ${providerName}
📅 Data: ${dateFormatted}
🕐 Horário: ${timeFormatted}
${request.urgency === 'Urgente' ? '⚡ Urgência: URGENTE\n' : ''}
${request.location?.address ? `📍 Local: ${request.location.address}${request.location.number ? ', ' + request.location.number : ''}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Status: Aguardando confirmação do prestador.

Você receberá uma notificação assim que ${providerFirstName} confirmar seu agendamento.

Em caso de dúvidas, entre em contato pelo WhatsApp ou acesse a plataforma:
https://www.trancosoresolve.com.br/MeusPedidos

Um abraço,
Equipe Trancoso Resolve 🌊
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: request.client_email,
        subject: `✅ Solicitação recebida — ${serviceTitle} com ${providerFirstName}`,
        body: clientBody,
        from_name: 'Trancoso Resolve',
      });

      console.log(`Email de recebimento enviado ao cliente: ${request.client_email}`);
    }

    // ─── UPDATE to Confirmado: notify both client and provider ───
    if (eventType === 'update' && request.status === 'Confirmado' && old_data?.status !== 'Confirmado') {
      const emails = [];

      // Email para o cliente
      if (request.client_email) {
        const clientConfirmBody = `
Olá, ${request.client_name}! 🎉

Boa notícia! Seu agendamento foi CONFIRMADO por ${providerFirstName}!

━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AGENDAMENTO CONFIRMADO
━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Serviço: ${serviceTitle}
👤 Prestador: ${providerName}
📅 Data: ${dateFormatted}
🕐 Horário: ${timeFormatted}
${request.location?.address ? `📍 Local: ${request.location.address}${request.location.number ? ', ' + request.location.number : ''}` : ''}
${request.location?.reference ? `🗺️ Referência: ${request.location.reference}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Dicas:
• Tenha o endereço pronto para compartilhar com o prestador.
• Em caso de imprevisto, entre em contato com antecedência.
• Após o serviço, avalie o prestador para ajudar a comunidade!

Acesse seus pedidos: https://www.trancosoresolve.com.br/MeusPedidos

Um abraço,
Equipe Trancoso Resolve 🌊
        `.trim();

        emails.push(base44.asServiceRole.integrations.Core.SendEmail({
          to: request.client_email,
          subject: `🎉 Agendamento CONFIRMADO — ${serviceTitle} com ${providerFirstName}`,
          body: clientConfirmBody,
          from_name: 'Trancoso Resolve',
        }));
      }

      // Email para o prestador
      const providerEmail = provider?.email || provider?.created_by;
      if (providerEmail) {
        const providerConfirmBody = `
Olá, ${providerFirstName}! ✅

Você confirmou um agendamento no Trancoso Resolve. Abaixo estão os detalhes:

━━━━━━━━━━━━━━━━━━━━━━━━━
📋 AGENDAMENTO CONFIRMADO
━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Cliente: ${request.client_name}
📱 Telefone: ${request.client_phone}
🔧 Serviço: ${serviceTitle}
📅 Data: ${dateFormatted}
🕐 Horário: ${timeFormatted}
${request.location?.address ? `📍 Local: ${request.location.address}${request.location.number ? ', ' + request.location.number : ''}` : ''}
${request.location?.reference ? `🗺️ Referência: ${request.location.reference}` : ''}
${request.message ? `💬 Obs. do cliente: "${request.message}"` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━

Acesse sua agenda: https://www.trancosoresolve.com.br/MinhaAgenda

Equipe Trancoso Resolve 🌊
        `.trim();

        emails.push(base44.asServiceRole.integrations.Core.SendEmail({
          to: providerEmail,
          subject: `📅 Agendamento confirmado — ${request.client_name} em ${dateFormatted}`,
          body: providerConfirmBody,
          from_name: 'Trancoso Resolve',
        }));
      }

      await Promise.all(emails);
      console.log(`Emails de confirmação enviados. Cliente: ${request.client_email}, Prestador: ${providerEmail}`);
    }

    return Response.json({ ok: true });

  } catch (error) {
    console.error('Erro em notifyBookingConfirmation:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});