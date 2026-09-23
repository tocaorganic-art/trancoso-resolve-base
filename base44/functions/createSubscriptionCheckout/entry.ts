import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getAsaasConfig, getOrCreateAsaasCustomer, asaasFetch } from '../_shared/asaasClient.ts';

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

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const config = getAsaasConfig();
    if (!config) {
      return Response.json({ error: 'Asaas não configurado: ASAAS_API_KEY ausente.' }, { status: 503 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, billing, cpf_cnpj } = await req.json() as { plan?: string; billing?: string; cpf_cnpj?: string };
    const planDef = plan ? PLANS[plan] : undefined;
    if (!planDef) {
      return Response.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // ─── Verificação de trial já consumido ───────────────────────────────────
    // REGRA COMERCIAL IMUTÁVEL (mantida do fluxo Mercado Pago): Teste Gratuito
    // (30d) e trial do Profissional (7d) são mutuamente exclusivos. Quem já
    // usou qualquer trial não recebe outro.
    let effectiveTrialDays = planDef.trialDays;

    if (effectiveTrialDays > 0) {
      try {
        const existingSubs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
        const existingSub = existingSubs?.[0] as { trial_consumed_at?: string } | undefined;
        if (existingSub?.trial_consumed_at) {
          effectiveTrialDays = 0;
          console.log(
            `[createSubscriptionCheckout] Trial anterior consumido em ${existingSub.trial_consumed_at}. ` +
            `Removendo trial do checkout Asaas para ${user.email}.`
          );
        }
      } catch (checkErr) {
        effectiveTrialDays = 0;
        console.warn(
          `[createSubscriptionCheckout] Erro ao verificar trial anterior para ${user.email}: ` +
          `${(checkErr as Error).message}. Prosseguindo sem trial.`
        );
      }
    }

    // ─── CPF/CNPJ obrigatório para o Asaas ────────────────────────────────────
    // O Mercado Pago não exigia documento para criar o preapproval. O Asaas
    // exige cpfCnpj para criar o "customer". Tentamos reaproveitar o CPF já
    // verificado do prestador (ServiceProvider.cpf); se não existir (lojista,
    // cliente, ou prestador ainda não verificado), exigimos que o front envie
    // cpf_cnpj no corpo da requisição (campo de checkout).
    let cpfCnpj = cpf_cnpj || '';
    if (!cpfCnpj) {
      try {
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email: user.email });
        cpfCnpj = providers?.[0]?.cpf || '';
      } catch {
        // não crítico — segue sem, e o getOrCreateAsaasCustomer vai recusar com erro claro
      }
    }
    if (!cpfCnpj) {
      return Response.json({
        error: 'CPF ou CNPJ é obrigatório para gerar a cobrança. Informe cpf_cnpj no checkout.',
      }, { status: 400 });
    }

    const customerResult = await getOrCreateAsaasCustomer(config, {
      name: user.full_name || user.email,
      email: user.email,
      cpfCnpj,
      externalReference: user.email,
    });
    if ('error' in customerResult) {
      console.error('[createSubscriptionCheckout] Erro ao criar cliente Asaas:', customerResult.error);
      return Response.json({ error: customerResult.error }, { status: 502 });
    }

    // ─── Montagem da assinatura ───────────────────────────────────────────────
    const isAnnual = billing === 'annual' && planDef.annual !== null;
    const amount = isAnnual ? planDef.annual! : planDef.monthly;
    const cycle = isAnnual ? 'YEARLY' : 'MONTHLY';

    // Asaas não tem um campo nativo de "free trial" como o preapproval do MP.
    // O padrão recomendado é adiar a primeira cobrança: nextDueDate = hoje +
    // trialDays. O cliente só é cobrado de fato após o período de trial.
    const nextDueDate = toIsoDate(addDays(new Date(), effectiveTrialDays > 0 ? effectiveTrialDays : 1));

    const subscriptionBody = {
      customer: customerResult.id,
      billingType: 'UNDEFINED', // deixa o pagador escolher PIX / boleto / cartão na fatura
      cycle,
      value: amount,
      nextDueDate,
      description: `Trancoso Resolve — ${planDef.nome}${isAnnual ? ' (Anual)' : ''}`,
      externalReference: `${plan}|${isAnnual ? 'annual' : 'monthly'}|${user.email}`,
    };

    const subRes = await asaasFetch<any>(config, '/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionBody),
    });

    if (!subRes.ok || !subRes.data?.id) {
      console.error('[createSubscriptionCheckout] Erro Asaas:', JSON.stringify(subRes.data));
      return Response.json({ error: subRes.data?.errors?.[0]?.description || 'Erro ao criar assinatura no Asaas.' }, { status: 502 });
    }

    const asaasSubscription = subRes.data;

    // Busca a primeira cobrança gerada pela assinatura para obter o link de
    // pagamento (invoiceUrl) — equivalente ao init_point do preapproval MP.
    let invoiceUrl: string | null = null;
    try {
      const paymentsRes = await asaasFetch<{ data?: Array<{ invoiceUrl?: string }> }>(
        config,
        `/payments?subscription=${asaasSubscription.id}&limit=1`,
      );
      invoiceUrl = paymentsRes.data?.data?.[0]?.invoiceUrl || null;
    } catch (fetchPayErr) {
      console.warn('[createSubscriptionCheckout] Não foi possível obter invoiceUrl:', (fetchPayErr as Error).message);
    }

    // ─── Registra/atualiza a Subscription local (estado inicial: pending) ────
    // O status definitivo (active) é confirmado pelo asaasWebhook quando o
    // primeiro pagamento for compensado — igual ao padrão usado com o MP.
    try {
      const existingSubs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
      const patch = {
        user_email: user.email,
        plan,
        billing: isAnnual ? 'annual' : 'monthly',
        status: 'pending',
        payment_method: 'asaas',
        asaas_customer_id: customerResult.id,
        asaas_subscription_id: asaasSubscription.id,
        amount,
      };
      if (existingSubs && existingSubs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, patch);
        if (effectiveTrialDays > 0 && !existingSubs[0].trial_consumed_at) {
          await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
            trial_consumed_at: new Date().toISOString(),
            trial_type: 'profissional_7d',
            trial_version: 1,
            notes: `Trial Profissional 7d iniciado no checkout Asaas — subscription: ${asaasSubscription.id}`,
          });
        }
      } else {
        await base44.asServiceRole.entities.Subscription.create(patch);
      }
    } catch (persistErr) {
      // Não crítico — o webhook também reconcilia o estado a partir do Asaas.
      console.warn('[createSubscriptionCheckout] Erro ao persistir Subscription local:', (persistErr as Error).message);
    }

    console.log(`Checkout Asaas criado: ${asaasSubscription.id} para plano ${plan} (user: ${user.email}, trialDays: ${effectiveTrialDays})`);
    return Response.json({
      url: invoiceUrl,
      asaas_subscription_id: asaasSubscription.id,
      trial_days: effectiveTrialDays,
    });

  } catch (error) {
    console.error('Erro ao criar checkout:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
