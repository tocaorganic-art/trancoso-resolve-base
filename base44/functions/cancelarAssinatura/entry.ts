import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

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

    // Se for trial: cancela direto sem passar pelo Stripe
    let periodEnd = null;
    if (sub.plan === 'trial' || sub.status === 'trial') {
      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        status: 'cancelled',
        notes: `Trial cancelado pelo prestador em ${new Date().toLocaleDateString('pt-BR')}.`,
      });
      console.log(`[cancelarAssinatura] Trial cancelado para ${user.email}`);
      return Response.json({ ok: true, access_until: null });
    }

    // Cancela no Stripe ao fim do período (cancel_at_period_end = true)
    if (sub.stripe_subscription_id) {
      const stripeSub = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      periodEnd = stripeSub.current_period_end
        ? new Date(stripeSub.current_period_end * 1000).toISOString().split('T')[0]
        : null;
    }

    // Atualiza localmente
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      status: 'cancelled',
      notes: `Cancelado pelo prestador em ${new Date().toLocaleDateString('pt-BR')}. Acesso até: ${periodEnd || sub.next_billing_date || 'fim do período'}`,
    });

    console.log(`[cancelarAssinatura] Assinatura cancelada para ${user.email}`);

    // Email de confirmação (fire-and-forget)
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Cancelamento de assinatura — Trancoso Resolve',
        body: `Olá, ${user.full_name?.split(' ')[0] || 'Prestador'}!\n\nConfirmamos o cancelamento da sua assinatura no Trancoso Resolve.\n\n${periodEnd ? `Você manterá o acesso até ${new Date(periodEnd + 'T00:00:00').toLocaleDateString('pt-BR')}.` : 'O acesso será encerrado ao fim do período atual.'}\n\nSentiremos sua falta! Quando quiser voltar: https://trancosoresolve.base44.app/Planos\n\nDúvidas? contato@tocaexperience.com.br\n\nEquipe Trancoso Resolve 🌊`,
        from_name: 'Trancoso Resolve',
      });
    } catch (emailErr) {
      console.warn('[cancelarAssinatura] email não enviado:', emailErr.message);
    }

    return Response.json({ ok: true, access_until: periodEnd || sub.next_billing_date });
  } catch (error) {
    console.error('[cancelarAssinatura] erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});