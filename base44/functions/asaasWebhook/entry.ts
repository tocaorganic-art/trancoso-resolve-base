import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getAsaasConfig, isValidAsaasWebhookToken } from '../_shared/asaasClient.ts';

// ─── CAPI (Meta Conversions API) inline helper ────────────────────────────────
// Idêntico ao usado em mercadoPagoWebhook — analytics é agnóstico de gateway.
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

// ─── Webhook do Asaas ──────────────────────────────────────────────────────────
// Configure a URL desta function no painel Asaas → Integrações → Webhooks, com
// o mesmo token em ASAAS_WEBHOOK_TOKEN (enviado pelo Asaas no header
// `asaas-access-token`, comparado aqui — NÃO é a API key).
//
// Modelo de entrega do Asaas é "at least once": o mesmo evento pode chegar
// mais de uma vez, por isso a idempotência abaixo é via `id` do evento
// (WebhookEvent.external_event_id), igual ao padrão já usado com o MP.
//
// Fluxo recomendado pela doc do Asaas: validar → persistir → responder 200 →
// processar. Aqui processamos de forma síncrona simples (volume ainda baixo);
// se o volume crescer, mover o processamento para depois do 200 (fila).

const FOUNDER_LIMIT = 100;
const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

// ─── Alocação atômica de FounderSlot ─────────────────────────────────────────
// Portado 1:1 de mercadoPagoWebhook/entry.ts — mesma lógica, independente do
// gateway de pagamento que confirmou a assinatura.
async function allocateFounderSlot(
  base44: any,
  providerId: string,
  subscriptionId: string | null,
  externalPaymentRef: string,
): Promise<{ slot: any; isExisting: boolean } | null> {
  const idempotencyKey = `${providerId}:${externalPaymentRef}`;

  const byKey = await base44.asServiceRole.entities.FounderSlot.filter({
    idempotency_key: idempotencyKey,
  });
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
    console.log(`[allocateFounderSlot] Sem vagas disponíveis. Consumidas: ${totalConsumed}/${FOUNDER_LIMIT}`);
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
    return { slot: { ...fallback, position: fallback.position, idempotency_key: idempotencyKey }, isExisting: false };
  }

  console.log(`[allocateFounderSlot] Slot ${slot.position} reservado para providerId=${providerId}`);
  return { slot: verifyByKey[0], isExisting: false };
}

async function markWebhookEvent(
  base44: any,
  id: string | null,
  status: string,
  lastError?: string,
) {
  if (!id) return;
  await base44.asServiceRole.entities.WebhookEvent.update(id, {
    status,
    processed_at: new Date().toISOString(),
    ...(lastError ? { last_error: lastError.slice(0, 500) } : {}),
  }).catch((e: Error) => {
    console.warn('[markWebhookEvent] falha ao atualizar:', e.message);
  });
}

const CONFIRMED_EVENTS = new Set(['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']);
const NEGATIVE_EVENTS = new Set(['PAYMENT_OVERDUE', 'PAYMENT_DELETED', 'PAYMENT_REFUNDED', 'SUBSCRIPTION_DELETED']);

Deno.serve(async (req) => {
  const receivedAt = new Date().toISOString();

  try {
    if (!isValidAsaasWebhookToken(req)) {
      console.warn('[asaasWebhook] Token inválido — rejeitado');
      return Response.json({ error: 'Token inválido' }, { status: 401 });
    }

    const config = getAsaasConfig();
    if (!config) {
      console.error('[asaasWebhook] ASAAS_API_KEY ausente');
      return Response.json({ error: 'Configuração ausente' }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);

    let body: { id?: string; event?: string; payment?: any; subscription?: any } = {};
    try { body = await req.json(); } catch { /* payload vazio/legado */ }

    const eventId = body?.id;
    const eventType = body?.event;
    if (!eventId || !eventType) {
      return Response.json({ ok: true, ignored: 'payload sem id/event' });
    }

    // ─── Idempotência via WebhookEvent (evento duplicado → 200 sem reprocessar) ──
    const existingEvents = await base44.asServiceRole.entities.WebhookEvent.filter({
      provider: 'asaas',
      external_event_id: eventId,
    });
    const alreadyProcessed = (existingEvents || []).find((e: any) => e.status === 'processed');
    if (alreadyProcessed) {
      console.log(`[asaasWebhook] Evento duplicado ignorado: asaas:${eventId}:${eventType}`);
      return Response.json({ ok: true, note: 'duplicate event — already processed' });
    }

    let webhookEventId: string | null = null;
    try {
      const created = await base44.asServiceRole.entities.WebhookEvent.create({
        provider: 'asaas',
        external_event_id: eventId,
        external_resource_id: body?.payment?.id || body?.subscription?.id || eventId,
        event_type: eventType,
        payload_hash: eventId,
        status: 'processing',
        attempts: 1,
        received_at: receivedAt,
      });
      webhookEventId = created?.id || null;
    } catch (we) {
      console.warn('[asaasWebhook] WebhookEvent não criado:', (we as Error).message);
    }

    const payment = body?.payment;
    if (!payment) {
      // Eventos de transferência/assinatura sem payment embutido — apenas registra.
      await markWebhookEvent(base44, webhookEventId, 'processed', `evento ${eventType} sem payload de payment`);
      return Response.json({ ok: true, ignored: 'sem payment no payload' });
    }

    // ─── Caso 1: pagamento pertence a uma assinatura recorrente ───────────────
    if (payment.subscription) {
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        asaas_subscription_id: payment.subscription,
      });
      const sub = subs?.[0];
      if (!sub) {
        console.warn(`[asaasWebhook] Subscription local não encontrada para asaas_subscription_id=${payment.subscription}`);
        await markWebhookEvent(base44, webhookEventId, 'failed', `subscription ${payment.subscription} não encontrada localmente`);
        return Response.json({ ok: true, note: 'subscription local não encontrada' });
      }

      const [plan] = String(sub.plan || '').split('|');
      const email = sub.user_email;

      if (CONFIRMED_EVENTS.has(eventType)) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          status: 'active',
          payment_method: 'asaas',
          asaas_payment_id: payment.id,
          amount: payment.value ?? sub.amount,
          ...(payment.nextDueDate ? { next_billing_date: payment.nextDueDate } : {}),
          subscription_start: sub.subscription_start || new Date().toISOString().split('T')[0],
        });

        // ─── Concessão do Selo Fundador (mesma regra do fluxo MP) ────────────
        if (plan === 'profissional' && email) {
          let grantError: string | null = null;
          try {
            const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email });
            const provider = providers?.[0];
            const isVerified = provider?.verified === true && provider?.status_verificacao === 'aprovado';

            if (!isVerified) {
              console.log(`[asaasWebhook] ${email} não verificado/aprovado — Fundador não concedido`);
            } else {
              const existingGrants = await base44.asServiceRole.entities.FounderGrant.filter({ provider_id: provider.id });
              if ((existingGrants || []).length > 0) {
                console.log(`[asaasWebhook] ${email} já tem FounderGrant — idempotente`);
              } else {
                const allocation = await allocateFounderSlot(base44, provider.id, sub.id, payment.subscription);
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
              value: payment.value || 19.90,
              currency: 'BRL',
              predicted_ltv: (payment.value || 19.90) * 12,
              content_name: plan || 'profissional',
            }).catch(() => {});

          } catch (err) {
            grantError = (err as Error).message;
            console.error(`[asaasWebhook] [RECONCILIAR-URGENTE] Falha ao conceder Fundador para ${email}: ${grantError}.`);
          }

          await markWebhookEvent(base44, webhookEventId, grantError ? 'pending_reconciliation' : 'processed', grantError || undefined);
          console.log(`[asaasWebhook] ${email} → active (plano ${plan}, subscription ${payment.subscription})`);
          return Response.json({ ok: true, note: grantError ? 'subscription updated; founder grant pending reconciliation' : undefined });
        }
      } else if (NEGATIVE_EVENTS.has(eventType)) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          status: eventType === 'PAYMENT_OVERDUE' ? 'expired' : 'cancelled',
        });
      }

      await markWebhookEvent(base44, webhookEventId, 'processed');
      console.log(`[asaasWebhook] ${email} → ${eventType} (subscription ${payment.subscription})`);
      return Response.json({ ok: true });
    }

    // ─── Caso 2: pagamento avulso (criarPagamentoServico) ─────────────────────
    const externalRef = String(payment.externalReference || '');
    const requestId = externalRef.startsWith('service_request:')
      ? externalRef.split(':')[1]
      : null;

    if (!requestId) {
      await markWebhookEvent(base44, webhookEventId, 'processed', 'pagamento avulso sem externalReference reconhecível');
      return Response.json({ ok: true, ignored: 'externalReference não reconhecido' });
    }

    const payments = await base44.asServiceRole.entities.Payment.filter({ request_id: requestId });
    const pay = payments?.[0];
    if (!pay) {
      await markWebhookEvent(base44, webhookEventId, 'failed', `Payment local não encontrado para request_id=${requestId}`);
      return Response.json({ ok: true, note: 'payment local não encontrado' });
    }

    const statusMap: Record<string, string> = {
      PAYMENT_CONFIRMED: 'paid',
      PAYMENT_RECEIVED: 'paid',
      PAYMENT_OVERDUE: 'overdue',
      PAYMENT_DELETED: 'cancelled',
      PAYMENT_REFUNDED: 'refunded',
    };
    const mapped = statusMap[eventType];
    if (mapped) {
      await base44.asServiceRole.entities.Payment.update(pay.id, {
        status: mapped,
        asaas_payment_id: payment.id,
      });
      if (mapped === 'paid') {
        sendCapiEvent('Purchase', {
          value: payment.value,
          currency: 'BRL',
          content_ids: [requestId],
          content_type: 'product',
        }).catch(() => {});
      }
    }

    await markWebhookEvent(base44, webhookEventId, 'processed');
    console.log(`[asaasWebhook] request_id=${requestId} → ${eventType}`);
    return Response.json({ ok: true });

  } catch (error) {
    console.error('[asaasWebhook] erro geral:', (error as Error).message);
    // Retorna 200 para não acionar retry agressivo do Asaas em erros não-recuperáveis.
    return Response.json({ ok: true, note: 'internal error logged' });
  }
});
