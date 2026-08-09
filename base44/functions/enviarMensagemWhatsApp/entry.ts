import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Envio de mensagens via WhatsApp Business Cloud API (WABA — Meta oficial).
// Secrets necessários (configurar no painel Base44):
//   token-id-whatsapp       — token do System User da Meta (permanente)
//   phone-number-id-whatsapp — Phone Number ID do número no WhatsApp Manager

async function enviarViaWABA(telefone: string, mensagem: string): Promise<{ message_id?: string; erro?: string }> {
  const token = Deno.env.get('token-id-whatsapp');
  const phoneId = Deno.env.get('phone-number-id-whatsapp');

  if (!token || !phoneId) {
    return { erro: 'token-id-whatsapp ou phone-number-id-whatsapp não configurados' };
  }

  // Número em formato E.164 sem o +
  const to = telefone.replace(/\D/g, '');

  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body: mensagem },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { erro: data?.error?.message || `HTTP ${res.status}` };
  }
  return { message_id: data?.messages?.[0]?.id };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Aceita chamadas de service role (webhooks internos) ou admin autenticado
    let caller: string | null = null;
    try {
      const user = await base44.auth.me();
      caller = user?.email || null;
    } catch {
      // chamada interna (service role) — sem user
    }

    const {
      prestador_id,
      tipo,
      telefone,
      mensagem,
      referencia_id,
      referencia_tipo,
    } = await req.json();

    if (!telefone || !mensagem || !tipo) {
      return Response.json({ error: 'Campos obrigatórios: telefone, mensagem, tipo' }, { status: 400 });
    }

    // Normaliza para E.164 brasileiro se necessário
    let tel = telefone.replace(/\D/g, '');
    if (!tel.startsWith('55') && tel.length <= 11) tel = `55${tel}`;
    const telE164 = `+${tel}`;

    const resultado = await enviarViaWABA(telE164, mensagem);

    const status = resultado.erro ? 'falhou' : 'enviado';

    // Persiste log (service role para contornar RLS)
    const logEntry = await base44.asServiceRole.entities.LogWhatsApp.create({
      prestador_id: prestador_id || null,
      tipo,
      telefone: telE164,
      mensagem,
      status,
      message_id: resultado.message_id || null,
      erro: resultado.erro || null,
      timestamp: new Date().toISOString(),
      referencia_id: referencia_id || null,
      referencia_tipo: referencia_tipo || null,
    });

    console.log(`[enviarMensagemWhatsApp] status=${status} tipo=${tipo} tel=${telE164} log=${logEntry?.id}`);

    if (resultado.erro) {
      return Response.json({ success: false, error: resultado.erro, log_id: logEntry?.id }, { status: 502 });
    }

    return Response.json({ success: true, message_id: resultado.message_id, log_id: logEntry?.id });

  } catch (err) {
    console.error('[enviarMensagemWhatsApp] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});