/**
 * DESTINO NO REPO: base44/functions/createLead/entry.ts (ARQUIVO EXISTENTE — substituir por completo)
 *
 * Mesmas mudanças aplicadas a createPublicLead/entry.ts (ver arquivo 05),
 * adaptadas ao formato desta variante (telefone já em +55XXXXXXXXXXX,
 * SOURCE_VALUES sem 'legado'). Ver comentários "[OpenAI Ads]".
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { sendOpenAiCapiEventInternal } from '../sendOpenAiCapiEvent/entry.ts';

const SOURCE_VALUES = new Set(['whatsapp', 'facebook', 'site', 'indicacao', 'google']);
const PHONE_PATTERN = /^\+55\d{10,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UTM_MAX_LENGTH = 200;
const OPPREF_MAX_LENGTH = 500;

function clean(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength) : '';
}

function normalizePhone(value: unknown): string {
  const digits = clean(value, 32).replace(/\D/g, '');
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  return local.length === 10 || local.length === 11 ? `+55${local}` : '';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  try {
    const body = await req.json();
    if (clean(body.website, 200)) return Response.json({ success: true }, { status: 202 });
    if (body.consent !== true) return Response.json({ error: 'Consent is required' }, { status: 400 });

    const name = clean(body.name, 120);
    const phone = normalizePhone(body.phone);
    const email = clean(body.email, 254).toLowerCase();
    const source = clean(body.source, 32) || 'site';
    const serviceInterest = clean(body.service_interest, 120);
    const location = clean(body.location, 120);

    // [OpenAI Ads] Atribuição de campanha — todos os campos são opcionais e sem PII.
    const utmSource = clean(body.utm_source, UTM_MAX_LENGTH);
    const utmMedium = clean(body.utm_medium, UTM_MAX_LENGTH);
    const utmCampaign = clean(body.utm_campaign, UTM_MAX_LENGTH);
    const utmContent = clean(body.utm_content, UTM_MAX_LENGTH);
    const utmTerm = clean(body.utm_term, UTM_MAX_LENGTH);
    const oppref = clean(body.oppref, OPPREF_MAX_LENGTH);

    if (name.length < 2 || !PHONE_PATTERN.test(phone)) {
      return Response.json({ error: 'Invalid name or phone' }, { status: 400 });
    }
    if (email && !EMAIL_PATTERN.test(email)) return Response.json({ error: 'Invalid email' }, { status: 400 });
    if (!SOURCE_VALUES.has(source)) return Response.json({ error: 'Invalid source' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const recent = await base44.asServiceRole.entities.Lead.filter({ phone, source }, '-created_date', 1);
    const latest = recent?.[0];
    if (latest?.created_date && Date.now() - Date.parse(latest.created_date) < 10 * 60 * 1000) {
      return Response.json({ success: true, duplicate: true, lead_id: latest.id });
    }

    const lead = await base44.asServiceRole.entities.Lead.create({
      name,
      phone,
      email: email || undefined,
      service_interest: serviceInterest || undefined,
      location: location || undefined,
      source,
      status: 'novo',
      score: 0,
      consent: true,
      consent_at: new Date().toISOString(),
      notes: clean(body.message, 1000) || undefined,
      // [OpenAI Ads] utm_source/utm_medium/utm_campaign já existem no schema atual;
      // utm_content/utm_term/oppref requerem a atualização de Lead.jsonc.
      ...(utmSource ? { utm_source: utmSource } : {}),
      ...(utmMedium ? { utm_medium: utmMedium } : {}),
      ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
      ...(utmContent ? { utm_content: utmContent } : {}),
      ...(utmTerm ? { utm_term: utmTerm } : {}),
      ...(oppref ? { oppref } : {}),
    });

    // [OpenAI Ads] event_id estável, gerado uma única vez na criação real do lead.
    const eventId = crypto.randomUUID();

    // [OpenAI Ads] Persiste o event_id no próprio Lead, para auditoria/reprocessamento.
    // REQUER que Lead.jsonc tenha o campo "event_id" (ver arquivo 08).
    try {
      await base44.asServiceRole.entities.Lead.update(lead.id, { event_id: eventId });
    } catch (updateError) {
      console.warn(
        '[createLead] falha ao persistir event_id no lead (não crítico):',
        updateError instanceof Error ? updateError.message : 'unknown_error',
      );
    }

    try {
      await sendOpenAiCapiEventInternal(
        'lead_created',
        {
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
        '[createLead] falha ao disparar lead_created (OpenAI CAPI):',
        capiError instanceof Error ? capiError.message : 'unknown_error',
      );
    }

    return Response.json({ success: true, lead_id: lead.id, event_id: eventId }, { status: 201 });
  } catch (error) {
    console.error('[createLead]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Unable to create lead' }, { status: 500 });
  }
});
