import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SOURCE_VALUES = new Set(['whatsapp', 'facebook', 'site', 'indicacao', 'google']);
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
    });

    return Response.json({ success: true, lead_id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('[createLead]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Unable to create lead' }, { status: 500 });
  }
});
