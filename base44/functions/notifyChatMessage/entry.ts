import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Notificação por e-mail de nova mensagem no chat.
 * Chamada por automação ao criar um ChatMessage.
 * Envia e-mail ao destinatário da mensagem.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { data } = payload;

    if (!data) {
      console.log('No data in payload');
      return Response.json({ ok: true, note: 'no data' });
    }

    const message = data;
    const { conversation_id, sender_name, sender_role, content } = message;

    if (!conversation_id || !content) {
      return Response.json({ ok: true, note: 'missing fields' });
    }

    // Busca a conversa
    const conversations = await base44.asServiceRole.entities.ChatConversation.filter({ id: conversation_id });
    const conv = conversations?.[0];
    if (!conv) {
      console.log('Conversation not found:', conversation_id);
      return Response.json({ ok: true, note: 'conversation not found' });
    }

    // Destinatário: quem não é o remetente
    const isClientSending = sender_role === 'client';
    const recipientEmail = isClientSending ? null : conv.client_email;
    const recipientName = isClientSending ? conv.client_name : conv.provider_name;
    const senderDisplayName = sender_name || (isClientSending ? conv.client_name : conv.provider_name);

    // Para prestador, buscamos o email via ServiceProvider
    let providerEmail = null;
    if (isClientSending) {
      const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ id: conv.provider_id });
      const provider = providers?.[0];
      providerEmail = provider?.email;
    }

    const toEmail = isClientSending ? providerEmail : recipientEmail;

    if (!toEmail) {
      console.log('No recipient email found');
      return Response.json({ ok: true, note: 'no recipient email' });
    }

    // Trecho da mensagem (máx 120 chars)
    const preview = content.length > 120 ? content.substring(0, 120) + '...' : content;

    const appUrl = 'https://trancosoresolve.base44.app/Chat';
    const convUrl = `${appUrl}?conv=${conversation_id}`;

    const emailBody = `
Olá, ${recipientName?.split(' ')[0] || 'você'}! 💬

Você recebeu uma nova mensagem no Trancoso Resolve.

━━━━━━━━━━━━━━━━━━━━━━━━━
✉️ NOVA MENSAGEM
━━━━━━━━━━━━━━━━━━━━━━━━━

👤 De: ${senderDisplayName}
${conv.service_title ? `📋 Serviço: ${conv.service_title}` : ''}

💬 "${preview}"

━━━━━━━━━━━━━━━━━━━━━━━━━

Clique no link abaixo para responder diretamente no chat da plataforma:
👉 ${convUrl}

Acesse pelo app e responda com segurança dentro da plataforma.

Um abraço,
Equipe Trancoso Resolve 🌴
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: toEmail,
      subject: `💬 Nova mensagem de ${senderDisplayName} — Trancoso Resolve`,
      body: emailBody,
      from_name: 'Trancoso Resolve'
    });

    console.log(`E-mail de chat enviado para ${toEmail} — mensagem de ${senderDisplayName}`);
    return Response.json({ ok: true, sent_to: toEmail });

  } catch (error) {
    console.error('Erro ao notificar mensagem de chat:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});