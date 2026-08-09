import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Envio de mensagens via WhatsApp Business Cloud API (WABA — Meta oficial).
// Secrets necessários (painel Base44):
//   token-id-whatsapp        — token do System User da Meta (permanente)
//   phone-number-id-whatsapp — Phone Number ID do número no WhatsApp Manager
//
// Parâmetros:
//   telefone        — número E.164 (ex: +5573998283579)
//   mensagem        — texto livre (usado quando usar_template=false)
//   tipo            — categoria do log (ex: "boas_vindas", "notificacao")
//   usar_template   — (opcional, default false) se true, envia template (use template_name p/ escolher qual)
//   template_name   — (opcional) nome do template a enviar (default: boas_vindas_cliente)
//   prestador_id, referencia_id, referencia_tipo — metadados opcionais do log

const TEMPLATE_LANGUAGE = 'pt_BR';
const DEFAULT_TEMPLATE = 'boas_vindas_cliente';

async function enviarViaWABA(
  telefone: string,
  mensagem: string,
  usarTemplate: boolean,
  templateName?: string
): Promise<{ message_id?: string; erro?: string }> {
  const token = Deno.env.get('token-id-whatsapp');
  const phoneId = Deno.env.get('phone-number-id-whatsapp');

  if (!token || !phoneId) {
    return { erro: 'token-id-whatsapp ou phone-number-id-whatsapp não configurados' };
  }

  // Número em formato E.164 sem o +
  const to = telefone.replace(/\D/g, '');

  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

  const tmpl = templateName || DEFAULT_TEMPLATE;
  const body = usarTemplate
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: tmpl,
          language: { code: TEMPLATE_LANGUAGE },
        },
      }
    : {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { preview_url: false, body: mensagem },
      };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
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
      usar_template = false,
      template_name,
    } = await req.json();

    if (!telefone || !tipo) {
      return Response.json(
        { error: 'Campos obrigatórios: telefone, tipo' },
        { status: 400 }
      );
    }
    if (!usar_template && !mensagem) {
      return Response.json(
        { error: 'mensagem é obrigatória quando usar_template=false' },
        { status: 400 }
      );
    }

    // Normaliza para E.164 brasileiro se necessário
    let tel = telefone.replace(/\D/g, '');
    if (!tel.startsWith('55') && tel.length <= 11) tel = `55${tel}`;
    const telE164 = `+${tel}`;

    const resultado = await enviarViaWABA(telE164, mensagem || '', usar_template, template_name);
    const tmplUsado = usar_template ? (template_name || DEFAULT_TEMPLATE) : null;

    const status = resultado.erro ? 'falhou' : 'enviado';

    // Persiste log (service role para contornar RLS)
    const logEntry = await base44.asServiceRole.entities.LogWhatsApp.create({
      prestador_id: prestador_id || null,
      tipo,
      telefone: telE164,
      mensagem: usar_template ? `[template:${tmplUsado}]` : mensagem,
      status,
      message_id: resultado.message_id || null,
      erro: resultado.erro || null,
      timestamp: new Date().toISOString(),
      referencia_id: referencia_id || null,
      referencia_tipo: referencia_tipo || null,
    });

    console.log(
      `[enviarMensagemWhatsApp] status=${status} tipo=${tipo} template=${usar_template ? tmplUsado : 'n/a'} tel=${telE164} log=${logEntry?.id}`
    );

    if (resultado.erro) {
      return Response.json(
        { success: false, error: resultado.erro, log_id: logEntry?.id },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      message_id: resultado.message_id,
      log_id: logEntry?.id,
      template_used: usar_template,
      template_name: tmplUsado,
    });
  } catch (err) {
    console.error('[enviarMensagemWhatsApp] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});