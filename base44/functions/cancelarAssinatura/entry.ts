import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
    const sub = subs?.[0];

    if (!sub) {
      return Response.json({ error: 'Nenhuma assinatura encontrada.' }, { status: 404 });
    }

    if (sub.status === 'cancelled') {
      return Response.json({ error: 'Assinatura já cancelada.' }, { status: 400 });
    }

    // Se for trial sem assinatura MP: cancela direto
    if ((sub.plan === 'trial' || sub.status === 'trial') && !sub.mp_preapproval_id) {
      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        status: 'cancelled',
        notes: `Trial cancelado pelo prestador em ${new Date().toLocaleDateString('pt-BR')}.`,
      });
      console.log(`[cancelarAssinatura] Trial cancelado para ${user.email}`);
      return Response.json({ ok: true, access_until: null });
    }

    // Cancela a assinatura (preapproval) no Mercado Pago
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

    // Atualiza localmente
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      status: 'cancelled',
      notes: `Cancelado pelo prestador em ${new Date().toLocaleDateString('pt-BR')}. Acesso até: ${periodEnd || 'fim do período'}`,
    });

    // ─── Revoga definitivamente o Selo Prestador Fundador ──────────────────
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
      console.warn('[cancelarAssinatura] erro ao revogar selo Fundador:', (revokeErr as Error).message);
    }

    console.log(`[cancelarAssinatura] Assinatura cancelada para ${user.email}`);

    // Email de confirmação (fire-and-forget)
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Cancelamento de assinatura — Trancoso Resolve',
        body: `Olá, ${user.full_name?.split(' ')[0] || 'Prestador'}!\n\nConfirmamos o cancelamento da sua assinatura no Trancoso Resolve.\n\n${periodEnd ? `Você manterá o acesso até ${new Date(periodEnd + 'T00:00:00').toLocaleDateString('pt-BR')}.` : 'O acesso será encerrado ao fim do período atual.'}\n\nSentiremos sua falta! Quando quiser voltar: https://trancosoresolve.com.br/Planos\n\nDúvidas? contato@tocaexperience.com.br\n\nEquipe Trancoso Resolve 🌊`,
        from_name: 'Trancoso Resolve',
      });
    } catch (emailErr) {
      console.warn('[cancelarAssinatura] email não enviado:', (emailErr as Error).message);
    }

    return Response.json({ ok: true, access_until: periodEnd });
  } catch (error) {
    console.error('[cancelarAssinatura] erro:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});