import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─── Configuração do Mercado Pago ────────────────────────────────────────────
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
const BASE_URL = 'https://trancosoresolve.com.br';

// ─── Planos disponíveis ───────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; amount: number; trial_days: number }> = {
  gratuito: {
    name: 'Plano Gratuito',
    amount: 0,
    trial_days: 30,
  },
  profissional: {
    name: 'Plano Profissional — Trancoso Resolve',
    amount: 19.90,
    trial_days: 0,
  },
  elite: {
    name: 'Plano Elite — Trancoso Resolve',
    amount: 197.00,
    trial_days: 0,
  },
};

const VAGAS_LANCAMENTO = 50;

Deno.serve(async (req) => {
  try {
    if (!MP_ACCESS_TOKEN) {
      return Response.json({ error: 'MP_ACCESS_TOKEN não configurado. Configure nas variáveis de ambiente do Base44.' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { plan, success_url, cancel_url } = await req.json();

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return Response.json({ error: `Plano inválido: "${plan}". Use: gratuito, profissional ou elite.` }, { status: 400 });
    }

    // ─── Plano Gratuito: apenas cria trial, sem checkout MP ──────────────────
    if (plan === 'gratuito' || planConfig.amount === 0) {
      const today = new Date();
      const trialEnd = new Date(today);
      trialEnd.setDate(trialEnd.getDate() + planConfig.trial_days);

      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
      if (existing && existing.length > 0) {
        return Response.json({ ok: true, note: 'já existe assinatura', plan: 'gratuito' });
      }

      await base44.asServiceRole.entities.Subscription.create({
        user_email: user.email,
        plan: 'gratuito',
        status: 'trial',
        trial_start: today.toISOString().split('T')[0],
        trial_end: trialEnd.toISOString().split('T')[0],
        amount: 0,
        payment_method: 'mercadopago',
        notes: `Trial Gratuito ${planConfig.trial_days} dias criado automaticamente`,
      });

      console.log(`[createSubscriptionCheckout] Trial gratuito criado para ${user.email}`);
      return Response.json({
        ok: true,
        plan: 'gratuito',
        trial_end: trialEnd.toISOString().split('T')[0],
        redirect: success_url || `${BASE_URL}/AssinaturaConfirmada?plano=gratuito`,
      });
    }

    // ─── Verificar vagas (controle interno para Profissional) ─────────────────
    if (plan === 'profissional') {
      const activeSubs = await base44.asServiceRole.entities.Subscription.filter({ plan: 'profissional', status: 'active' });
      const trialSubs = await base44.asServiceRole.entities.Subscription.filter({ plan: 'profissional', status: 'trial' });
      const total = (activeSubs?.length || 0) + (trialSubs?.length || 0);
      if (total >= VAGAS_LANCAMENTO) {
        return Response.json({
          error: 'vagas_esgotadas',
          message: 'As vagas do Plano Profissional estão esgotadas. Escolha o Plano Elite.',
          redirect_to: 'elite',
        }, { status: 409 });
      }
    }

    // ─── Criar Preapproval no Mercado Pago (assinatura recorrente) ────────────
    const successUrl = success_url || `${BASE_URL}/AssinaturaConfirmada?plano=${plan}`;

    const preapprovalBody = {
      reason: planConfig.name,
      external_reference: user.email,
      payer_email: user.email,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planConfig.amount,
        currency_id: 'BRL',
      },
      back_url: successUrl,
      status: 'pending',
    };

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preapprovalBody),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok || !mpData.init_point) {
      console.error('[createSubscriptionCheckout] Erro MP:', JSON.stringify(mpData));
      return Response.json({
        error: mpData.message || 'Erro ao criar checkout no Mercado Pago',
        details: mpData,
      }, { status: 500 });
    }

    // ─── Registra a tentativa no Base44 ──────────────────────────────────────
    const today = new Date();
    try {
      const existingSubs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
      if (!existingSubs || existingSubs.length === 0) {
        await base44.asServiceRole.entities.Subscription.create({
          user_email: user.email,
          plan,
          status: 'pending',
          amount: planConfig.amount,
          payment_method: 'mercadopago',
          mp_preapproval_id: mpData.id,
          notes: `Checkout MP iniciado em ${today.toISOString()}`,
        });
      } else {
        await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
          plan,
          status: 'pending',
          amount: planConfig.amount,
          payment_method: 'mercadopago',
          mp_preapproval_id: mpData.id,
          notes: `Checkout MP atualizado em ${today.toISOString()}`,
        });
      }
    } catch (dbErr) {
      console.warn('[createSubscriptionCheckout] Erro ao registrar no DB (não crítico):', dbErr.message);
    }

    console.log(`[createSubscriptionCheckout] Preapproval MP criado: ${mpData.id} | plano: ${plan} | user: ${user.email}`);

    return Response.json({
      url: mpData.init_point,
      preapproval_id: mpData.id,
      plan,
    });

  } catch (error) {
    console.error('[createSubscriptionCheckout] Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
