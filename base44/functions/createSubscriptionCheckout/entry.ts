import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Planos e preços (BRL) ───────────────────────────────────────────────────
interface PlanDef { nome: string; monthly: number; annual: number | null; trialDays: number; }
const PLANS: Record<string, PlanDef> = {
  profissional:      { nome: 'Plano Profissional',               monthly: 19.90, annual: 199,  trialDays: 7 },
  prestador_elite:   { nome: 'Plano Premium Elite',              monthly: 197,   annual: 1970, trialDays: 7 },
  lojista_essencial: { nome: 'Plano Lojista Essencial',          monthly: 89,    annual: 890,  trialDays: 7 },
  lojista_pro:       { nome: 'Plano Lojista Pro',                monthly: 197,   annual: 1970, trialDays: 7 },
  lojista_elite:     { nome: 'Plano Lojista Elite',              monthly: 497,   annual: 4970, trialDays: 7 },
  boost_prestador:   { nome: 'Boost Alta Temporada (Prestador)', monthly: 99,    annual: null, trialDays: 0 },
  boost_lojista:     { nome: 'Boost Alta Temporada (Lojista)',   monthly: 197,   annual: null, trialDays: 0 },
};

const BASE_URL = 'https://trancosoresolve.com.br';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpToken) {
      return Response.json({ error: 'Mercado Pago não configurado: MP_ACCESS_TOKEN ausente.' }, { status: 503 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, billing } = await req.json() as { plan?: string; billing?: string };
    const planDef = plan ? PLANS[plan] : undefined;
    if (!planDef) {
      return Response.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // ─── Verificação de trial já consumido ───────────────────────────────────
    // REGRA COMERCIAL IMUTÁVEL: Teste Gratuito (30d) e trial do Profissional (7d)
    // são mutuamente exclusivos. Quem já usou qualquer trial não recebe outro.
    // Isso evita acúmulo de 30 + 7 = 37 dias gratuitos.
    //
    // Se a assinatura existente tiver trial_consumed_at preenchido, zeramos
    // trialDays para que o Mercado Pago não inclua free_trial no preapproval.
    let effectiveTrialDays = planDef.trialDays;

    if (effectiveTrialDays > 0) {
      try {
        const existingSubs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
        const existingSub = existingSubs?.[0] as { trial_consumed_at?: string } | undefined;
        if (existingSub?.trial_consumed_at) {
          effectiveTrialDays = 0;
          console.log(
            `[createSubscriptionCheckout] Trial anterior consumido em ${existingSub.trial_consumed_at}. ` +
            `Removendo free_trial do checkout para ${user.email}.`
          );
        }
      } catch (checkErr) {
        // Fail-closed: se não conseguiu verificar, não concede trial extra por segurança
        effectiveTrialDays = 0;
        console.warn(
          `[createSubscriptionCheckout] Erro ao verificar trial anterior para ${user.email}: ` +
          `${(checkErr as Error).message}. Prosseguindo sem trial.`
        );
      }
    }

    // ─── Montagem do preapproval ──────────────────────────────────────────────
    const isAnnual = billing === 'annual' && planDef.annual !== null;
    const amount = isAnnual ? planDef.annual! : planDef.monthly;

    const preapprovalBody = {
      reason: `Trancoso Resolve — ${planDef.nome}${isAnnual ? ' (Anual)' : ''}`,
      external_reference: `${plan}|${isAnnual ? 'annual' : 'monthly'}|${user.email}`,
      payer_email: user.email,
      auto_recurring: {
        frequency: isAnnual ? 12 : 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'BRL',
        ...(effectiveTrialDays > 0
          ? { free_trial: { frequency: effectiveTrialDays, frequency_type: 'days' } }
          : {}),
      },
      back_url: `${BASE_URL}/AssinaturaConfirmada`,
      status: 'pending',
    };

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preapprovalBody),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      console.error('[createSubscriptionCheckout] Erro MP:', JSON.stringify(mpData));
      return Response.json({ error: mpData.message || 'Erro ao criar assinatura no Mercado Pago.' }, { status: 502 });
    }

    // ─── Registra consumo do trial no banco (caso trial Profissional de 7d) ──
    // Somente quando effectiveTrialDays > 0 e o checkout inclui free_trial.
    // Isso garante que o trial de 7d do Profissional também marca trial_consumed_at.
    if (effectiveTrialDays > 0) {
      try {
        const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
        if (subs && subs.length > 0) {
          const sub = subs[0] as { id: string; trial_consumed_at?: string };
          if (!sub.trial_consumed_at) {
            await base44.asServiceRole.entities.Subscription.update(sub.id, {
              trial_consumed_at: new Date().toISOString(),
              trial_type: 'profissional_7d',
              trial_version: 1,
              notes: `Trial Profissional 7d iniciado no checkout — preapproval: ${mpData.id}`,
            });
          }
        }
      } catch (markErr) {
        // Não crítico — bloquear o checkout seria pior que não marcar agora.
        // O mercadoPagoWebhook também pode marcar trial_consumed_at quando a assinatura for autorizada.
        console.warn('[createSubscriptionCheckout] Erro ao registrar trial_consumed_at:', (markErr as Error).message);
      }
    }

    console.log(`Checkout MP criado: ${mpData.id} para plano ${plan} (user: ${user.email}, trialDays: ${effectiveTrialDays})`);
    return Response.json({ url: mpData.init_point, preapproval_id: mpData.id, trial_days: effectiveTrialDays });

  } catch (error) {
    console.error('Erro ao criar checkout:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
