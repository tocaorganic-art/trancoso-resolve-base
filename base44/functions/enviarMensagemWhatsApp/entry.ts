import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Suporte a dois provedores: Z-API (padrão) ou WhatsApp Business Cloud API
// Variáveis de ambiente necessárias:
//   WHATSAPP_PROVIDER = "zapi" | "waba"  (padrão: zapi)
//   ZAPI_INSTANCE_ID  — ID da instância Z-API
//   ZAPI_TOKEN        — token Z-API
//   WABA_TOKEN        — token da WhatsApp Business Cloud API
//   WABA_PHONE_ID     — phone number ID (WABA)

async function enviarViaZapi(telefone: string, mensagem: string): Promise<{ message_id?: string; erro?: string }> {
  const instanceId = Deno.env.get('ZAPI_INSTANCE_ID');
  const token = Deno.env.get('ZAPI_TOKEN');

  if (!instanceId || !token) {
    return { erro: 'ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configurados' };
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: telefone, message: mensagem }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { erro: data?.error || `HTTP ${res.status}` };
  }
  return { message_id: data?.messageId || data?.id };
}

async function enviarViaWABA(telefone: string, mensagem: string): Promise<{ message_id?: string; erro?: string }> {
  const token = Deno.env.get('WABA_TOKEN');
  const phoneId = Deno.env.get('WABA_PHONE_ID');

  if (!token || !phoneId) {
    return { erro: 'WABA_TOKEN ou WABA_PHONE_ID não configurados' };
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

    const provider = Deno.env.get('WHATSAPP_PROVIDER') || 'zapi';
    const resultado = provider === 'waba'
      ? await enviarViaWABA(telE164, mensagem)
      : await enviarViaZapi(telE164, mensagem);

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
    console.error('[enviarMensagemWhatsApp] erro:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
