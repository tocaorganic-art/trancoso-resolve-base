import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DEFAULT_VERIFY_TOKEN = 'trancoso_resolve_2026';

// Palavras-chave para classificação de intenção (lead vs info)
const LEAD_KEYWORDS = [
  'preço', 'preco', 'serviço', 'servico', 'preciso', 'contratar',
  'diarista', 'eletricista', 'piscineiro', 'pedreiro', 'cozinheiro',
  'chef', 'jardineiro', 'encanador', 'agendar', 'orçamento', 'orcamento',
  'quanto custa', 'valor', 'contrato', 'reformar', 'limpeza', 'cozinhar',
  'piscina', 'jardim',
];

const INFO_KEYWORDS = ['olá', 'ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'informação', 'informacao'];

function classificarIntencao(texto: string): 'lead' | 'info' | 'outro' {
  const lower = texto.toLowerCase();
  if (LEAD_KEYWORDS.some((kw) => lower.includes(kw))) return 'lead';
  if (INFO_KEYWORDS.some((kw) => lower.includes(kw))) return 'info';
  return 'outro';
}

async function enviarRespostaWABA(fromPhone: string, mensagem: string): Promise<void> {
  const token = Deno.env.get('WABA_TOKEN');
  const phoneId = Deno.env.get('WABA_PHONE_ID');
  if (!token || !phoneId) {
    console.warn('[whatsappWebhook] WABA_TOKEN ou WABA_PHONE_ID não configurados — pulando resposta automática');
    return;
  }

  await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: fromPhone,
      type: 'text',
      text: { preview_url: false, body: mensagem },
    }),
  });
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || DEFAULT_VERIFY_TOKEN;

    // GET — verificação do webhook (Meta envia hub.mode, hub.verify_token, hub.challenge)
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === verifyToken) {
        return new Response(challenge || '', { status: 200 });
      }
      console.warn('[whatsappWebhook] verificação falhou:', { mode, token });
      return new Response('Forbidden', { status: 403 });
    }

    // POST — mensagem recebida do WhatsApp
    if (req.method === 'POST') {
      const body = await req.json();
      const base44 = createClientFromRequest(req);

      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      const contact = change?.value?.contacts?.[0];

      // Meta envia status updates também — ignora se não houver mensagem de texto
      if (!message) {
        return Response.json({ status: 'status_update_ignored' }, { status: 200 });
      }

      const fromPhone = message.from;
      const messageText = message.text?.body || '';
      const contactName = contact?.profile?.name || '';
      const messageId = message.id;

      console.log(`[whatsappWebhook] mensagem recebida de +${fromPhone}: "${messageText.substring(0, 80)}"`);

      // Loga mensagem recebida
      await base44.asServiceRole.entities.LogWhatsApp.create({
        tipo: 'recebido',
        telefone: `+${fromPhone}`,
        mensagem: messageText,
        status: 'recebido',
        message_id: messageId,
        timestamp: new Date().toISOString(),
      });

      // Classifica intenção
      const intencao = classificarIntencao(messageText);

      // Cria lead se for uma intenção de contratação
      let leadId: string | null = null;
      if (intencao === 'lead') {
        const lead = await base44.asServiceRole.entities.LeadPreLancamento.create({
          name: contactName || `WhatsApp +${fromPhone}`,
          phone: `+${fromPhone}`,
          message: messageText,
          source: 'whatsapp-webhook',
          type: 'cliente',
        });
        leadId = lead?.id || null;
        console.log(`[whatsappWebhook] lead criado: ${leadId}`);
      }

      // Resposta automática
      const replyText =
        intencao === 'lead'
          ? 'Olá! 👋 Recebi sua mensagem na *Trancoso Resolve*. Já registrei seu pedido e um atendente entrará em contato em breve. Você também pode solicitar serviço diretamente pelo nosso site: https://trancosoresolve.com'
          : intencao === 'info'
            ? 'Olá! Você fala com a *Trancoso Resolve* 🌴\n\nConectamos clientes a profissionais verificados em Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva.\n\nComo podemos ajudar? Acesse https://trancosoresolve.com'
            : 'Olá! Recebemos sua mensagem na *Trancoso Resolve*. Um atendente responderá em breve. Para solicitar um serviço agora, acesse: https://trancosoresolve.com';

      await enviarRespostaWABA(fromPhone, replyText);

      return Response.json({ status: 'processed', intencao, lead_created: leadId !== null }, { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    console.error('[whatsappWebhook] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});