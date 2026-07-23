import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Planos e preços (BRL) ───────────────────────────────────────────────────
interface PlanDef { nome: string; monthly: number; annual: number | null; trialDays: number; }
const PLANS: Record<string, PlanDef> = {
  profissional:      { nome: 'Plano Profissional',            monthly: 19.90, annual: 199,  trialDays: 30 },
  prestador_elite:   { nome: 'Plano Premium Elite',           monthly: 197,   annual: 1970, trialDays: 7 },
  lojista_essencial: { nome: 'Plano Lojista Essencial',       monthly: 89,    annual: 890,  trialDays: 7 },
  lojista_pro:       { nome: 'Plano Lojista Pro',             monthly: 197,   annual: 1970, trialDays: 7 },
  lojista_elite:     { nome: 'Plano Lojista Elite',           monthly: 497,   annual: 4970, trialDays: 7 },
  boost_prestador:   { nome: 'Boost Alta Temporada (Prestador)', monthly: 99,  annual: null, trialDays: 0 },
  boost_lojista:     { nome: 'Boost Alta Temporada (Lojista)',   monthly: 197, annual: null, trialDays: 0 },
};

const VAGAS_FUNDADOR = 100;
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

    // ─── Limite de vagas do preço de lançamento (Fundador) ────────────────────
    if (plan === 'profissional') {
      const subs = await base44.asServiceRole.entities.Subscription.list('-created_date', 500);
      const taken = (subs || []).filter((s: { status?: string; plan?: string }) =>
        (s.status === 'active' || s.status === 'trial') &&
        ['profissional', 'lancamento', 'prestador_profissional'].includes(s.plan as string)
      ).length;
      if (taken >= VAGAS_FUNDADOR) {
        return Response.json({
          error: 'vagas_esgotadas',
          message: 'As vagas do preço de lançamento estão esgotadas. Escolha outro plano para continuar.',
        }, { status: 409 });
      }
    }

    const isAnnual = billing === 'annual' && planDef.annual !== null;
    const amount = isAnnual ? planDef.annual : planDef.monthly;

    const preapprovalBody = {
      reason: `Trancoso Resolve — ${planDef.nome}${isAnnual ? ' (Anual)' : ''}`,
      external_reference: `${plan}|${isAnnual ? 'annual' : 'monthly'}|${user.email}`,
      payer_email: user.email,
      auto_recurring: {
        frequency: isAnnual ? 12 : 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'BRL',
        ...(planDef.trialDays > 0
          ? { free_trial: { frequency: planDef.trialDays, frequency_type: 'days' } }
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

    console.log(`Checkout MP criado: ${mpData.id} para plano ${plan} (user: ${user.email})`);
    return Response.json({ url: mpData.init_point, preapproval_id: mpData.id });

  } catch (error) {
    console.error('Erro ao criar checkout:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
