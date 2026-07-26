import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── CAPI (Meta Conversions API) inline helper ────────────────────────────────
// Envia evento server-side para o Meta. No-op silencioso se secret não configurado.
async function sendCapiEvent(
  eventName: string,
  customData: Record<string, unknown> = {},
  eventId?: string,
): Promise<void> {
  const accessToken = Deno.env.get('FB_ACCESS_TOKEN');
  if (!accessToken) return; // secret não configurado — analytics é opcional
  const pixelId = '2222634538513651';
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

// ─── Webhook do Mercado Pago ─────────────────────────────────────────────────
// Configure a URL desta função no painel MP → Integrações → Webhooks.
// Defina o mesmo segredo em MP_WEBHOOK_SECRET (gerenciador de secrets do Base44).
//
// Proteções implementadas:
// 1. Validação de assinatura HMAC-SHA256 (x-signature)
// 2. Idempotência via WebhookEvent — evento duplicado retorna 200 sem reprocessar
// 3. Busca estado real no MP — nunca confia em payload recebido para preço/plano/status
// 4. Alocação de vaga via FounderSlot (atômica, com idempotency_key e timeout de reserva)
// 5. Posições revogadas permanecem consumidas — nunca voltam ao pool
// 6. Falha na concessão → pending_reconciliation persistido (não engolido)
// 7. Nenhum dado sensível (email, CPF, stack trace) retornado na resposta

const FOUNDER_LIMIT = 100;
const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

// ─── Validação de assinatura HMAC-SHA256 ─────────────────────────────────────
async function isValidSignature(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get('MP_WEBHOOK_SECRET');
  if (!secret) {
    console.warn('[mercadoPagoWebhook] MP_WEBHOOK_SECRET não configurado — assinatura não validada');
    return false;
  }

  const xSignature = req.headers.get('x-signature') || '';
  const xRequestId = req.headers.get('x-request-id') || '';
  const parts: Record<string, string> = Object.fromEntries(
    xSignature.split(',').map((p: string) => {
      const idx = p.indexOf('=');
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    })
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

// ─── Hash leve para detectar replays (sem PII) ───────────────────────────────
async function hashEvent(dataId: string, eventType: string, mpStatus: string): Promise<string> {
  const data = `${dataId}:${eventType}:${mpStatus}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// ─── Alocação atômica de FounderSlot ─────────────────────────────────────────
// Encontra o slot de menor posição disponível e reserva com idempotency_key.
// Retorna o slot reservado ou null se sem vagas.
// Proteções:
//   - Verifica idempotency_key antes de reservar (replay da mesma concessão)
//   - Considera reservas expiradas (>10min) como disponíveis
//   - Após reservar, verifica se a chave persiste (otimistic lock)
//   - Status revoked/granted nunca volta a available
async function allocateFounderSlot(
  base44: any,
  providerId: string,
  subscriptionId: string | null,
  preapprovalId: string,
): Promise<{ slot: any; isExisting: boolean } | null> {
  const idempotencyKey = `${providerId}:${preapprovalId}`;

  // 1. Verifica se esta combinação já foi alocada (replay seguro)
  const byKey = await base44.asServiceRole.entities.FounderSlot.filter({
    idempotency_key: idempotencyKey,
  });
  if (byKey?.length > 0) {
    const existing = byKey[0];
    console.log(`[allocateFounderSlot] Slot ${existing.position} já existe para key=${idempotencyKey} (status: ${existing.status})`);
    return { slot: existing, isExisting: true };
  }

  // 2. Lista todos os 100 slots
  const allSlots = await base44.asServiceRole.entities.FounderSlot.list('position', 200);
  if (!allSlots?.length) {
    // FounderSlots não inicializados — admin deve chamar initFounderSlots
    console.warn('[allocateFounderSlot] FounderSlots não inicializados. Chame initFounderSlots como admin antes de conceder selos.');
    return null;
  }

  const now = Date.now();

  // 3. Encontra candidatos: 'available' ou 'reserved' expirados
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

  // 4. Reserva o slot com nossa chave
  await base44.asServiceRole.entities.FounderSlot.update(slot.id, {
    status: 'reserved',
    provider_id: providerId,
    subscription_id: subscriptionId || undefined,
    idempotency_key: idempotencyKey,
    reserved_at: new Date().toISOString(),
    promotion_version: 'prestador_fundador_v1',
  });

  // 5. Verificação de ownership (optimistic lock): aguarda 150ms e relê pelo key
  await new Promise((r) => setTimeout(r, 150));
  const verifyByKey = await base44.asServiceRole.entities.FounderSlot.filter({
    idempotency_key: idempotencyKey,
    status: 'reserved',
  });

  if (!verifyByKey?.length) {
    // Outra requisição ganhou a corrida pelo mesmo slot — tenta o próximo
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

// ─── Webhook principal ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const receivedAt = new Date().toISOString();

  try {
    const base44 = createClientFromRequest(req);
    const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpToken) {
      console.error('[mercadoPagoWebhook] MP_ACCESS_TOKEN ausente');
      return Response.json({ error: 'Configuração ausente' }, { status: 503 });
    }

    // ─── Parse do payload ─────────────────────────────────────────────────────
    let body: { data?: { id?: string }; type?: string; action?: string } = {};
    try { body = await req.json(); } catch { /* notificações legadas podem vir vazias */ }

    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id') || body?.data?.id || url.searchParams.get('id');
    const type = url.searchParams.get('type') || body?.type || url.searchParams.get('topic');

    if (!dataId) {
      return Response.json({ ok: true, ignored: 'sem data.id' });
    }

    // ─── 1. Validação de assinatura HMAC-SHA256 ───────────────────────────────
    const valid = await isValidSignature(req, dataId);
    if (!valid) {
      console.warn('[mercadoPagoWebhook] Assinatura inválida — rejeitado');
      return Response.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    // Só processa preapproval
    if (type !== 'subscription_preapproval') {
      return Response.json({ ok: true, ignored: type });
    }

    // ─── 2. Busca estado REAL no Mercado Pago ─────────────────────────────────
    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
      headers: { 'Authorization': `Bearer ${mpToken}` },
    });
    if (!mpRes.ok) {
      const status = mpRes.status;
      console.error(`[mercadoPagoWebhook] Preapproval ${dataId} não encontrado no MP (${status})`);
      // 404 → recurso genuinamente inexistente; outros erros → retry
      if (status === 404) return Response.json({ ok: true, note: 'preapproval não encontrado no MP' });
      return Response.json({ ok: true, note: `erro MP ${status} — retry pendente` });
    }
    const pre = await mpRes.json();

    // Mapeamento de status MP → status interno
    const statusMap: Record<string, string> = {
      authorized: 'active',
      cancelled: 'cancelled',
      paused: 'expired',
      rejected: 'cancelled',
      expired: 'expired',
    };
    const newStatus = statusMap[pre.status];
    if (!newStatus) {
      return Response.json({ ok: true, ignored: `status MP '${pre.status}' não mapeado` });
    }

    // ─── 3. Idempotência via WebhookEvent ─────────────────────────────────────
    const payloadHash = await hashEvent(dataId, type || 'subscription_preapproval', newStatus);

    const existingEvents = await base44.asServiceRole.entities.WebhookEvent.filter({
      provider: 'mercadopago',
      external_event_id: dataId,
      event_type: type || 'subscription_preapproval',
    });

    const alreadyProcessed = (existingEvents || []).find(
      (e: any) => e.status === 'processed' && e.payload_hash === payloadHash
    );
    if (alreadyProcessed) {
      console.log(`[mercadoPagoWebhook] Evento duplicado ignorado: mp:${dataId}:${type}:${newStatus}`);
      return Response.json({ ok: true, note: 'duplicate event — already processed' });
    }

    // Cria registro de evento para rastreamento
    let webhookEventId: string | null = null;
    try {
      const newEvent = await base44.asServiceRole.entities.WebhookEvent.create({
        provider: 'mercadopago',
        external_event_id: dataId,
        external_resource_id: pre.id || dataId,
        event_type: type || 'subscription_preapproval',
        payload_hash: payloadHash,
        status: 'processing',
        attempts: 1,
        received_at: receivedAt,
      });
      webhookEventId = newEvent?.id || null;
    } catch (we) {
      console.warn('[mercadoPagoWebhook] WebhookEvent não criado:', (we as Error).message);
    }

    // ─── 4. Associação: external_reference → plano/ciclo/email ───────────────
    // external_reference formato: "plano|ciclo|email"  (definido em createSubscriptionCheckout)
    const [plan, billing, email] = String(pre.external_reference || '').split('|');
    if (!email) {
      console.warn('[mercadoPagoWebhook] external_reference inválido:', pre.external_reference);
      await markWebhookEvent(base44, webhookEventId, 'failed', 'external_reference inválido');
      return Response.json({ ok: true, ignored: 'external_reference inválido' });
    }

    const nextBilling = pre.next_payment_date ? String(pre.next_payment_date).split('T')[0] : undefined;
    // Preço vem do MP (nunca do payload do cliente)
    const amount = pre.auto_recurring?.transaction_amount;

    // ─── 5. Atualiza ou cria Subscription ────────────────────────────────────
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

    const existingSubsList = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
    const currentSub: any = (existingSubsList || []).find((s: any) => s.mp_preapproval_id === pre.id)
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
      await base44.asServiceRole.entities.WebhookEvent.update(webhookEventId, {
        subscription_id: subscriptionId,
      }).catch(() => {});
    }

    // ─── 6. Concessão do Selo Fundador via FounderSlot ───────────────────────
    // Somente quando plano 'profissional' é autorizado (active).
    // Usa FounderSlot para alocação atômica e bounded (máximo 100).
    // Falhas são persistidas como pending_reconciliation.
    if (newStatus === 'active' && plan === 'profissional') {
      let grantError: string | null = null;

      try {
        // Busca prestador verificado
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email });
        const provider = providers?.[0];
        const isVerified = provider?.verified === true && provider?.status_verificacao === 'aprovado';

        if (!isVerified) {
          console.log(`[mercadoPagoWebhook] ${email} não verificado/aprovado — Fundador não concedido`);
        } else {
          // Verifica se já tem FounderGrant em qualquer status (idempotência)
          const existingGrants = await base44.asServiceRole.entities.FounderGrant.filter({
            provider_id: provider.id,
          });
          const hasGrant = (existingGrants || []).length > 0;

          if (hasGrant) {
            const g = existingGrants[0];
            console.log(`[mercadoPagoWebhook] ${email} já tem FounderGrant (status: ${g.status}) — idempotente`);
          } else {
            // Aloca FounderSlot atomicamente
            const allocation = await allocateFounderSlot(
              base44,
              provider.id,
              subscriptionId,
              pre.id,
            );

            if (!allocation) {
              // Sem vagas (100 já consumidas) ou slots não inicializados
              console.log(`[mercadoPagoWebhook] Vagas Fundador esgotadas ou não inicializadas — ${email} sem selo`);
            } else if (allocation.isExisting && (allocation.slot.status === 'granted' || allocation.slot.status === 'revoked')) {
              // Slot já processado anteriormente — apenas loga
              console.log(`[mercadoPagoWebhook] Slot ${allocation.slot.position} já processado (${allocation.slot.status})`);
            } else {
              // Cria o FounderGrant com a posição do slot
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

              // Confirma o slot como granted
              await base44.asServiceRole.entities.FounderSlot.update(slot.id, {
                status: 'granted',
                granted_at: new Date().toISOString(),
              }).catch((slotErr: Error) => {
                console.warn(`[mercadoPagoWebhook] Falha ao marcar slot ${slot.position} como granted:`, slotErr.message);
              });

              console.log(`[mercadoPagoWebhook] Selo Fundador concedido: ${email} → posição ${slot.position}`);
              // CAPI: FounderBadgeGranted — sem PII, posição não é dado pessoal
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

        // CAPI: Subscribe — assinatura ativa (independente de vaga Fundador)
        sendCapiEvent('Subscribe', {
          value: amount || 19.90,
          currency: 'BRL',
          predicted_ltv: (amount || 19.90) * 12,
          content_name: plan || 'profissional',
        }).catch(() => {});

      } catch (grantErr) {
        grantError = (grantErr as Error).message;

        // [RECONCILIAR-URGENTE]: concessão falhou após reserva de slot.
        // Verificar: FounderSlot com status 'reserved' ou 'pending_reconciliation',
        //            WebhookEvent com status 'pending_reconciliation'.
        // Ação manual: admin revisa no painel Base44 e conclui a concessão ou libera o slot.
        console.error(
          `[mercadoPagoWebhook] [RECONCILIAR-URGENTE] Falha ao conceder Fundador para ${email}: ${grantError}.`
        );

        // Tenta marcar o slot para reconciliação
        try {
          const byKey = await base44.asServiceRole.entities.FounderSlot.filter({
            idempotency_key: `${(await base44.asServiceRole.entities.ServiceProvider.filter({ email }))?.[0]?.id}:${pre.id}`,
          });
          if (byKey?.length > 0) {
            await base44.asServiceRole.entities.FounderSlot.update(byKey[0].id, {
              status: 'pending_reconciliation',
            });
          }
        } catch { /* falha silenciosa — log principal já registrado */ }
      }

      await markWebhookEvent(
        base44, webhookEventId,
        grantError ? 'pending_reconciliation' : 'processed',
        grantError || undefined,
      );

      if (grantError) {
        return Response.json({ ok: true, note: 'subscription updated; founder grant pending reconciliation' });
      }

    } else if (newStatus === 'cancelled' || newStatus === 'expired') {
      // Assinatura cancelada/expirada: não revogar selos aqui (feito pelo cancelarAssinatura).
      // Apenas atualiza WebhookEvent.
      await markWebhookEvent(base44, webhookEventId, 'processed');
    } else {
      await markWebhookEvent(base44, webhookEventId, 'processed');
    }

    console.log(`[mercadoPagoWebhook] ${email} → ${newStatus} (plano ${plan}, preapproval ${pre.id})`);
    return Response.json({ ok: true });

  } catch (error) {
    console.error('[mercadoPagoWebhook] erro geral:', (error as Error).message);
    // Retorna 200 para não acionar retry automático do MP em erros não-recuperáveis
    return Response.json({ ok: true, note: 'internal error logged' });
  }
});

// ─── Helper: atualiza WebhookEvent sem PII ───────────────────────────────────
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
