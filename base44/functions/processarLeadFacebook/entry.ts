import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PHONE_PATTERN = /^\+55\d{10,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength) : '';
}

function normalizePhone(value: unknown): string {
  const digits = clean(value, 32).replace(/\D/g, '');
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  return local.length === 10 || local.length === 11 ? `+55${local}` : '';
}

function fieldValue(fields: Record<string, unknown>, ...names: string[]): string {
  for (const name of names) {
    const value = fields[name];
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  }
  return '';
}

function readFields(payload: Record<string, unknown>): Record<string, unknown> {
  const fieldData = payload.field_data || (payload.leadgen as Record<string, unknown>)?.field_data;
  if (!Array.isArray(fieldData)) return (payload.fields as Record<string, unknown>) || {};
  return Object.fromEntries(fieldData.map((field: Record<string, unknown>) => {
    const names = Array.isArray(field.values) ? field.values : [];
    return [String(field.name || ''), names[0] || ''];
  }));
}

function webhookLeadValue(payload: Record<string, unknown>): Record<string, unknown> {
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  for (const entry of entries) {
    const changes = Array.isArray((entry as Record<string, unknown>).changes)
      ? (entry as Record<string, unknown>).changes as Array<Record<string, unknown>>
      : [];
    const leadChange = changes.find((change) => change.field === 'leadgen');
    if (leadChange?.value && typeof leadChange.value === 'object') return leadChange.value as Record<string, unknown>;
  }
  return payload;
}

async function loadLeadData(payload: Record<string, unknown>): Promise<{ fields: Record<string, unknown>; leadgenId: string; unavailable: boolean }> {
  const value = webhookLeadValue(payload);
  const leadgenId = clean(value.leadgen_id || payload.leadgen_id, 120);
  const directFields = readFields(value);
  if (Object.keys(directFields).length > 0 || !leadgenId) return { fields: directFields, leadgenId, unavailable: false };

  const pageToken = Deno.env.get('FB_PAGE_ACCESS_TOKEN');
  if (!pageToken) return { fields: {}, leadgenId, unavailable: true };
  const url = new URL(`https://graph.facebook.com/v18.0/${encodeURIComponent(leadgenId)}`);
  url.searchParams.set('fields', 'field_data');
  url.searchParams.set('access_token', pageToken);
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('[processarLeadFacebook] Graph não retornou field_data', response.status);
    return { fields: {}, leadgenId, unavailable: true };
  }
  return { fields: readFields(data as Record<string, unknown>), leadgenId, unavailable: false };
}

function hasConsent(fields: Record<string, unknown>, payload: Record<string, unknown>): boolean {
  if (payload.consent === true) return true;
  const value = fieldValue(fields, 'consent', 'lgpd', 'privacy', 'autorizacao');
  return ['true', 'sim', 'yes', 'concordo', 'aceito'].includes(value.toLowerCase());
}

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
    const payload = JSON.parse(new TextDecoder().decode(rawBody)) as Record<string, unknown>;
    const leadData = await loadLeadData(payload);
    if (leadData.unavailable) return Response.json({ accepted: false, reason: 'lead_data_unavailable' }, { status: 503 });
    const fields = leadData.fields;
    if (!hasConsent(fields, payload)) {
      console.warn('[processarLeadFacebook] lead rejeitado: consentimento ausente');
      return Response.json({ accepted: false, reason: 'consent_required' }, { status: 202 });
    }

    const name = clean(fieldValue(fields, 'full_name', 'name', 'nome'), 120);
    const phone = normalizePhone(fieldValue(fields, 'phone_number', 'phone', 'telefone', 'whatsapp'));
    const email = clean(fieldValue(fields, 'email', 'e-mail'), 254).toLowerCase();
    const serviceInterest = clean(fieldValue(fields, 'service_interest', 'servico', 'serviço', 'interesse'), 120);
    const location = clean(fieldValue(fields, 'location', 'localidade', 'cidade', 'bairro'), 120);
    if (name.length < 2 || !PHONE_PATTERN.test(phone) || (email && !EMAIL_PATTERN.test(email))) {
      return Response.json({ error: 'Lead fields invalid' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    // Idempotência: a Meta pode reentregar o mesmo leadgen (delivery at-least-once).
    const prior = await base44.asServiceRole.entities.Lead.filter({ phone, source: 'facebook' }, '-created_date', 10);
    const priorHit = (prior || []).find((entry) =>
      typeof entry.notes === 'string' && entry.notes.includes(`leadgen_id:${leadData.leadgenId}`));
    if (priorHit) {
      return Response.json({ accepted: true, duplicate: true, lead_id: priorHit.id }, { status: 200 });
    }

    const lead = await base44.asServiceRole.entities.Lead.create({
      name,
      phone,
      email: email || undefined,
      service_interest: serviceInterest || undefined,
      location: location || undefined,
      source: 'facebook',
      status: 'novo',
      score: 0,
      consent: true,
      consent_at: new Date().toISOString(),
      notes: `leadgen_id:${leadData.leadgenId}`,
    });

    await base44.asServiceRole.entities.LeadConversa.create({
      lead_id: lead.id,
      canal: 'messenger',
      direcao: 'entrada',
      conteudo: 'Lead Ads recebido com consentimento',
      status_entrega: 'entregue',
      enviado_em: new Date().toISOString(),
    });

    const internalSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
    await base44.asServiceRole.functions.invoke('calcularLeadScore', {
      lead_id: lead.id,
      ...(internalSecret ? { internal_secret: internalSecret } : {}),
    }).catch((error: unknown) => {
      console.error('[processarLeadFacebook] score não calculado', error instanceof Error ? error.message : 'unknown_error');
    });
    await base44.asServiceRole.functions.invoke('enviarWhatsApp', {
      destinatario: phone,
      template_name: 'trc_bem_vindo_lead',
      parametros: [name],
      ...(internalSecret ? { internal_secret: internalSecret } : {}),
    }).catch((error: unknown) => {
      console.error('[processarLeadFacebook] WhatsApp não enviado', error instanceof Error ? error.message : 'unknown_error');
    });

    return Response.json({ accepted: true, lead_id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('[processarLeadFacebook]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Invalid lead webhook' }, { status: 400 });
  }
});
