/**
 * metaCAPI — Envia eventos para a Meta Conversions API (server-side)
 *
 * CONFIGURAÇÃO OBRIGATÓRIA:
 * Adicione no painel Base44 → Settings → Environment Variables:
 *   META_CAPI_TOKEN = <seu Access Token gerado no Meta Business Suite>
 *
 * Como gerar o token:
 * Meta Business Suite → Events Manager → seu Pixel (1469130194903035)
 *   → Configurações → API de Conversões → Gerar Token de Acesso
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PIXEL_ID = '1469130194903035';
const CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

Deno.serve(async (req) => {
  try {
    const token = Deno.env.get('META_CAPI_TOKEN');
    if (!token) {
      // Sem token configurado — retorna 200 para não quebrar o frontend
      console.warn('[metaCAPI] META_CAPI_TOKEN não configurado. Configure em Base44 → Settings → Environment Variables.');
      return Response.json({ ok: false, reason: 'META_CAPI_TOKEN not set' });
    }

    const body = await req.json();
    const {
      event_name,
      event_id,
      event_source_url,
      custom_data = {},
      user_data = {},
    } = body;

    if (!event_name) {
      return Response.json({ error: 'event_name required' }, { status: 400 });
    }

    const event_time = Math.floor(Date.now() / 1000);

    // Monta user_data — inclui apenas campos presentes
    const ud = {
      client_ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || '',
      client_user_agent: req.headers.get('user-agent') || '',
    };
    if (user_data.fbc) ud.fbc = user_data.fbc;
    if (user_data.fbp) ud.fbp = user_data.fbp;
    if (user_data.em) ud.em = user_data.em;   // email já hasheado SHA256
    if (user_data.ph) ud.ph = user_data.ph;   // telefone já hasheado SHA256

    const payload = {
      data: [{
        event_name,
        event_time,
        event_id: event_id || crypto.randomUUID(),
        action_source: 'website',
        event_source_url: event_source_url || '',
        user_data: ud,
        custom_data: {
          ...custom_data,
          // city para segmentação de anúncios por cidade
          city: custom_data.city || '',
        },
      }],
    };

    const res = await fetch(`${CAPI_URL}?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('[metaCAPI] Erro da API Meta:', JSON.stringify(result));
    } else {
      console.log(`[metaCAPI] Evento "${event_name}" enviado. events_received: ${result.events_received}`);
    }

    return Response.json({ ok: res.ok, result });
  } catch (error) {
    console.error('[metaCAPI] Erro interno:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});