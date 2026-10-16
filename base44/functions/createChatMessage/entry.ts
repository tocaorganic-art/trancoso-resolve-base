import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Criação de mensagem de chat com validação server-side (painel Base44 16/10/2026).
//
// ANTES: o frontend criava ChatMessage com sender_role/sender_name livres —
// um usuário logado podia forjar mensagens como se fossem da assistente
// oficial (Toca TrIA) ou do prestador na própria conversa, e o histórico
// forjado entrava no prompt do LLM em atendimento_chat_ia ("Assistente:").
//
// AGORA: papel (client/provider), e-mail e nome do remetente são decididos
// pelo servidor a partir da sessão autenticada e da conversa. O payload só
// define conversation_id e content.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const conversation_id = String(body.conversation_id || '').trim();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!conversation_id) {
      return Response.json({ error: 'conversation_id é obrigatório' }, { status: 400 });
    }
    if (!content) {
      return Response.json({ error: 'Conteúdo vazio' }, { status: 400 });
    }
    if (content.length > 2000) {
      return Response.json({ error: 'Mensagem muito longa (máx. 2000 caracteres).' }, { status: 400 });
    }

    // Papel resolvido pelo servidor — nunca confiado no payload.
    const convs = await base44.asServiceRole.entities.ChatConversation.filter({ id: conversation_id });
    const conv = convs?.[0];
    if (!conv) {
      return Response.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    let sender_role: string | null = null;
    if (conv.client_email && conv.client_email === user.email) sender_role = 'client';
    else if (conv.provider_email && conv.provider_email === user.email) sender_role = 'provider';
    else {
      return Response.json({ error: 'Sem permissão nesta conversa.' }, { status: 403 });
    }

    const msg = await base44.asServiceRole.entities.ChatMessage.create({
      conversation_id,
      sender_email: user.email,
      sender_name: (user as any).full_name || user.email,
      sender_role,
      content,
      read: false,
    });

    console.log(`[createChatMessage] mensagem de ${sender_role} gravada na conversa ${conversation_id}`);
    return Response.json({ success: true, message: msg });
  } catch (error) {
    console.error('[createChatMessage] erro:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
