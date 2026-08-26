import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PHONE_PATTERN = /^(?:\+55)?\d{10,11}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function responseUnderOneHour(lead: Record<string, unknown>): boolean {
  const responseValue = lead.responded_at || lead.first_response_at || lead.response_at || lead.replied_at;
  const createdValue = lead.created_at || lead.created_date;
  if (typeof responseValue === 'boolean') return responseValue;
  if (typeof responseValue !== 'string' || typeof createdValue !== 'string') return false;
  const elapsed = Date.parse(responseValue) - Date.parse(createdValue);
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= 60 * 60 * 1000;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const body = await req.json();
    const expectedSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-automation-secret') || body.internal_secret;
    const isInternal = Boolean(expectedSecret && providedSecret === expectedSecret);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!isInternal && user?.role !== 'admin') {
      return Response.json({ error: user ? 'Forbidden' : 'Unauthorized' }, { status: user ? 403 : 401 });
    }

    const { lead_id: leadId } = body;
    if (typeof leadId !== 'string' || !leadId.trim()) return Response.json({ error: 'lead_id required' }, { status: 400 });
    const lead = await base44.asServiceRole.entities.Lead.get(leadId) as Record<string, unknown>;
    if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

    const phone = typeof lead.phone === 'string' ? lead.phone.replace(/\D/g, '') : '';
    const email = typeof lead.email === 'string' ? lead.email : '';
    let score = 0;
    if (PHONE_PATTERN.test(phone) || PHONE_PATTERN.test(`+${phone}`)) score += 20;
    if (EMAIL_PATTERN.test(email)) score += 20;
    if (hasText(lead.service_interest)) score += 15;
    if (hasText(lead.location)) score += 15;
    if (lead.source === 'google') score += 10;
    if (responseUnderOneHour(lead)) score += 10;
    if (lead.source === 'facebook') score += 10;
    score = Math.min(100, score);

    const update: Record<string, unknown> = { score };
    if (score >= 70) update.status = 'qualificado';
    await base44.asServiceRole.entities.Lead.update(leadId, update);

    let notification: 'sent' | 'skipped' = 'skipped';
    const teamPhone = Deno.env.get('LEAD_TEAM_PHONE');
    const alreadyNotified = typeof lead.notes === 'string' && lead.notes.includes('[hot_lead_notified]');
    if (score >= 70 && teamPhone && !alreadyNotified) {
      await base44.asServiceRole.functions.invoke('enviarWhatsApp', {
        destinatario: teamPhone,
        template_name: 'trc_lead_confirmado',
        parametros: [String(lead.name || 'Lead'), String(lead.service_interest || 'serviço local')],
      });
      const notes = `${typeof lead.notes === 'string' ? lead.notes.trim() : ''} [hot_lead_notified]`.trim();
      await base44.asServiceRole.entities.Lead.update(leadId, { notes });
      notification = 'sent';
    }

    return Response.json({ success: true, lead_id: leadId, score, status: update.status || lead.status, notification });
  } catch (error) {
    console.error('[calcularLeadScore]', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Unable to calculate lead score' }, { status: 500 });
  }
});
