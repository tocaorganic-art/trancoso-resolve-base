type WhatsAppResult = { success: boolean; message_id?: string; error?: string };
type QueueItem = { run: () => Promise<WhatsAppResult>; resolve: (value: WhatsAppResult) => void };

const queue: QueueItem[] = [];
let processing = false;
const PHONE_PATTERN = /^\+55\d{10,11}$/;
const TEMPLATE_PATTERN = /^[a-z0-9_]{3,80}$/;

function normalizePhone(value: unknown): string {
  return typeof value === 'string' ? value.replace(/[\s()-]/g, '') : '';
}

function enqueue(run: () => Promise<WhatsAppResult>): Promise<WhatsAppResult> {
  return new Promise((resolve) => {
    queue.push({ run, resolve });
    void drainQueue();
  });
}

async function drainQueue(): Promise<void> {
  if (processing) return;
  processing = true;
  try {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) continue;
      try {
        item.resolve(await item.run());
      } catch (error) {
        item.resolve({ success: false, error: error instanceof Error ? error.message : 'send_failed' });
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  } finally {
    processing = false;
  }
}

async function sendTemplate(to: string, templateName: string, parameters: string[]): Promise<WhatsAppResult> {
  const token = Deno.env.get('WHATSAPP_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneNumberId) return { success: false, error: 'WhatsApp environment is not configured' };

  const components = parameters.length > 0
    ? [{ type: 'body', parameters: parameters.map((text) => ({ type: 'text', text })) }]
    : undefined;
  const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.slice(1),
      type: 'template',
      template: { name: templateName, language: { code: 'pt_BR' }, ...(components ? { components } : {}) },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { success: false, error: data?.error?.message || `Meta HTTP ${response.status}` };
  return { success: true, message_id: data?.messages?.[0]?.id };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const { destinatario, template_name: templateName, parametros = [] } = await req.json();
    const phone = normalizePhone(destinatario);
    if (!PHONE_PATTERN.test(phone)) return Response.json({ success: false, error: 'Telefone inválido; use +55...' }, { status: 400 });
    if (typeof templateName !== 'string' || !TEMPLATE_PATTERN.test(templateName)) {
      return Response.json({ success: false, error: 'template_name inválido' }, { status: 400 });
    }
    if (!Array.isArray(parametros) || parametros.some((value) => typeof value !== 'string' || value.length > 1024)) {
      return Response.json({ success: false, error: 'parametros deve ser um array de strings' }, { status: 400 });
    }

    const result = await enqueue(() => sendTemplate(phone, templateName, parametros));
    return Response.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error('[enviarWhatsApp]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
});
