import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── CAPI inline helper ────────────────────────────────────────────────
async function sendCapiEvent(eventName: string, customData: Record<string, unknown> = {}): Promise<void> {
  const accessToken = Deno.env.get('META_CONVERSIONS_API_TOKEN');
  if (!accessToken) return;
  const pixelId = '908361385639766';
  try {
    await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{ event_name: eventName, event_time: Math.floor(Date.now() / 1000), event_id: crypto.randomUUID(), action_source: 'website', custom_data: customData }],
      }),
    });
  } catch { /* analytics não pode quebrar o fluxo */ }
}

// ─── cancelarAssinatura ───────────────────────────────────────────────────────
// Cancela a assinatura do prestador autenticado.
//
// REGRAS COMERCIAIS IMUTÁVEIS:
//   - Cancelamento → perda DEFINITIVA do Selo Fundador.
//   - Retorno futuro NÃO restaura o selo.
//   - FounderSlot permanece consumido (status 'revoked').
//   - Posição revogada não volta ao pool dos 100.
//
// PROTEÇÕES:
//   1. Ownership validada no servidor (nunca no payload).
//   2. Idempotência: segunda chamada retorna { ok: true, already_cancelled: true }.
//   3. Revogação do FounderGrant + FounderSlot com [RECONCILIAR-URGENTE] se falhar.
//   4. Logs sem PII de terceiros.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ─── 1. Autenticação ──────────────────────────────────────────────────────
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // ─── 2. Busca assinatura pelo email do usuário autenticado ────────────────
    // Nunca usa email do payload — ownership garantida pelo token.
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
    const sub = subs?.[0];

    if (!sub) {
      return Response.json({ error: 'Nenhuma assinatura encontrada.' }, { status: 404 });
    }

    // ─── 3. Idempotência: já estava cancelada ────────────────────────────────
    if (sub.status === 'cancelled') {
      return Response.json({ ok: true, already_cancelled: true });
    }

    // ─── 4. Trial sem MP: cancela diretamente ────────────────────────────────
    if ((sub.plan === 'trial' || sub.status === 'trial') && !sub.mp_preapproval_id) {
      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        status: 'cancelled',
        notes: `Trial cancelado em ${new Date().toISOString()}.`,
      });
      console.log('[cancelarAssinatura] Trial cancelado');
      return Response.json({ ok: true, access_until: null });
    }

    // ─── 5. Cancela no Mercado Pago ───────────────────────────────────────────
    if (sub.mp_preapproval_id) {
      const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
      if (!mpToken) {
        return Response.json({ error: 'MP_ACCESS_TOKEN ausente.' }, { status: 503 });
      }

      // Verifica estado atual no MP antes de chamar PUT
      const mpCheckRes = await fetch(`https://api.mercadopago.com/preapproval/${sub.mp_preapproval_id}`, {
        headers: { 'Authorization': `Bearer ${mpToken}` },
      });
      if (mpCheckRes.ok) {
        const mpCheck = await mpCheckRes.json();
        if (mpCheck.status !== 'cancelled') {
          // Só cancela se ainda não estiver cancelada no MP
          const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${sub.mp_preapproval_id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${mpToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'cancelled' }),
          });
          if (!mpRes.ok) {
            const mpErr = await mpRes.json().catch(() => ({}));
            const errMsg = (mpErr as any).message || `HTTP ${mpRes.status}`;
            console.error('[cancelarAssinatura] Erro ao cancelar no MP:', mpRes.status);
            return Response.json({ error: `Erro ao cancelar no Mercado Pago: ${errMsg}` }, { status: 502 });
          }
        }
        // Se já estava cancelled no MP, prossegue idempotentemente
      }
      // Se não conseguiu verificar estado no MP (erro de rede), prossegue com cancelamento local
    }

    const periodEnd = sub.next_billing_date || null;

    // ─── 6. Atualiza assinatura localmente ────────────────────────────────────
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      status: 'cancelled',
      notes: `Cancelado em ${new Date().toISOString()}. Acesso até: ${periodEnd || 'imediato'}.`,
    });

    // ─── 7. Revoga FounderGrant e FounderSlot ────────────────────────────────
    // REGRA COMERCIAL: cancelamento → selo revogado definitivamente.
    // FounderSlot permanece 'revoked' — nunca volta a 'available'.
    let revokeError: string | null = null;

    try {
      // Busca prestador para obter provider_id
      const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email: user.email });
      const provider = providers?.[0];

      // Revoga FounderGrant
      const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
      const activeGrant = (grants || []).find(
        (g: any) => g.provider_email === user.email && g.status === 'active'
      );

      if (activeGrant) {
        await base44.asServiceRole.entities.FounderGrant.update(activeGrant.id, {
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revocation_reason: `Cancelamento de assinatura em ${new Date().toISOString()}`,
        });
        console.log('[cancelarAssinatura] FounderGrant revogado');
      }

      // Revoga FounderSlot correspondente (se existir)
      if (provider?.id) {
        const slots = await base44.asServiceRole.entities.FounderSlot.filter({
          provider_id: provider.id,
        });
        const grantedSlot = (slots || []).find((s: any) => s.status === 'granted' || s.status === 'reserved');
        if (grantedSlot) {
          await base44.asServiceRole.entities.FounderSlot.update(grantedSlot.id, {
            status: 'revoked',
            revoked_at: new Date().toISOString(),
          });
          console.log(`[cancelarAssinatura] FounderSlot ${grantedSlot.position} revogado`);
        }
      }
    } catch (revokeErr) {
      revokeError = (revokeErr as Error).message;
      // [RECONCILIAR-URGENTE]: assinatura cancelada mas FounderGrant/FounderSlot pode
      // ainda estar ativo. Admin deve revogar manualmente:
      //   1. Base44 → FounderGrant → filtrar por provider_email → status: revoked
      //   2. Base44 → FounderSlot → filtrar por provider_id → status: revoked
      console.error(
        `[cancelarAssinatura] [RECONCILIAR-URGENTE] Falha ao revogar selo: ${revokeError}. ` +
        `Assinatura CANCELADA mas FounderGrant/FounderSlot pode ainda estar ativo. Ação manual necessária.`
      );
    }

    // ─── 8. Email de confirmação (fire-and-forget) ───────────────────────────
    try {
      const firstName = (user.full_name || '').split(' ')[0] || 'Prestador';
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Cancelamento de assinatura — Trancoso Resolve',
        body: `Olá, ${firstName}!\n\nConfirmamos o cancelamento da sua assinatura no Trancoso Resolve.\n\n` +
          `${periodEnd
            ? `Você manterá o acesso até ${new Date(periodEnd + 'T00:00:00').toLocaleDateString('pt-BR')}.`
            : 'O acesso foi encerrado.'
          }\n\n` +
          `Quando quiser voltar: https://trancosoresolve.com.br/Planos\n\n` +
          `Obs.: caso tenha sido Prestador Fundador, o Selo Fundador não é recuperado automaticamente ao retornar.\n\n` +
          `Dúvidas? contato@tocaexperience.com.br\n\nEquipe Trancoso Resolve 🌊`,
        from_name: 'Trancoso Resolve',
      });
    } catch (emailErr) {
      console.warn('[cancelarAssinatura] email não enviado:', (emailErr as Error).message);
    }

    console.log('[cancelarAssinatura] Cancelamento concluído' + (revokeError ? ' — RECONCILIAÇÃO PENDENTE' : ''));

    // CAPI: CancelSubscription — sem PII
    sendCapiEvent('CancelSubscription', {}).catch(() => {});

    return Response.json({
      ok: true,
      access_until: periodEnd,
      ...(revokeError ? { warning: 'founder_badge_revocation_pending' } : {}),
    });

  } catch (error) {
    console.error('[cancelarAssinatura] erro:', (error as Error).message);
    return Response.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
});
