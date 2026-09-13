import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── WEBHOOK ASAAS (12/09/2026) ────────────────────────────────────────────────
// Substitui o mercadoPagoWebhook no pipeline de pagamentos (migração MP → Asaas).
// Configure a URL desta função no painel Asaas → Integrações → Webhooks e defina
// o mesmo token em ASAAS_WEBHOOK_TOKEN (o Asaas envia no header `asaas-access-token`).
//
// Proteções implementadas (herdadas do padrão do mercadoPagoWebhook):
// 1. Validação de token (header asaas-access-token) — rejeita chamadas forjadas
// 2. Idempotência via WebhookEvent — evento duplicado retorna 200 sem reprocessar
// 3. Busca estado real no Asaas — nunca confia no payload recebido
// 4. Alocação de vaga via FounderSlot (atômica, com idempotency_key e timeout)
// 5. Posições revogadas permanecem consumidas — nunca voltam ao pool
// 6. Falha na concessão → pending_reconciliation persistido (não engolido)
// 7. Nenhum dado sensível (email, CPF, stack trace) retornado na resposta
//
// Eventos tratados (o Asaas notifica por cobrança; assinatura vem no campo `subscription`):
// - PAYMENT_RECEIVED / PAYMENT_CONFIRMED → assinatura ativa + Selo Fundador (plano profissional)
// - PAYMENT_OVERDUE / PAYMENT_REFUNDED  → assinatura expired/cancelled
// - Cobranças avulsas (sem subscription) → entidade Payment (pagamento de serviço)

const FOUNDER_LIMIT = 100;
const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

// ─── CAPI (Meta Conversions API) inline helper ────────────────────────────────
async function sendCapiEvent(
  eventName: string,
  customData: Record<string, unknown> = {},
  eventId?: string,
): Promise<void> {
  const accessToken = Deno.env.get('META_CONVERSIONS_API_TOKEN');
  if (!accessToken) return;
  const pixelId = '1469130194903035';
  try {
    await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || crypto.randomUUID(),
          event_source_url: 'https://trancosoresolve.com.br/PrestadorFundador',
          action_source: 'website',
          custom_data: customData,
        }],
      }),
    });
    console.log(`[capi] ${eventName} enviado`);
  } catch (err) {
    console.warn(`[capi] Falha ao enviar ${eventName}:`, (err as Error).message);
  }
}

function asaasBaseUrl(): string {
  return Deno.env.get('ASAAS_ENV') === 'sandbox'
    ? 'https://api-sandbox.asaas.com'
    : 'https://api.asaas.com';
}

async function asaasFetch(apiKey: string, path: string): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${asaasBaseUrl()}${path}`, {
    headers: { 'access_token': apiKey, 'Content-Type': 'application/json', 'User-Agent': 'TrancosoResolve/1.0' },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ─── Hash leve para detectar replays (sem PII) ───────────────────────────────
async function hashEvent(resourceId: string, eventType: string, asaasStatus: string): Promise<string> {
  const data = `${resourceId}:${eventType}:${asaasStatus}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// ─── LogPagamento: ledger de eventos de pagamento (aditivo, sem PII) ──────────
async function registrarLogPagamento(
  base44: any,
  payload: {
    evento: string;
    status?: string;
    valor?: number;
    mercadopago_id?: string;
    prestador_id?: string;
    prestador_email?: string;
    plano?: string;
    payload_raw?: string;
  },
): Promise<void> {
  try {
    await base44.asServiceRole.entities.LogPagamento.create({
      ...payload, // mercadopago_id carrega o ID Asaas (schema compartilhado)
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[asaasWebhook] LogPagamento não registrado:', (e as Error).message);
  }
}

// ─── Alocação atômica de FounderSlot ─────────────────────────────────────────
async function allocateFounderSlot(
  base44: any,
  providerId: string,
  subscriptionId: string | null,
  asaasSubscriptionId: string,
): Promise<{ slot: any; isExisting: boolean } | null> {
  const idempotencyKey = `${providerId}:${asaasSubscriptionId}`;

  const byKey = await base44.asServiceRole.entities.FounderSlot.filter({ idempotency_key: idempotencyKey });
  if (byKey?.length > 0) {
    const existing = byKey[0];
    console.log(`[allocateFounderSlot] Slot ${existing.position} já existe para key=${idempotencyKey} (status: ${existing.status})`);
    return { slot: existing, isExisting: true };
  }

  const allSlots = await base44.asServiceRole.entities.FounderSlot.list('position', 200);
  if (!allSlots?.length) {
    console.warn('[allocateFounderSlot] FounderSlots não inicializados. Chame initFounderSlots como admin antes de conceder selos.');
    return null;
  }

  const now = Date.now();
  const candidates: any[] = (allSlots as any[])
    .filter((s: any) => {
      if (s.status === 'available') return true;
      if (s.status === 'reserved') {
        const age = now - new Date(s.reserved_at || 0).getTime();
        return age > RESERVATION_TIMEOUT_MS;
      }
      return false;
    })
    .sort((a: any, b: any) => a.position - b.position);

  if (candidates.length === 0) {
    const totalConsumed = (allSlots as any[]).filter((s: any) => s.status !== 'available').length;
    console.log(`[allocateFounderSlot] Sem vagas disponíveis. Consumidas: ${totalConsumed}/100`);
    return null;
  }

  const slot = candidates[0];

  await base44.asServiceRole.entities.FounderSlot.update(slot.id, {
    status: 'reserved',
    provider_id: providerId,
    subscription_id: subscriptionId || undefined,
    idempotency_key: idempotencyKey,
    reserved_at: new Date().toISOString(),
    promotion_version: 'prestador_fundador_v1',
  });

  await new Promise((r) => setTimeout(r, 150));
  const verifyByKey = await base44.asServiceRole.entities.FounderSlot.filter({
    idempotency_key: idempotencyKey,
    status: 'reserved',
  });

  if (!verifyByKey?.length) {
    const fallbackCandidates = candidates.slice(1);
    if (fallbackCandidates.length === 0) {
      console.warn(`[allocateFounderSlot] Slot ${slot.position} contestado e sem fallback disponível`);
      return null;
    }
    const fallback = fallbackCandidates[0];
    await base44.asServiceRole.entities.FounderSlot.update(fallback.id, {
      status: 'reserved',
      provider_id: providerId,
      subscription_id: subscriptionId || undefined,
      idempotency_key: idempotencyKey,
      reserved_at: new Date().toISOString(),
      promotion_version: 'prestador_fundador_v1',
    });
    console.log(`[allocateFounderSlot] Slot ${slot.position} contestado — usando fallback ${fallback.position}`);
    return { slot: { ...fallback, idempotency_key: idempotencyKey }, isExisting: false };
  }

  console.log(`[allocateFounderSlot] Slot ${slot.position} reservado para providerId=${providerId}`);
  return { slot: verifyByKey[0], isExisting: false };
}

// ─── Helper: atualiza WebhookEvent sem PII ───────────────────────────────────
async function markWebhookEvent(base44: any, id: string | null, status: string, lastError?: string) {
  if (!id) return;
  await base44.asServiceRole.entities.WebhookEvent.update(id, {
    status,
    processed_at: new Date().toISOString(),
    ...(lastError ? { last_error: lastError.slice(0, 500) } : {}),
  }).catch((e: Error) => {
    console.warn('[markWebhookEvent] falha ao atualizar:', e.message);
  });
}

// ─── Fluxo de assinatura (cobrança vinculada a subscription) ──────────────────
async function handleSubscriptionPayment(
  base44: any,
  apiKey: string,
  payment: any,
  event: string,
  receivedAt: string,
): Promise<Response> {
  // Busca a assinatura REAL no Asaas
  const subRes = await asaasFetch(apiKey, `/v3/subscriptions/${payment.subscription}`);
  if (!subRes.ok) {
    console.error(`[asaasWebhook] Assinatura ${payment.subscription} não encontrada no Asaas (${subRes.status})`);
    if (subRes.status === 404) return Response.json({ ok: true, note: 'assinatura não encontrada' });
    return Response.json({ ok: true, note: `erro Asaas ${subRes.status} — retry pendente` });
  }
  const subscription = subRes.data;

  // Associação: externalReference formato "plano|ciclo|email"
  const [plan, billing, email] = String(subscription.externalReference || '').split('|');
  if (!email) {
    console.warn('[asaasWebhook] externalReference inválido:', subscription.externalReference);
    return Response.json({ ok: true, ignored: 'externalReference inválido' });
  }

  // Status: pagamento RECEIVED/CONFIRMED = assinatura ativa
  const statusMap: Record<string, string> = {
    RECEIVED: 'active',
    CONFIRMED: 'active',
    OVERDUE: 'expired',
    REFUNDED: 'cancelled',
  };
  const newStatus = statusMap[payment.status];
  if (!newStatus) {
    return Response.json({ ok: true, ignored: `status Asaas '${payment.status}' não mapeado` });
  }

  // ─── Idempotência via WebhookEvent ─────────────────────────────────────────
  const payloadHash = await hashEvent(String(payment.id), event, newStatus);
  const existingEvents = await base44.asServiceRole.entities.WebhookEvent.filter({
    provider: 'asaas',
    external_event_id: String(payment.id),
    event_type: event,
  });
  const alreadyProcessed = (existingEvents || []).find((e: any) => e.status === 'processed' && e.payload_hash === payloadHash);
  if (alreadyProcessed) {
    console.log(`[asaasWebhook] Evento duplicado ignorado: asaas:${payment.id}:${event}:${newStatus}`);
    return Response.json({ ok: true, note: 'duplicate event — already processed' });
  }

  let webhookEventId: string | null = null;
  try {
    const newEvent = await base44.asServiceRole.entities.WebhookEvent.create({
      provider: 'asaas',
      external_event_id: String(payment.id),
      external_resource_id: String(payment.subscription),
      event_type: event,
      payload_hash: payloadHash,
      status: 'processing',
      attempts: 1,
      received_at: receivedAt,
    });
    webhookEventId = newEvent?.id || null;
  } catch (we) {
    console.warn('[asaasWebhook] WebhookEvent não criado:', (we as Error).message);
  }

  // Preço vem do Asaas (nunca do payload do cliente)
  const amount = typeof payment.value === 'number' ? payment.value : undefined;
  const dueDate = payment.dueDate ? String(payment.dueDate).split('T')[0] : undefined;

  // next_billing_date: vencimento da cobrança paga + 1 ciclo (aproximação)
  let nextBilling: string | undefined;
  if (dueDate && newStatus === 'active') {
    const d = new Date(dueDate + 'T12:00:00Z');
    if (subscription.cycle === 'YEARLY') d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    nextBilling = d.toISOString().split('T')[0];
  }

  // ─── Atualiza ou cria Subscription ────────────────────────────────────────
  const patch: Record<string, unknown> = {
    user_email: email,
    plan: plan || 'profissional',
    billing: billing === 'annual' ? 'annual' : 'monthly',
    status: newStatus,
    mp_preapproval_id: String(subscription.id), // campo compartilhado: ID Asaas
    payment_method: 'asaas',
    ...(amount ? { amount } : {}),
    ...(nextBilling ? { next_billing_date: nextBilling } : {}),
    ...(newStatus === 'active' ? { subscription_start: dueDate || new Date().toISOString().split('T')[0] } : {}),
  };

  const existingSubsList = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
  const currentSub: any = (existingSubsList || []).find((s: any) => s.mp_preapproval_id === String(subscription.id))
    || existingSubsList?.[0];
  let subscriptionId: string | null = null;

  if (currentSub) {
    await base44.asServiceRole.entities.Subscription.update(currentSub.id, patch);
    subscriptionId = currentSub.id;
  } else {
    const created = await base44.asServiceRole.entities.Subscription.create(patch);
    subscriptionId = created?.id || null;
  }

  if (webhookEventId && subscriptionId) {
    await base44.asServiceRole.entities.WebhookEvent.update(webhookEventId, { subscription_id: subscriptionId }).catch(() => {});
  }

  await registrarLogPagamento(base44, {
    evento: event,
    status: newStatus,
    valor: amount,
    mercadopago_id: String(subscription.id),
    prestador_email: email,
    plano: plan,
    payload_raw: JSON.stringify({ id: payment.id, subscription: subscription.id, status: payment.status, value: payment.value, dueDate: payment.dueDate }),
  });

  // ─── Concessão do Selo Fundador via FounderSlot ────────────────────────────
  if (newStatus === 'active' && plan === 'profissional') {
    let grantError: string | null = null;

    try {
      const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email });
      const provider = providers?.[0];
      const isVerified = provider?.verified === true && provider?.status_verificacao === 'aprovado';

      if (!isVerified) {
        console.log(`[asaasWebhook] ${email} não verificado/aprovado — Fundador não concedido`);
      } else {
        const existingGrants = await base44.asServiceRole.entities.FounderGrant.filter({ provider_id: provider.id });
        const hasGrant = (existingGrants || []).length > 0;

        if (hasGrant) {
          const g = existingGrants[0];
          console.log(`[asaasWebhook] ${email} já tem FounderGrant (status: ${g.status}) — idempotente`);
        } else {
          const allocation = await allocateFounderSlot(base44, provider.id, subscriptionId, String(subscription.id));

          if (!allocation) {
            console.log(`[asaasWebhook] Vagas Fundador esgotadas ou não inicializadas — ${email} sem selo`);
          } else if (allocation.isExisting && (allocation.slot.status === 'granted' || allocation.slot.status === 'revoked')) {
            console.log(`[asaasWebhook] Slot ${allocation.slot.position} já processado (${allocation.slot.status})`);
          } else {
            const slot = allocation.slot;
            await base44.asServiceRole.entities.FounderGrant.create({
              provider_id: provider.id,
              provider_email: email,
              provider_name: provider.full_name || '',
              position: slot.position,
              status: 'active',
              granted_at: new Date().toISOString(),
              promotion_version: 'prestador_fundador_v1',
            });

            await base44.asServiceRole.entities.FounderSlot.update(slot.id, {
              status: 'granted',
              granted_at: new Date().toISOString(),
            }).catch((slotErr: Error) => {
              console.warn(`[asaasWebhook] Falha ao marcar slot ${slot.position} como granted:`, slotErr.message);
            });

            console.log(`[asaasWebhook] Selo Fundador concedido: ${email} → posição ${slot.position}`);
            sendCapiEvent('FounderBadgeGranted', {
              position: slot.position,
              value: 19.90,
              currency: 'BRL',
              content_ids: ['prestador_fundador'],
              content_type: 'product',
            }).catch(() => {});
          }
        }
      }

      sendCapiEvent('Subscribe', {
        value: amount || 19.90,
        currency: 'BRL',
        predicted_ltv: (amount || 19.90) * 12,
        content_name: plan || 'profissional',
      }).catch(() => {});

    } catch (grantErr) {
      grantError = (grantErr as Error).message;
      console.error(`[asaasWebhook] [RECONCILIAR-URGENTE] Falha ao conceder Fundador para ${email}: ${grantError}.`);

      try {
        const byKey = await base44.asServiceRole.entities.FounderSlot.filter({
          idempotency_key: `${(await base44.asServiceRole.entities.ServiceProvider.filter({ email }))?.[0]?.id}:${subscription.id}`,
        });
        if (byKey?.length > 0) {
          await base44.asServiceRole.entities.FounderSlot.update(byKey[0].id, { status: 'pending_reconciliation' });
        }
      } catch { /* falha silenciosa — log principal já registrado */ }
    }

    await markWebhookEvent(base44, webhookEventId, grantError ? 'pending_reconciliation' : 'processed', grantError || undefined);
    if (grantError) {
      return Response.json({ ok: true, note: 'subscription updated; founder grant pending reconciliation' });
    }
  } else {
    await markWebhookEvent(base44, webhookEventId, 'processed');
  }

  console.log(`[asaasWebhook] ${email} → ${newStatus} (plano ${plan}, assinatura ${subscription.id})`);
  return Response.json({ ok: true });
}

// ─── Fluxo de pagamento avulso de serviço (sem subscription) ──────────────────
const PAYMENT_STATUS_MAP: Record<string, string> = {
  RECEIVED: 'captured',
  CONFIRMED: 'processing',
  OVERDUE: 'pending',
  REFUNDED: 'refunded',
};

async function handleStandalonePayment(
  base44: any,
  payment: any,
  event: string,
  receivedAt: string,
): Promise<Response> {
  const newStatus = PAYMENT_STATUS_MAP[payment.status];
  if (!newStatus) {
    return Response.json({ ok: true, ignored: `status Asaas '${payment.status}' não mapeado` });
  }

  const payloadHash = await hashEvent(String(payment.id), event, newStatus);
  const existingEvents = await base44.asServiceRole.entities.WebhookEvent.filter({
    provider: 'asaas',
    external_event_id: String(payment.id),
    event_type: event,
  });
  const alreadyProcessed = (existingEvents || []).find((e: any) => e.status === 'processed' && e.payload_hash === payloadHash);
  if (alreadyProcessed) {
    console.log(`[asaasWebhook] Evento payment duplicado ignorado: asaas:${payment.id}:${newStatus}`);
    return Response.json({ ok: true, note: 'duplicate event — already processed' });
  }

  let webhookEventId: string | null = null;
  try {
    const newEvent = await base44.asServiceRole.entities.WebhookEvent.create({
      provider: 'asaas',
      external_event_id: String(payment.id),
      external_resource_id: String(payment.id),
      event_type: event,
      payload_hash: payloadHash,
      status: 'processing',
      attempts: 1,
      received_at: receivedAt,
    });
    webhookEventId = newEvent?.id || null;
  } catch (we) {
    console.warn('[asaasWebhook] WebhookEvent (payment) não criado:', (we as Error).message);
  }

  try {
    const payments = await base44.asServiceRole.entities.Payment.filter({
      mp_payment_id: String(payment.id), // campo compartilhado: ID Asaas
    });
    const localPayment = payments?.[0];
    if (!localPayment) {
      console.warn(`[asaasWebhook] Payment local não encontrado para asaas_id=${payment.id}`);
      await markWebhookEvent(base44, webhookEventId, 'failed', 'Payment local não encontrado');
      return Response.json({ ok: true, note: 'payment local não encontrado' });
    }

    const oldStatus = localPayment.status;
    if (oldStatus === newStatus) {
      await markWebhookEvent(base44, webhookEventId, 'processed');
      return Response.json({ ok: true, note: 'status inalterado' });
    }

    await base44.asServiceRole.entities.Payment.update(localPayment.id, { status: newStatus });

    await registrarLogPagamento(base44, {
      evento: event,
      status: newStatus,
      valor: payment.value,
      mercadopago_id: String(payment.id),
      prestador_id: localPayment.provider_id,
      payload_raw: JSON.stringify({ id: payment.id, status: payment.status, value: payment.value }),
    });

    // Pagamento de serviço confirmado: confirma FounderSlot do plano Fundador se houver
    if (newStatus === 'captured') {
      try {
        const payerEmail = localPayment.client_email;
        if (payerEmail) {
          const payerSubs = await base44.asServiceRole.entities.Subscription.filter({ user_email: payerEmail });
          const founderSub = (payerSubs || [])
            .filter((s: any) => s.plan === 'profissional')
            .sort((a: any, b: any) => String(b.updated_date || '').localeCompare(String(a.updated_date || '')))[0];
          if (founderSub) {
            const slots = await base44.asServiceRole.entities.FounderSlot.filter({ subscription_id: founderSub.id });
            const slot = slots?.[0];
            if (slot && (slot.status === 'reserved' || slot.status === 'pending_reconciliation')) {
              await base44.asServiceRole.entities.FounderSlot.update(slot.id, {
                status: 'granted',
                granted_at: new Date().toISOString(),
              });
              console.log(`[asaasWebhook] FounderSlot posição ${slot.position} confirmado pelo pagamento ${payment.id}`);
            }
          }
        }
      } catch (slotErr) {
        console.warn('[asaasWebhook] Falha ao confirmar FounderSlot:', (slotErr as Error).message);
      }
    }

    await markWebhookEvent(base44, webhookEventId, 'processed');
    console.log(`[asaasWebhook] payment ${payment.id}: '${oldStatus}' → '${newStatus}'`);
    return Response.json({ ok: true });

  } catch (err) {
    console.error(`[asaasWebhook] erro no fluxo payment (${payment.id}):`, (err as Error).message);
    await markWebhookEvent(base44, webhookEventId, 'failed', (err as Error).message);
    return Response.json({ ok: true, note: 'internal error logged' });
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const receivedAt = new Date().toISOString();

  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('ASAAS_API_KEY');
    const webhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');
    if (!apiKey) {
      console.error('[asaasWebhook] ASAAS_API_KEY ausente');
      return Response.json({ error: 'Configuração ausente' }, { status: 503 });
    }

    // ─── 1. Validação de token (asaas-access-token) ───────────────────────────
    if (!webhookToken) {
      console.warn('[asaasWebhook] ASAAS_WEBHOOK_TOKEN não configurado — rejeitado');
      return Response.json({ error: 'Webhook não configurado' }, { status: 503 });
    }
    const incomingToken = req.headers.get('asaas-access-token') || '';
    if (incomingToken !== webhookToken) {
      console.warn('[asaasWebhook] Token inválido — rejeitado');
      return Response.json({ error: 'Token inválido' }, { status: 401 });
    }

    // ─── 2. Parse do payload ──────────────────────────────────────────────────
    let body: { event?: string; payment?: { id?: string } } = {};
    try { body = await req.json(); } catch { /* payload vazio — ignora */ }

    const event = body?.event || '';
    const paymentId = body?.payment?.id;
    if (!paymentId || !event) {
      return Response.json({ ok: true, ignored: 'sem payment.id ou event' });
    }

    // ─── 3. Busca estado REAL no Asaas — nunca confia no payload ─────────────
    const payRes = await asaasFetch(apiKey, `/v3/payments/${paymentId}`);
    if (!payRes.ok) {
      console.error(`[asaasWebhook] Cobrança ${paymentId} não encontrada no Asaas (${payRes.status})`);
      if (payRes.status === 404) return Response.json({ ok: true, note: 'cobrança não encontrada no Asaas' });
      return Response.json({ ok: true, note: `erro Asaas ${payRes.status} — retry pendente` });
    }
    const payment = payRes.data;

    // ─── 4. Roteamento: assinatura vs pagamento avulso ─────────────────────────
    if (payment.subscription) {
      try {
        return await handleSubscriptionPayment(base44, apiKey, payment, event, receivedAt);
      } catch (err) {
        console.error(`[asaasWebhook] erro não tratado no fluxo assinatura (${paymentId}):`, (err as Error).message);
        return Response.json({ ok: true, note: 'internal error logged' });
      }
    }

    return await handleStandalonePayment(base44, payment, event, receivedAt);

  } catch (error) {
    console.error('[asaasWebhook] erro geral:', (error as Error).message);
    return Response.json({ ok: true, note: 'internal error logged' });
  }
});
