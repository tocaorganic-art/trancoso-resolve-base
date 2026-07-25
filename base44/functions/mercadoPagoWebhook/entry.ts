import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Webhook do Mercado Pago ─────────────────────────────────────────────────
// Configure a URL desta função no painel do MP (Integrações → Webhooks).
// Use o mesmo segredo em MP_WEBHOOK_SECRET.
//
// Proteções implementadas:
// 1. Validação de assinatura HMAC-SHA256 (x-signature)
// 2. Idempotência via entidade WebhookEvent — evento duplicado retorna 200 sem re-processar
// 3. Busca o estado real do recurso no MP — nunca confia só no payload recebido
// 4. Contagem de vagas Fundador inclui grants revogados (regra comercial imutável)
// 5. Falha na concessão do selo é persistida como pending_reconciliation (não engolida)
// 6. Nenhum dado sensível (email, CPF, stack trace) é retornado na resposta

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

// Gera hash leve do evento para detectar replays (sem PII no hash)
async function hashEvent(dataId: string, eventType: string, status: string): Promise<string> {
  const data = `${dataId}:${eventType}:${status}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

Deno.serve(async (req) => {
  const receivedAt = new Date().toISOString();

  try {
    const base44 = createClientFromRequest(req);
    const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpToken) {
      return Response.json({ error: 'MP_ACCESS_TOKEN ausente' }, { status: 503 });
    }

    let body: { data?: { id?: string }; type?: string; action?: string } = {};
    try { body = await req.json(); } catch { /* notificações antigas podem vir vazias */ }

    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id') || body?.data?.id || url.searchParams.get('id');
    const type = url.searchParams.get('type') || body?.type || url.searchParams.get('topic');

    if (!dataId) {
      return Response.json({ ok: true, ignored: 'sem data.id' });
    }

    // ─── 1. Validação de assinatura ──────────────────────────────────────────
    const valid = await isValidSignature(req, dataId);
    if (!valid) {
      console.warn('[mercadoPagoWebhook] Assinatura inválida — requisição rejeitada');
      return Response.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    // Só processa eventos de assinatura (preapproval)
    if (type !== 'subscription_preapproval') {
      return Response.json({ ok: true, ignored: type });
    }

    // ─── 2. Busca estado real no MP antes de qualquer lógica ────────────────
    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
      headers: { 'Authorization': `Bearer ${mpToken}` },
    });
    if (!mpRes.ok) {
      console.error('[mercadoPagoWebhook] Erro ao buscar preapproval', dataId, mpRes.status);
      return Response.json({ ok: true, note: 'preapproval não encontrado no MP' });
    }
    const pre = await mpRes.json();

    const statusMap: Record<string, string> = {
      authorized: 'active',
      cancelled: 'cancelled',
      paused: 'expired',
    };
    const newStatus = statusMap[pre.status];
    if (!newStatus) {
      return Response.json({ ok: true, ignored: `status MP ${pre.status} não mapeado` });
    }

    // ─── 3. Idempotência via WebhookEvent ────────────────────────────────────
    // Chave de deduplicação: preapproval_id + tipo + status resultante
    const eventKey = `mp:${dataId}:${type}:${newStatus}`;
    const payloadHash = await hashEvent(dataId, type || '', newStatus);

    const existingEvents = await base44.asServiceRole.entities.WebhookEvent.filter({
      provider: 'mercadopago',
      external_event_id: dataId,
      event_type: type || 'subscription_preapproval',
    });

    const alreadyProcessed = (existingEvents || []).find(
      (e: { status?: string; payload_hash?: string }) =>
        e.status === 'processed' && e.payload_hash === payloadHash
    );
    if (alreadyProcessed) {
      console.log(`[mercadoPagoWebhook] Evento duplicado ignorado: ${eventKey}`);
      return Response.json({ ok: true, note: 'duplicate event — already processed' });
    }

    // Cria ou reutiliza o registro de evento para esta tentativa
    let webhookEventId: string | null = null;
    try {
      const newEvent = await base44.asServiceRole.entities.WebhookEvent.create({
        provider: 'mercadopago',
        external_event_id: dataId,
        external_resource_id: pre.id,
        event_type: type || 'subscription_preapproval',
        payload_hash: payloadHash,
        status: 'processing',
        attempts: 1,
        received_at: receivedAt,
      });
      webhookEventId = newEvent?.id || null;
    } catch (webhookErr) {
      // Falha ao criar WebhookEvent não deve impedir o processamento, mas loga
      console.warn('[mercadoPagoWebhook] Não foi possível criar WebhookEvent:', (webhookErr as Error).message);
    }

    // ─── 4. Processa o evento ────────────────────────────────────────────────
    const [plan, billing, email] = String(pre.external_reference || '').split('|');
    if (!email) {
      console.warn('[mercadoPagoWebhook] external_reference inesperado:', pre.external_reference);
      if (webhookEventId) {
        await base44.asServiceRole.entities.WebhookEvent.update(webhookEventId, {
          status: 'failed',
          last_error: 'external_reference inválido',
          processed_at: new Date().toISOString(),
        }).catch(() => {});
      }
      return Response.json({ ok: true, ignored: 'external_reference inválido' });
    }

    const nextBilling = pre.next_payment_date ? String(pre.next_payment_date).split('T')[0] : undefined;
    const amount = pre.auto_recurring?.transaction_amount;

    const patch: Record<string, unknown> = {
      user_email: email,
      plan: plan || 'profissional',
      billing: billing === 'annual' ? 'annual' : 'monthly',
      status: newStatus,
      mp_preapproval_id: pre.id,
      mp_payer_id: pre.payer_id ? String(pre.payer_id) : undefined,
      payment_method: 'mercadopago',
      ...(amount ? { amount } : {}),
      ...(nextBilling ? { next_billing_date: nextBilling } : {}),
      ...(newStatus === 'active' ? { subscription_start: new Date().toISOString().split('T')[0] } : {}),
    };

    // Atualiza ou cria Subscription
    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
    const current: any = (existing || []).find((s: any) => s.mp_preapproval_id === pre.id) || existing?.[0];
    let subscriptionId: string | null = null;

    if (current) {
      await base44.asServiceRole.entities.Subscription.update(current.id, patch);
      subscriptionId = current.id;
    } else {
      const created = await base44.asServiceRole.entities.Subscription.create(patch);
      subscriptionId = created?.id || null;
    }

    if (webhookEventId && subscriptionId) {
      await base44.asServiceRole.entities.WebhookEvent.update(webhookEventId, {
        subscription_id: subscriptionId,
      }).catch(() => {});
    }

    // ─── 5. Concessão do Selo Fundador ───────────────────────────────────────
    // Apenas quando assinatura Profissional é autorizada (ativa).
    // Conta TODOS os grants (active + revoked) — regra comercial: vagas revogadas
    // não voltam ao pool. Uma falha aqui é persistida como pending_reconciliation.
    if (newStatus === 'active' && plan === 'profissional') {
      let grantError: string | null = null;

      try {
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email });
        const provider = providers?.[0];
        const isVerified = provider?.verified === true && provider?.status_verificacao === 'aprovado';

        // Verifica se já tem grant em qualquer status (active ou revoked)
        const existingGrants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
        const allGrants = existingGrants || [];

        const alreadyHasGrant = allGrants.some(
          (g: { provider_email?: string }) => g.provider_email === email
        );

        if (alreadyHasGrant) {
          // Idempotência: prestador já teve grant em algum momento — não recria
          console.log(`[mercadoPagoWebhook] ${email} já teve FounderGrant — idempotência, ignorando`);
        } else if (!isVerified) {
          console.log(`[mercadoPagoWebhook] ${email} não verificado — Fundador não concedido`);
        } else {
          // taken = TODOS os grants, incluindo revogados (regra comercial)
          const taken = allGrants.length;

          if (taken >= 100) {
            console.log(`[mercadoPagoWebhook] Vagas Fundador esgotadas (${taken}/100) — selo não concedido para ${email}`);
          } else {
            await base44.asServiceRole.entities.FounderGrant.create({
              provider_id: provider.id,
              provider_email: email,
              provider_name: provider.full_name || '',
              position: taken + 1,
              status: 'active',
              granted_at: new Date().toISOString(),
              promotion_version: 'prestador_fundador_v1',
            });
            console.log(`[mercadoPagoWebhook] Selo Fundador concedido para ${email} (posição ${taken + 1})`);
          }
        }
      } catch (grantErr) {
        grantError = (grantErr as Error).message;
        // Falha na concessão do selo NÃO é engolida silenciosamente.
        // É persistida em WebhookEvent para reconciliação manual.
        console.error(`[mercadoPagoWebhook] [RECONCILIAR] Falha ao conceder Fundador para ${email}:`, grantError);
      }

      // Persiste resultado no WebhookEvent
      if (webhookEventId) {
        await base44.asServiceRole.entities.WebhookEvent.update(webhookEventId, {
          status: grantError ? 'pending_reconciliation' : 'processed',
          last_error: grantError || undefined,
          processed_at: new Date().toISOString(),
        }).catch(() => {});
      }

      if (grantError) {
        // Retorna 200 para o MP não retentar, mas o estado interno é pending_reconciliation
        return Response.json({ ok: true, note: 'subscription updated; founder grant pending reconciliation' });
      }
    } else {
      // Para outros status (cancelled, paused), marca como processado
      if (webhookEventId) {
        await base44.asServiceRole.entities.WebhookEvent.update(webhookEventId, {
          status: 'processed',
          processed_at: new Date().toISOString(),
        }).catch(() => {});
      }
    }

    console.log(`[mercadoPagoWebhook] ${email} → ${newStatus} (plano ${plan}, preapproval ${pre.id})`);
    return Response.json({ ok: true });

  } catch (error) {
    console.error('[mercadoPagoWebhook] erro geral:', (error as Error).message);
    // Retorna 200 para não acionar retry automático do MP em erros não-recuperáveis
    return Response.json({ ok: true, note: 'internal error logged' });
  }
});
