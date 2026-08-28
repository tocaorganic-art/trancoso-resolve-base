/**
 * sendCapiEvent — Conversions API (CAPI) do Meta / Facebook
 *
 * Envia eventos server-side para o Meta Business, complementando (e deduplicando)
 * os eventos client-side do Pixel. Chamado internamente por outras functions.
 *
 * Regras:
 * - NUNCA expor tokens ou dados PII no response.
 * - Sem hashed_email, sem hashed_phone (por padrão) — apenas dados agregados de negócio.
 * - event_id deve ser o mesmo enviado pelo Pixel client-side para deduplicação.
 * - Se META_CONVERSIONS_API_TOKEN não estiver configurado, falha silenciosamente (analytics não bloqueia fluxo).
 *
 * Secrets necessários:
 *   META_CONVERSIONS_API_TOKEN — token de acesso da API de Conversões do Meta
 *   (FB_PIXEL_ID embutido no código — não é segredo)
 *
 * Chamada típica (de dentro de outra function):
 *   await sendCapiEvent(base44, 'Subscribe', { value: 19.90, currency: 'BRL' }, eventId);
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FB_PIXEL_ID = '1469130194903035';
const CAPI_ENDPOINT = `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events`;

/**
 * Envia um evento CAPI ao Meta.
 * @param eventName Nome do evento (Subscribe, FounderBadgeGranted, etc.)
 * @param customData Dados customizados sem PII
 * @param eventId UUID do evento (mesmo enviado pelo Pixel client-side)
 * @param sourceUrl URL de origem (opcional)
 */
export async function sendCapiEventInternal(
  eventName: string,
  customData: Record<string, unknown> = {},
  eventId?: string,
  sourceUrl?: string,
): Promise<{ ok: boolean; error?: string }> {
  const accessToken = Deno.env.get('META_CONVERSIONS_API_TOKEN');
  if (!accessToken) {
    // Secret não configurado — analytics é opcional, não bloqueia fluxo
    console.warn('[capi] META_CONVERSIONS_API_TOKEN não configurado — evento não enviado:', eventName);
    return { ok: false, error: 'META_CONVERSIONS_API_TOKEN_NOT_SET' };
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: now,
        event_id: eventId || crypto.randomUUID(),
        event_source_url: sourceUrl || 'https://trancosoresolve.com.br',
        action_source: 'website',
        custom_data: customData,
      },
    ],
    test_event_code: Deno.env.get('FB_TEST_EVENT_CODE') || undefined,
  };

  try {
    const resp = await fetch(`${CAPI_ENDPOINT}?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const body = await resp.text();
      // Nunca logar o token — apenas o código de erro
      console.error(`[capi] HTTP ${resp.status} ao enviar ${eventName}:`, body.slice(0, 200));
      return { ok: false, error: `HTTP_${resp.status}` };
    }

    console.log(`[capi] Evento enviado com sucesso: ${eventName}`);
    return { ok: true };
  } catch (err) {
    console.error(`[capi] Erro de rede ao enviar ${eventName}:`, (err as Error).message);
    return { ok: false, error: 'NETWORK_ERROR' };
  }
}

// ─── Handler HTTP (chamada direta via API — apenas admin) ─────────────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  }

  let base44;
  try {
    base44 = createClientFromRequest(req);
  } catch {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { event_name, custom_data, event_id, source_url } = body as {
    event_name?: string;
    custom_data?: Record<string, unknown>;
    event_id?: string;
    source_url?: string;
  };

  if (!event_name || typeof event_name !== 'string') {
    return Response.json({ error: 'event_name_required' }, { status: 400 });
  }

  const result = await sendCapiEventInternal(event_name, custom_data ?? {}, event_id, source_url);
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
