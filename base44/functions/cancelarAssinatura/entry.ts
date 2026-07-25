import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cancela a assinatura do prestador autenticado.
//
// Proteções implementadas:
// 1. Ownership validada no servidor — apenas o próprio usuário autenticado cancela
// 2. Idempotência — assinatura já cancelada retorna erro informativo (não reprocessa)
// 3. Revogação do Selo Fundador é persistida em log de reconciliação se falhar
// 4. Falha de revogação marca "[RECONCILIAR-URGENTE]" nos logs para ação manual

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ─── 1. Autenticação e validação de ownership ────────────────────────────
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca assinatura pelo email do usuário autenticado — nunca pelo payload
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
    const sub = subs?.[0];

    if (!sub) {
      return Response.json({ error: 'Nenhuma assinatura encontrada.' }, { status: 404 });
    }

    // ─── 2. Idempotência ────────────────────────────────────────────────────
    if (sub.status === 'cancelled') {
      return Response.json({ error: 'Assinatura já cancelada.' }, { status: 400 });
    }

    // ─── 3. Trial sem MP: cancela direto ────────────────────────────────────
    if ((sub.plan === 'trial' || sub.status === 'trial') && !sub.mp_preapproval_id) {
      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        status: 'cancelled',
        notes: `Trial cancelado pelo prestador em ${new Date().toLocaleDateString('pt-BR')}.`,
      });
      console.log(`[cancelarAssinatura] Trial cancelado para ${user.email}`);
      return Response.json({ ok: true, access_until: null });
    }

    // ─── 4. Cancela no Mercado Pago ─────────────────────────────────────────
    if (sub.mp_preapproval_id) {
      const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
      if (!mpToken) {
        return Response.json({ error: 'Mercado Pago não configurado: MP_ACCESS_TOKEN ausente.' }, { status: 503 });
      }
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${sub.mp_preapproval_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mpToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!mpRes.ok) {
        const mpErr = await mpRes.json();
        console.error('[cancelarAssinatura] Erro MP:', JSON.stringify(mpErr));
        return Response.json({ error: 'Erro ao cancelar no Mercado Pago. Tente novamente.' }, { status: 502 });
      }
    }

    const periodEnd = sub.next_billing_date || null;

    // ─── 5. Atualiza assinatura localmente ───────────────────────────────────
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      status: 'cancelled',
      notes: `Cancelado pelo prestador em ${new Date().toLocaleDateString('pt-BR')}. Acesso até: ${periodEnd || 'fim do período'}`,
    });

    // ─── 6. Revoga definitivamente o Selo Fundador ───────────────────────────
    // REGRA COMERCIAL IMUTÁVEL: cancelamento → perda definitiva do Selo Fundador.
    // O FounderGrant fica revogado permanentemente. Retorno futuro NÃO restaura o selo.
    // Se a revogação falhar, o estado é logado com marcador [RECONCILIAR-URGENTE]
    // para que o admin possa corrigir manualmente via painel.
    let revokeError: string | null = null;
    try {
      const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
      const active = (grants || []).find(
        (g: { provider_email?: string; status?: string }) =>
          g.provider_email === user.email && g.status === 'active'
      );
      if (active) {
        await base44.asServiceRole.entities.FounderGrant.update(active.id, {
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revocation_reason: `Cancelamento de assinatura em ${new Date().toLocaleDateString('pt-BR')}`,
        });
        console.log(`[cancelarAssinatura] Selo Fundador revogado para ${user.email}`);
      }
    } catch (revokeErr) {
      revokeError = (revokeErr as Error).message;
      // [RECONCILIAR-URGENTE]: assinatura cancelada mas FounderGrant ainda ativo.
      // Ação: admin deve revogar manualmente via painel Base44 → FounderGrant.
      console.error(
        `[cancelarAssinatura] [RECONCILIAR-URGENTE] Falha ao revogar FounderGrant para ${user.email}: ${revokeError}. ` +
        `Assinatura já cancelada. FounderGrant pode estar ainda como 'active'. Ação manual necessária.`
      );
    }

    console.log(`[cancelarAssinatura] Assinatura cancelada para ${user.email}${revokeError ? ' — ATENÇÃO: revogação do selo pendente' : ''}`);

    // ─── 7. Email de confirmação (fire-and-forget) ───────────────────────────
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Cancelamento de assinatura — Trancoso Resolve',
        body: `Olá, ${user.full_name?.split(' ')[0] || 'Prestador'}!\n\nConfirmamos o cancelamento da sua assinatura no Trancoso Resolve.\n\n${periodEnd ? `Você manterá o acesso até ${new Date(periodEnd + 'T00:00:00').toLocaleDateString('pt-BR')}.` : 'O acesso será encerrado ao fim do período atual.'}\n\nSentiremos sua falta! Quando quiser voltar: https://trancosoresolve.com.br/Planos\n\nObservação importante: caso você tenha sido um Prestador Fundador, o Selo Fundador não é recuperado automaticamente ao retornar.\n\nDúvidas? contato@tocaexperience.com.br\n\nEquipe Trancoso Resolve 🌊`,
        from_name: 'Trancoso Resolve',
      });
    } catch (emailErr) {
      console.warn('[cancelarAssinatura] email não enviado:', (emailErr as Error).message);
    }

    return Response.json({
      ok: true,
      access_until: periodEnd,
      ...(revokeError ? { warning: 'founder_badge_revocation_pending' } : {}),
    });
  } catch (error) {
    console.error('[cancelarAssinatura] erro:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
