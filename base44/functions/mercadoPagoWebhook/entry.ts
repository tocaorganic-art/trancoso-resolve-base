import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Webhook do Mercado Pago — configure a URL desta função no painel do MP
// (Suas integrações → Webhooks) e use o mesmo segredo em MP_WEBHOOK_SECRET.

async function isValidSignature(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get('MP_WEBHOOK_SECRET');
  if (!secret) return false;

  const xSignature = req.headers.get('x-signature') || '';
  const xRequestId = req.headers.get('x-request-id') || '';
  const parts: Record<string, string> = Object.fromEntries(
    xSignature.split(',').map((p: string) => p.trim().split('=').map((s: string) => s.trim()))
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === v1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpToken) {
      return Response.json({ error: 'MP_ACCESS_TOKEN ausente' }, { status: 503 });
    }

    let body: { data?: { id?: string }; type?: string } = {};
    try { body = await req.json(); } catch { /* notificações antigas podem vir vazias */ }

    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id') || body?.data?.id || url.searchParams.get('id');
    const type = url.searchParams.get('type') || body?.type || url.searchParams.get('topic');

    if (!dataId) {
      return Response.json({ ok: true, ignored: 'sem data.id' });
    }

    const valid = await isValidSignature(req, dataId);
    if (!valid) {
      console.warn('[mercadoPagoWebhook] Assinatura inválida — requisição rejeitada');
      return Response.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    // Só processa eventos de assinatura (preapproval)
    if (type !== 'subscription_preapproval') {
      return Response.json({ ok: true, ignored: type });
    }

    // Busca o estado atual da assinatura no MP
    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
      headers: { 'Authorization': `Bearer ${mpToken}` },
    });
    if (!mpRes.ok) {
      console.error('[mercadoPagoWebhook] Erro ao buscar preapproval', dataId, mpRes.status);
      return Response.json({ error: 'preapproval não encontrado' }, { status: 200 });
    }
    const pre = await mpRes.json();

    // external_reference: "<plan>|<billing>|<email>"
    const [plan, billing, email] = String(pre.external_reference || '').split('|');
    if (!email) {
      console.warn('[mercadoPagoWebhook] external_reference inesperado:', pre.external_reference);
      return Response.json({ ok: true, ignored: 'external_reference inválido' });
    }

    const statusMap: Record<string, string> = {
      authorized: 'active',
      cancelled: 'cancelled',
      paused: 'expired',
    };
    const newStatus = statusMap[pre.status];
    if (!newStatus) {
      return Response.json({ ok: true, ignored: `status ${pre.status}` });
    }

    const nextBilling = pre.next_payment_date ? String(pre.next_payment_date).split('T')[0] : undefined;
    const amount = pre.auto_recurring?.transaction_amount;

    const patch: Record<string, unknown> = {
      user_email: email,
      plan: plan || 'monthly',
      billing: billing === 'annual' ? 'annual' : 'monthly',
      status: newStatus,
      mp_preapproval_id: pre.id,
      mp_payer_id: pre.payer_id ? String(pre.payer_id) : undefined,
      payment_method: 'mercadopago',
      ...(amount ? { amount } : {}),
      ...(nextBilling ? { next_billing_date: nextBilling } : {}),
      ...(newStatus === 'active' ? { subscription_start: new Date().toISOString().split('T')[0] } : {}),
    };

    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
    const current = (existing || []).find((s: { mp_preapproval_id?: string }) => s.mp_preapproval_id === pre.id) || existing?.[0];

    if (current) {
      await base44.asServiceRole.entities.Subscription.update(current.id, patch);
    } else {
      await base44.asServiceRole.entities.Subscription.create(patch);
    }

    console.log(`[mercadoPagoWebhook] ${email} → ${newStatus} (plano ${plan}, preapproval ${pre.id})`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[mercadoPagoWebhook] erro:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
