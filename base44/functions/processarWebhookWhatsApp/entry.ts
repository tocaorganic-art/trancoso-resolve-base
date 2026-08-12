import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const GRAPH_VERSION = 'v18.0';
const PHONE_PATTERN = /^\+55\d{10,11}$/;

function normalizeText(value: unknown): string {
  return typeof value === 'string'
    ? value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    : '';
}

function normalizePhone(value: unknown): string {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  return local.length === 10 || local.length === 11 ? `+55${local}` : '';
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function validSignature(rawBody: Uint8Array, signature: string | null): Promise<boolean> {
  const secret = Deno.env.get('FB_APP_SECRET');
  if (!secret || !signature?.startsWith('sha256=')) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, rawBody));
  const received = signature.slice('sha256='.length);
  return expected.length === received.length && [...expected].every((char, index) => char === received[index]);
}

async function sendWhatsApp(to: string, type: 'template' | 'text', payload: Record<string, unknown>): Promise<{ id?: string; error?: string }> {
  const token = Deno.env.get('WHATSAPP_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneNumberId) return { error: 'WhatsApp environment is not configured' };
  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.slice(1), type, [type]: payload }),
  });
  const data = await response.json().catch(() => ({}));
  return response.ok ? { id: data?.messages?.[0]?.id } : { error: data?.error?.message || `Meta HTTP ${response.status}` };
}

function chooseReply(text: string, leadName = ''): { type: 'template' | 'text'; name?: string; body?: string; parameters: string[] } {
  const normalized = normalizeText(text);
  if (normalized.includes('prestador') || normalized.includes('cadastro')) {
    return { type: 'template', name: 'trc_bem_vindo_lead', parameters: [leadName || 'amigo(a)'] };
  }
  if (normalized.includes('preco') || normalized.includes('plano') || normalized.includes('valor')) {
    return {
      type: 'text',
      body: 'Planos Trancoso Resolve\n• Para clientes: encontre serviços locais e solicite atendimento.\n• Para prestadores: confira a apresentação e as condições vigentes no painel oficial.\n\nConsulte informações atualizadas em https://trancosoresolve.com.br/Planos ou fale com nossa equipe.',
      parameters: [],
    };
  }
  return {
    type: 'text',
    body: 'Olá! Recebemos sua mensagem. A equipe Trancoso Resolve vai retornar assim que possível.\n\nQuem resolve, pertinho de você.',
    parameters: [],
  };
}

async function saveConversation(base44: ReturnType<typeof createClientFromRequest>, data: Record<string, unknown>): Promise<void> {
  await base44.asServiceRole.entities.LeadConversa.create(data).catch((error: unknown) => {
    console.error('[processarWebhookWhatsApp] LeadConversa não salva', error instanceof Error ? error.message : 'unknown_error');
  });
}

async function processStatuses(base44: ReturnType<typeof createClientFromRequest>, statuses: Array<Record<string, unknown>>): Promise<void> {
  const statusMap: Record<string, string> = { sent: 'enviado', delivered: 'entregue', read: 'lido', failed: 'falhou' };
  for (const item of statuses) {
    const messageId = typeof item.id === 'string' ? item.id : '';
    const deliveryStatus = typeof item.status === 'string' ? statusMap[item.status] : undefined;
    if (!messageId || !deliveryStatus) continue;
    const conversations = await base44.asServiceRole.entities.LeadConversa.filter({ message_id: messageId });
    await Promise.all((conversations || []).map((conversation: { id: string }) =>
      base44.asServiceRole.entities.LeadConversa.update(conversation.id, { status_entrega: deliveryStatus })));
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    if (url.searchParams.get('hub.verify_token') !== Deno.env.get('FB_VERIFY_TOKEN')) return new Response('Forbidden', { status: 403 });
    return new Response(url.searchParams.get('hub.challenge') || '', { status: 200 });
  }
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const rawBody = new Uint8Array(await req.arrayBuffer());
  if (rawBody.byteLength > 1_000_000) return Response.json({ error: 'Payload too large' }, { status: 413 });
  if (!(await validSignature(rawBody, req.headers.get('x-hub-signature-256')))) return Response.json({ error: 'Invalid signature' }, { status: 401 });

  try {
    const payload = JSON.parse(new TextDecoder().decode(rawBody));
    const base44 = createClientFromRequest(req);
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        await processStatuses(base44, value.statuses || []);
        for (const message of value.messages || []) {
          const phone = normalizePhone(message.from);
          if (!PHONE_PATTERN.test(phone)) continue;
          const text = typeof message.text?.body === 'string' ? message.text.body.slice(0, 4000) : '[mensagem sem texto]';
          const messageId = typeof message.id === 'string' ? message.id : '';
          if (messageId) {
            const seen = await base44.asServiceRole.entities.LeadConversa.filter({ message_id: messageId });
            if (seen?.[0]) continue;
          }
          const leads = await base44.asServiceRole.entities.Lead.filter({ phone }, '-created_date', 1);
          const lead = leads?.[0];
          await saveConversation(base44, {
            lead_id: lead?.id || undefined,
            canal: 'whatsapp',
            direcao: 'entrada',
            conteudo: text,
            status_entrega: 'entregue',
            enviado_em: new Date().toISOString(),
            message_id: message.id || undefined,
            destinatario: phone,
          });

          const reply = chooseReply(text, typeof lead?.name === 'string' ? lead.name : '');
          const templatePayload = reply.type === 'template'
            ? {
                name: reply.name,
                language: { code: 'pt_BR' },
                components: [{ type: 'body', parameters: reply.parameters.map((parameter) => ({ type: 'text', text: parameter })) }],
              }
            : undefined;
          const result = reply.type === 'template'
            ? await sendWhatsApp(phone, 'template', templatePayload || {})
            : await sendWhatsApp(phone, 'text', { preview_url: false, body: reply.body });
          await saveConversation(base44, {
            lead_id: lead?.id || undefined,
            canal: 'whatsapp',
            direcao: 'saida',
            conteudo: reply.type === 'template' ? `template:${reply.name}` : reply.body,
            status_entrega: result.id ? 'enviado' : 'falhou',
            enviado_em: new Date().toISOString(),
            message_id: result.id,
            destinatario: phone,
          });
        }
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error('[processarWebhookWhatsApp]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
});
