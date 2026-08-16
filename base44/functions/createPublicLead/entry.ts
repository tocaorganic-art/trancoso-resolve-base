/**
 * DESTINO NO REPO: base44/functions/createPublicLead/entry.ts (ARQUIVO EXISTENTE — substituir por completo)
 *
 * Mudanças em relação ao original (marcadas com "[OpenAI Ads]"):
 * 1. Aceita utm_source/utm_medium/utm_campaign/utm_content/utm_term/oppref no body (todos opcionais).
 * 2. Persiste esses campos no Lead criado — REQUER que Lead.jsonc tenha sido
 *    atualizado antes (ver arquivo 07-base44-entities-Lead.jsonc.diff.md).
 *    Se o schema ainda não tiver esses campos, o Base44 pode ignorá-los ou
 *    rejeitá-los dependendo da política de validação — aplique o schema
 *    ANTES de fazer deploy desta function.
 * 3. Gera um event_id estável (uma única vez, no momento da criação real do lead).
 * 4. Dispara lead_created via Conversions API da OpenAI Ads (sendOpenAiCapiEvent) —
 *    nunca bloqueia nem falha a resposta ao usuário em caso de erro/ausência de credenciais.
 * 5. Retorna event_id na resposta 201, para o frontend disparar o Pixel com o mesmo id (dedup).
 *
 * Nenhuma outra regra de validação, dedup ou negócio foi alterada.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendOpenAiCapiEventInternal } from '../sendOpenAiCapiEvent/entry.ts';

const ALLOWED_TYPES = new Set(['cliente', 'prestador']);
const PHONE_PATTERN = /^\d{10,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEDUP_WINDOW_MS = 10 * 60 * 1000;
const LEAD_SOURCES = new Set(['whatsapp', 'facebook', 'site', 'indicacao', 'google']);
const UTM_MAX_LENGTH = 200;
const OPPREF_MAX_LENGTH = 500;

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
    : '';
}

function normalizePhone(value: unknown): string {
  return cleanString(value, 32).replace(/\D/g, '').slice(0, 11);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const rawLength = Number(req.headers.get('content-length') || 0);
    if (rawLength > 12_000) {
      return Response.json({ error: 'Payload too large' }, { status: 413 });
    }

    const body = await req.json();

    // Campo invisível preenchido por bots: responde sem persistir dados.
    if (cleanString(body.website, 200)) {
      return Response.json({ success: true }, { status: 202 });
    }

    const name = cleanString(body.name, 120);
    const phone = normalizePhone(body.phone);
    const email = cleanString(body.email, 254).toLowerCase();
    const message = cleanString(body.message, 1000);
    const serviceInterest = cleanString(body.service_interest, 120);
    const location = cleanString(body.location, 120);
    const source = cleanString(body.source, 120) || 'site';
    const type = ALLOWED_TYPES.has(body.type) ? body.type : 'cliente';
    const leadSource = LEAD_SOURCES.has(source) ? source : 'site';

    // [OpenAI Ads] Atribuição de campanha — todos os campos são opcionais e sem PII.
    const utmSource = cleanString(body.utm_source, UTM_MAX_LENGTH);
    const utmMedium = cleanString(body.utm_medium, UTM_MAX_LENGTH);
    const utmCampaign = cleanString(body.utm_campaign, UTM_MAX_LENGTH);
    const utmContent = cleanString(body.utm_content, UTM_MAX_LENGTH);
    const utmTerm = cleanString(body.utm_term, UTM_MAX_LENGTH);
    const oppref = cleanString(body.oppref, OPPREF_MAX_LENGTH);

    if (body.consent !== true) {
      return Response.json({ error: 'Consent is required' }, { status: 400 });
    }
    if (name.length < 2 || !PHONE_PATTERN.test(phone)) {
      return Response.json({ error: 'Invalid name or phone' }, { status: 400 });
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    const internationalPhone = `+55${phone}`;
    const base44 = createClientFromRequest(req);
    const duplicates = await base44.asServiceRole.entities.Lead.filter(
      { phone: internationalPhone, source: leadSource },
      '-created_date',
      1,
    );
    const latest = duplicates?.[0];
    const latestTimestamp = latest?.created_date ? Date.parse(latest.created_date) : 0;

    if (latestTimestamp && Date.now() - latestTimestamp < DEDUP_WINDOW_MS) {
      // Lead duplicado dentro da janela: não é uma nova conversão real,
      // então NÃO disparamos lead_created de novo (evita conversão fantasma).
      return Response.json({ success: true, duplicate: true }, { status: 200 });
    }

    const lead = await base44.asServiceRole.entities.Lead.create({
      name,
      phone: internationalPhone,
      email: email || undefined,
      notes: [message, `tipo:${type}`, source !== leadSource ? `origem:${source}` : ''].filter(Boolean).join(' | ') || undefined,
      service_interest: serviceInterest || undefined,
      location: location || undefined,
      source: leadSource,
      status: 'novo',
      score: 0,
      consent: true,
      consent_at: new Date().toISOString(),
      // [OpenAI Ads] utm_source/utm_medium/utm_campaign já existem no schema atual;
      // utm_content/utm_term/oppref requerem a atualização de Lead.jsonc.
      ...(utmSource ? { utm_source: utmSource } : {}),
      ...(utmMedium ? { utm_medium: utmMedium } : {}),
      ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
      ...(utmContent ? { utm_content: utmContent } : {}),
      ...(utmTerm ? { utm_term: utmTerm } : {}),
      ...(oppref ? { oppref } : {}),
    });

    // [OpenAI Ads] event_id estável, gerado uma única vez no momento da
    // criação real do lead. Nunca gerado no frontend / nunca regenerado em re-render.
    const eventId = crypto.randomUUID();

    // [OpenAI Ads] Persiste o event_id no próprio Lead, para auditoria/reprocessamento
    // (permite conferir depois se o CAPI foi disparado para este lead específico).
    // REQUER que Lead.jsonc tenha o campo "event_id" (ver arquivo 08).
    try {
      await base44.asServiceRole.entities.Lead.update(lead.id, { event_id: eventId });
    } catch (updateError) {
      console.warn(
        '[createPublicLead] falha ao persistir event_id no lead (não crítico):',
        updateError instanceof Error ? updateError.message : 'unknown_error',
      );
    }

    // [OpenAI Ads] Disparo do lead_created via Conversions API — nunca bloqueia
    // nem derruba a resposta ao usuário. Função é segura mesmo sem
    // credenciais/Pixel da OpenAI Ads configurados (no-op com log de aviso).
    try {
      await sendOpenAiCapiEventInternal(
        'lead_created',
        {
          lead_type: type,
          service_interest: serviceInterest || undefined,
          utm_source: utmSource || undefined,
          utm_medium: utmMedium || undefined,
          utm_campaign: utmCampaign || undefined,
        },
        eventId,
        oppref || undefined,
      );
    } catch (capiError) {
      console.warn(
        '[createPublicLead] falha ao disparar lead_created (OpenAI CAPI):',
        capiError instanceof Error ? capiError.message : 'unknown_error',
      );
    }

    return Response.json({ success: true, lead_id: lead.id, event_id: eventId }, { status: 201 });
  } catch (error) {
    console.error('[createPublicLead]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Unable to submit lead' }, { status: 500 });
  }
});
