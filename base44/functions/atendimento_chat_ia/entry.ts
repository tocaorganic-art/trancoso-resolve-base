import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CODE_VERSION = 'v1.0.0';

// ---------------------------------------------------------------------------
// TrIA System Prompt — Chat in-platform
// Retorna JSON estruturado para decisão de escalonamento
// ---------------------------------------------------------------------------
const TRIA_SYSTEM_PROMPT = `
Você é a Toca TrIA, assistente oficial da Trancoso Resolve — plataforma que conecta moradores, turistas e empresários com prestadores verificados na Costa do Descobrimento (Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva, Cumuruxatiba e região).

REGRAS CRÍTICAS:
1. NUNCA invente preços, prazos ou disponibilidade — direcione para o prestador ou suporte
2. NUNCA revele dados de outros usuários
3. Casos de pagamento, disputa, bloqueio → encaminhe para suporte@trancosoresolve.com.br
4. SEMPRE ofereça próximo passo claro

PLANOS (resumo):
- Lançamento: R$29,90/mês — 10 serviços/mês, taxa 25%
- Regular: R$49,90/mês — ilimitado, taxa 20%
- Empresas: R$89,90/mês — ilimitado, suporte prioritário, taxa 15%

FLUXO CLIENTE:
- Busca de serviço → colete: tipo, cidade, quando, urgência → direcione para https://trancosoresolve.com.br/servicos/{categoria}-{cidade}
- Dúvidas da plataforma → responda com base nos planos e políticas acima

FLUXO PRESTADOR:
- Cadastro → https://trancosoresolve.com.br/SejaPrestador
- Verificação rejeitada → NUNCA revele o motivo. Use: "⚠️ Seu cadastro não foi aceito. Para dúvidas: suporte@trancosoresolve.com.br"

ESCALONAMENTO — escalate: true APENAS quando:
- Cliente relata problema técnico grave (erro na plataforma, pagamento com defeito, conta bloqueada)
- Cliente quer falar com humano explicitamente ("quero falar com alguém", "me passa um contato")
- Situação de conflito entre cliente e prestador
- Dúvida que requer acesso a dados internos específicos da conta do usuário

Para TODO o resto, tente resolver diretamente com escalate: false.

RESPONDA SEMPRE em JSON válido (sem markdown, sem \`\`\`):
{
  "escalate": false,
  "response": "Texto da resposta para o cliente",
  "reason": ""
}

Ou se escalando:
{
  "escalate": true,
  "response": "Entendido! Vou chamar um especialista para te ajudar. Pode levar alguns minutos. 🌴",
  "reason": "Descrição técnica do motivo de escalonamento"
}
`.trim();

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // --- Autenticação ---
    const expectedSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-automation-secret') || body.internal_secret;
    const isInternal = Boolean(expectedSecret && providedSecret === expectedSecret);

    if (!isInternal) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    const { data: message } = body;
    if (!message) {
      return Response.json({ error: 'Payload inválido: data ausente' }, { status: 400 });
    }

    const { conversation_id, sender_role, content, sender_name, sender_email } = message;

    // Só processa mensagens do cliente
    if (sender_role !== 'client') {
      return Response.json({ ok: true, skipped: 'not a client message' });
    }

    if (!conversation_id || !content) {
      return Response.json({ error: 'conversation_id e content são obrigatórios' }, { status: 400 });
    }

    console.log(`[atendimento_chat_ia] Processando mensagem de ${sender_email || sender_name} na conversa ${conversation_id}`);

    // --- Carregar conversa e histórico ---
    let convData: any = null;
    let history = '';
    try {
      const convs = await base44.asServiceRole.entities.ChatConversation.filter({ id: conversation_id });
      convData = convs?.[0] || null;

      const msgs = await base44.asServiceRole.entities.ChatMessage.filter(
        { conversation_id },
        'created_date',
        12
      );
      if (msgs && msgs.length > 0) {
        history = msgs
          .map((m: any) => `${m.sender_role === 'client' ? 'Cliente' : 'Assistente'}: ${m.content}`)
          .join('\n');
      }
    } catch (e) {
      console.warn('[atendimento_chat_ia] Erro ao carregar histórico:', (e as Error).message);
    }

    // --- Construir prompt ---
    const fullPrompt = `${TRIA_SYSTEM_PROMPT}

---
CONTEXTO DA CONVERSA:
${convData?.subject ? `Assunto: ${convData.subject}` : ''}
${convData?.service_title ? `Serviço: ${convData.service_title}` : ''}

HISTÓRICO (mais antigo ao mais recente):
${history || '(início de conversa)'}

Cliente: ${content}
---
Responda em JSON conforme as instruções.`;

    // --- Chamar TrIA via InvokeLLM ---
    let escalate = false;
    let aiResponse = '';
    let escalationReason = '';

    try {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt: fullPrompt });
      const raw = typeof result === 'string' ? result.trim()
        : (result?.response || result?.text || result?.message || '').trim();

      // Parse JSON
      const parsed = JSON.parse(raw);
      escalate = Boolean(parsed.escalate);
      aiResponse = parsed.response || '';
      escalationReason = parsed.reason || '';

      if (!aiResponse) throw new Error('Resposta vazia do LLM');
      console.log(`[atendimento_chat_ia] TrIA: escalate=${escalate}, chars=${aiResponse.length}`);
    } catch (e) {
      console.error('[atendimento_chat_ia] Erro InvokeLLM:', (e as Error).message);
      // Fallback: escalonar para garantir atendimento
      escalate = true;
      aiResponse = 'Recebi sua mensagem! 🌴 Um especialista vai te ajudar em breve. Pode ser até alguns minutos.';
      escalationReason = 'Erro interno ao processar com IA';
    }

    // --- Postar resposta no chat ---
    const recipientEmail = sender_email || convData?.client_email || '';
    try {
      await base44.asServiceRole.entities.ChatMessage.create({
        conversation_id,
        sender_email: 'tria@trancosoresolve.com.br',
        recipient_email: recipientEmail,
        sender_name: 'Toca TrIA',
        sender_role: 'provider',
        content: aiResponse,
        read: false,
      });

      // Atualizar last_message_at da conversa
      await base44.asServiceRole.entities.ChatConversation.update(conversation_id, {
        last_message_at: new Date().toISOString(),
      }).catch(() => null);
    } catch (e) {
      console.error('[atendimento_chat_ia] Erro ao criar ChatMessage de resposta:', (e as Error).message);
    }

    // --- Criar SupportTicket se escalando ---
    if (escalate) {
      try {
        await base44.asServiceRole.entities.SupportTicket.create({
          conversation_id,
          client_name: sender_name || convData?.client_name || 'Cliente',
          client_email: recipientEmail,
          message: content,
          history,
          status: 'aberto',
          escalation_reason: escalationReason,
          service_title: convData?.service_title || '',
        });
        console.log(`[atendimento_chat_ia] SupportTicket criado para conversa ${conversation_id}`);
      } catch (e) {
        console.error('[atendimento_chat_ia] Erro ao criar SupportTicket:', (e as Error).message);
      }
    }

    return Response.json({
      ok: true,
      escalated: escalate,
      code_version: CODE_VERSION,
    });

  } catch (err) {
    console.error('[atendimento_chat_ia] Erro geral:', (err as Error).message);
    return Response.json(
      { error: (err as Error).message, code_version: CODE_VERSION },
      { status: 500 }
    );
  }
});
