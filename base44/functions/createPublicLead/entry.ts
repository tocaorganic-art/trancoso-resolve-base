import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_TYPES = new Set(['cliente', 'prestador']);
const PHONE_PATTERN = /^\d{10,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEDUP_WINDOW_MS = 10 * 60 * 1000;
const LEAD_SOURCES = new Set(['whatsapp', 'facebook', 'site', 'indicacao', 'google']);

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
    : '';
}

function normalizePhone(value: unknown): string {
  return cleanString(value, 32).replace(/\D/g, '').slice(0, 11);
}

/**
 * [Concierge VIP] Telefone internacional (ex.: +54 9 11 ...) deve ser
 * preservado como E.164 (10-15 dígitos) em vez de forçar o prefixo +55.
 */
function isInternationalPhone(value: unknown): boolean {
  return typeof value === 'string' && value.trim().startsWith('+');
}

function normalizeInternationalPhone(value: unknown): string {
  return cleanString(value, 32).replace(/\D/g, '').slice(0, 15);
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

    // [Concierge VIP] Campos opcionais, retrocompatíveis: nenhum chamador
    // existente envia category_interest/notes_extra — comportamento inalterado.
    const categoryInterest = cleanString(body.category_interest, 120);
    const notesExtra = cleanString(body.notes_extra, 500);

    if (body.consent !== true) {
      return Response.json({ error: 'Consent is required' }, { status: 400 });
    }
    const international = isInternationalPhone(body.phone);
    const internationalDigits = normalizeInternationalPhone(body.phone);
    const phoneValid = international
      ? /^\d{10,15}$/.test(internationalDigits)
      : PHONE_PATTERN.test(phone);
    if (name.length < 2 || !phoneValid) {
      return Response.json({ error: 'Invalid name or phone' }, { status: 400 });
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    const internationalPhone = international
      ? `+${internationalDigits}`
      : `+55${phone}`;
    const base44 = createClientFromRequest(req);
    const duplicates = await base44.asServiceRole.entities.Lead.filter(
      { phone: internationalPhone, source: leadSource },
      '-created_date',
      1,
    );
    const latest = duplicates?.[0];
    const latestTimestamp = latest?.created_date ? Date.parse(latest.created_date) : 0;

    if (latestTimestamp && Date.now() - latestTimestamp < DEDUP_WINDOW_MS) {
      return Response.json({ success: true, duplicate: true }, { status: 200 });
    }

    const lead = await base44.asServiceRole.entities.Lead.create({
      name,
      phone: internationalPhone,
      email: email || undefined,
      notes: [
        message,
        `tipo:${type}`,
        source !== leadSource ? `origem:${source}` : '',
        notesExtra,
      ].filter(Boolean).join(' | ') || undefined,
      ...(categoryInterest ? { category_interest: categoryInterest } : {}),
      service_interest: serviceInterest || undefined,
      location: location || undefined,
      source: leadSource,
      status: 'novo',
      score: 0,
      consent: true,
      consent_at: new Date().toISOString(),
    });

    return Response.json({ success: true, lead_id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('[createPublicLead]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Unable to submit lead' }, { status: 500 });
  }
});
