import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');

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

    // ─── Cancelar no Mercado Pago (se tiver preapproval_id) ──────────────────
    let periodEnd = sub.next_billing_date || null;

    if (sub.mp_preapproval_id && MP_ACCESS_TOKEN) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${sub.mp_preapproval_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        const mpData = await mpRes.json();
        console.log(`[cancelarAssinatura] MP cancelado: ${sub.mp_preapproval_id}`, mpData.status);
      } catch (mpErr) {
        console.warn('[cancelarAssinatura] Erro ao cancelar no MP (não crítico):', mpErr.message);
      }
    }

    // ─── Atualiza status no Base44 ────────────────────────────────────────────
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      status: 'cancelled',
      notes: `Cancelado pelo prestador em ${new Date().toLocaleDateString('pt-BR')}. Acesso até: ${periodEnd || 'fim do período'}`,
    });

    console.log(`[cancelarAssinatura] Assinatura cancelada para ${user.email}`);

    // ─── Email de confirmação (fire-and-forget) ───────────────────────────────
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Cancelamento de assinatura — Trancoso Resolve',
        body: `Olá, ${user.full_name?.split(' ')[0] || 'Prestador'}!\n\nConfirmamos o cancelamento da sua assinatura no Trancoso Resolve.\n\n${periodEnd ? `Você manterá o acesso até ${new Date(periodEnd + 'T00:00:00').toLocaleDateString('pt-BR')}.` : 'O acesso será encerrado ao fim do período atual.'}\n\nSentiremos sua falta! Quando quiser voltar: https://trancosoresolve.com.br/Planos\n\nDúvidas? contato@tocaexperience.com.br\n\nEquipe Trancoso Resolve 🌊`,
        from_name: 'Trancoso Resolve',
      });
    } catch (emailErr) {
      console.warn('[cancelarAssinatura] email não enviado:', emailErr.message);
    }

    return Response.json({ ok: true, access_until: periodEnd });

  } catch (error) {
    console.error('[cancelarAssinatura] erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
