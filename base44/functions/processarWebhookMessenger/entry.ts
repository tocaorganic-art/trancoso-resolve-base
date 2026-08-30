import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getAutomationReply } from '../_shared/automationResponses.js';

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function validSignature(rawBody: Uint8Array, signature: string | null): Promise<boolean> {
  const secret = Deno.env.get('FB_APP_SECRET');
  if (!secret || !signature?.startsWith('sha256=')) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, rawBody));
  const received = signature.slice(7);
  return expected.length === received.length && [...expected].every((char, index) => char === received[index]);
}

type Canal = 'messenger' | 'instagram';

async function sendMessage(recipientId: string, message: string, canal: Canal): Promise<{ message_id?: string; error?: string }> {
  const token = canal === 'instagram' ? Deno.env.get('INSTAGRAM_ACCESS_TOKEN') : Deno.env.get('FB_PAGE_ACCESS_TOKEN');
  if (!token) return { error: canal === 'instagram' ? 'INSTAGRAM_ACCESS_TOKEN não configurado' : 'FB_PAGE_ACCESS_TOKEN não configurado' };
  const url = new URL(canal === 'instagram'
    ? 'https://graph.instagram.com/v25.0/me/messages'
    : 'https://graph.facebook.com/v18.0/me/messages');
  url.searchParams.set('access_token', token);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } }),
  });
  const data = await response.json().catch(() => ({}));
  return response.ok ? { message_id: data?.message_id } : { error: data?.error?.message || `Meta HTTP ${response.status}` };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const verifyToken = Deno.env.get('FB_VERIFY_TOKEN');
    if (url.searchParams.get('hub.mode') !== 'subscribe' || !verifyToken || url.searchParams.get('hub.verify_token') !== verifyToken) {
      return new Response('Forbidden', { status: 403 });
    }
    return new Response(url.searchParams.get('hub.challenge') || '', { status: 200 });
  }
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const rawBody = new Uint8Array(await req.arrayBuffer());
  if (rawBody.byteLength > 1_000_000) return Response.json({ error: 'Payload too large' }, { status: 413 });
  if (!(await validSignature(rawBody, req.headers.get('x-hub-signature-256')))) return Response.json({ error: 'Invalid signature' }, { status: 401 });

  try {
    const payload = JSON.parse(new TextDecoder().decode(rawBody));
    const canal: Canal = payload.object === 'instagram' ? 'instagram' : 'messenger';
    const base44 = createClientFromRequest(req);
    for (const entry of payload.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = typeof event.sender?.id === 'string' ? event.sender.id : '';
        const text = typeof event.message?.text === 'string' ? event.message.text.slice(0, 4000) : '';
        if (!senderId || !text || event.message?.is_echo || senderId === entry.id) continue;
        const messageId = typeof event.message?.mid === 'string' ? event.message.mid : '';
        if (messageId) {
          const seen = await base44.asServiceRole.entities.LeadConversa.filter({ message_id: messageId });
          if (seen?.[0]) continue;
        }
        const responseText = getAutomationReply(text).text;
        await base44.asServiceRole.entities.LeadConversa.create({
          canal,
          direcao: 'entrada',
          conteudo: text,
          status_entrega: 'entregue',
          enviado_em: new Date().toISOString(),
          message_id: messageId || undefined,
          destinatario: senderId,
        });
        const result = await sendMessage(senderId, responseText, canal);
        await base44.asServiceRole.entities.LeadConversa.create({
          canal,
          direcao: 'saida',
          conteudo: responseText,
          status_entrega: result.message_id ? 'enviado' : 'falhou',
          enviado_em: new Date().toISOString(),
          message_id: result.message_id,
          destinatario: senderId,
        });
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error('[processarWebhookMessenger]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
});
