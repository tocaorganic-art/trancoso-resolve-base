import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { maskEmail } from './piiMask.ts';

// ─── MIGRAÇÃO ASAAS (12/09/2026) ──────────────────────────────────────────────
// Substitui a integração Mercado Pago (problema na conta jurídica do MP).
// Fluxo: cria (ou reaproveita) o Customer no Asaas, cria a Subscription e
// redireciona o usuário para a fatura da primeira cobrança (invoiceUrl),
// onde ele escolhe Pix / boleto / cartão.
//
// Trial (regra comercial imutável): o Asaas não tem free_trial nativo —
// implementamos via nextDueDate = hoje + trialDays (primeira cobrança futura).
//
// Secrets: ASAAS_API_KEY (obrigatória), ASAAS_ENV ('sandbox' para testes).

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

function asaasBaseUrl(): string {
  return Deno.env.get('ASAAS_ENV') === 'sandbox'
    ? 'https://api-sandbox.asaas.com'
    : 'https://api.asaas.com';
}

async function asaasFetch(apiKey: string, path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${asaasBaseUrl()}${path}`, {
    ...init,
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'TrancosoResolve/1.0',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ─── Customer: reaproveita por email ou cria ─────────────────────────────────
async function getOrCreateCustomer(
  apiKey: string,
  email: string,
  name: string,
  cpfCnpj?: string | null,
): Promise<string> {
  const search = await asaasFetch(apiKey, `/v3/customers?email=${encodeURIComponent(email)}`);
  const existing = search.data?.data?.[0];
  if (existing) {
    // Asaas exige CPF/CNPJ no cliente para criar cobranças — completa se faltar
    if (cpfCnpj && !existing.cpfCnpj) {
      await asaasFetch(apiKey, `/v3/customers/${existing.id}`, {
        method: 'POST',
        body: JSON.stringify({ cpfCnpj }),
      });
    }
    return existing.id;
  }

  const created = await asaasFetch(apiKey, '/v3/customers', {
    method: 'POST',
    body: JSON.stringify({ name: name || email, email, ...(cpfCnpj ? { cpfCnpj } : {}) }),
  });
  if (!created.ok) {
    throw new Error(created.data?.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
  }
  return created.data.id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const apiKey = Deno.env.get('ASAAS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Asaas não configurado: ASAAS_API_KEY ausente.' }, { status: 503 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── REGRA (Tony, 13/10/2026): ordem do pagamento sem cartão no cadastro ──
    // Enquanto o Teste Gratuito estiver em andamento, nenhuma assinatura paga
    // pode ser iniciada (sem cobranças no período). Ordem correta: teste grátis
    // termina → prestador escolhe assinar (método escolhido no checkout).
    // Fail-closed: se não conseguir verificar, recusa o checkout.
    try {
      const todayISO = new Date().toISOString().split('T')[0];
      const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
      const activeTrial = (subs || []).find((sub: { status?: string; trial_end?: string }) =>
        sub.status === 'trial' && sub.trial_end && todayISO <= sub.trial_end
      );
      if (activeTrial) {
        const endBR = (activeTrial.trial_end as string).split('-').reverse().join('/');
        return Response.json({
          error: 'trial_ativo',
          message: `Seu Teste Gratuito está ativo até ${endBR}. Nenhuma cobrança é feita nesse período, você poderá assinar um plano quando ele terminar.`,
        });
      }
    } catch (trialCheckErr) {
      console.warn(`[createSubscriptionCheckout] Erro ao verificar trial ativo para ${maskEmail(user.email)}: ${(trialCheckErr as Error).message}`);
      return Response.json({ error: 'trial_ativo', message: 'Não foi possível verificar seu período de teste. Tente novamente em instantes.' });
    }

    const { plan, billing, method, cpf_cnpj } = await req.json() as { plan?: string; billing?: string; method?: string; cpf_cnpj?: string };
    const planDef = plan ? PLANS[plan] : undefined;
    if (!planDef) {
      return Response.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // ─── Verificação de trial já consumido ───────────────────────────────────
    // REGRA COMERCIAL IMUTÁVEL: Teste Gratuito (30d) e trial do Profissional (7d)
    // são mutuamente exclusivos. Quem já usou qualquer trial não recebe outro.
    let effectiveTrialDays = planDef.trialDays;

    if (effectiveTrialDays > 0) {
      try {
        const existingSubs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
        const existingSub = existingSubs?.[0] as { trial_consumed_at?: string } | undefined;
        if (existingSub?.trial_consumed_at) {
          effectiveTrialDays = 0;
          console.log(
            `[createSubscriptionCheckout] Trial anterior consumido em ${existingSub.trial_consumed_at}. ` +
            `Removendo trial do checkout para ${maskEmail(user.email)}.`
          );
        }
      } catch (checkErr) {
        // Fail-closed: se não conseguiu verificar, não concede trial extra
        effectiveTrialDays = 0;
        console.warn(
          `[createSubscriptionCheckout] Erro ao verificar trial anterior para ${maskEmail(user.email)}: ` +
          `${(checkErr as Error).message}. Prosseguindo sem trial.`
        );
      }
    }

    const isAnnual = billing === 'annual' && planDef.annual !== null;
    const amount = isAnnual ? planDef.annual! : planDef.monthly;

    // ─── Documento do prestador (Asaas exige CPF/CNPJ p/ cobrança) ────────────
    let customerDoc: string | null = (cpf_cnpj || '').replace(/\D/g, '') || null;
    if (!customerDoc) {
      try {
        let providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email: user.email });
        if (!providers?.length) {
          providers = await base44.asServiceRole.entities.ServiceProvider.filter({ created_by: user.email });
        }
        const provider = providers?.[0] as { id?: string; cnpj?: string } | undefined;
        const cnpjPublico = ((provider?.cnpj || '') as string).replace(/\D/g, '');
        if (cnpjPublico) {
          customerDoc = cnpjPublico;
        } else if (provider?.id) {
          // CPF fica em ServiceProviderPrivate (separação LGPD do app)
          const privs = await base44.asServiceRole.entities.ServiceProviderPrivate.filter({ service_provider_id: provider.id });
          const priv = privs?.[0] as { cpf?: string; cnpj?: string } | undefined;
          const doc = ((priv?.cnpj || '') as string).replace(/\D/g, '') || ((priv?.cpf || '') as string).replace(/\D/g, '');
          if (doc) customerDoc = doc;
        }
      } catch (lookupErr) {
        console.warn('[createSubscriptionCheckout] Lookup ServiceProvider falhou:', (lookupErr as Error).message);
      }
    }
    if (!customerDoc) {
      return Response.json(
        { error: 'CPF/CNPJ não encontrado. Complete seu cadastro de prestador antes de assinar.' },
        { status: 400 },
      );
    }

    // ─── Customer no Asaas ────────────────────────────────────────────────────
    const customerId = await getOrCreateCustomer(apiKey, user.email, (user as any).full_name || (user as any).name, customerDoc);

    // ─── Trial via nextDueDate (primeira cobrança em X dias) ─────────────────
    const today = new Date();
    const firstDue = new Date(today.getTime() + effectiveTrialDays * 24 * 60 * 60 * 1000);
    const nextDueDate = firstDue.toISOString().split('T')[0];

    // billingType: PIX | BOLETO | CREDIT_CARD | DINAMICO (cliente escolhe na fatura)
    // DINAMICO é convertido silenciosamente para BOLETO pela conta — default PIX
    let billingType = (method || 'PIX').toUpperCase();

    // ─── CARTÃO: Asaas Checkout RECURRENT (PCI-safe) ─────────────────────────
    // Assinatura CREDIT_CARD exige cartão validado na própria criação (doc Asaas:
    // FAQ Assinaturas). O app NUNCA captura dados de cartão: o cliente preenche
    // na página hospedada do Asaas (Checkout RECURRENT), que cria a assinatura
    // com o cartão tokenizado para as cobranças futuras.
    if (billingType === 'CREDIT_CARD') {
      const externalRef = `${plan}|${isAnnual ? 'annual' : 'monthly'}|${user.email}`;
      const checkoutBody: Record<string, unknown> = {
        billingTypes: ['CREDIT_CARD'],
        chargeTypes: ['RECURRENT'],
        minutesToExpire: 120,
        externalReference: externalRef,
        customer: customerId,
        callback: {
          successUrl: `${BASE_URL}/AssinaturaConfirmada?trial=${effectiveTrialDays}`,
          cancelUrl: `${BASE_URL}/Planos`,
          expiredUrl: `${BASE_URL}/Planos`,
        },
        items: [{
          name: `Trancoso Resolve: ${planDef.nome}${isAnnual ? ' (Anual)' : ''}`,
          description: 'Assinatura Trancoso Resolve — sem comissão sobre os serviços.',
          quantity: 1,
          value: amount,
        }],
        subscription: {
          cycle: isAnnual ? 'YEARLY' : 'MONTHLY',
          nextDueDate,
        },
      };

      let checkoutRes = await asaasFetch(apiKey, '/v3/checkouts', {
        method: 'POST',
        body: JSON.stringify(checkoutBody),
      });

      // Retry com datetime completo caso a conta exija formato com hora
      if (!checkoutRes.ok && String(nextDueDate).length === 10) {
        console.warn('[createSubscriptionCheckout] Retry checkout com datetime completo:', JSON.stringify(checkoutRes.data?.errors));
        checkoutRes = await asaasFetch(apiKey, '/v3/checkouts', {
          method: 'POST',
          body: JSON.stringify({ ...checkoutBody, subscription: { ...(checkoutBody.subscription as Record<string, unknown>), nextDueDate: `${nextDueDate} 12:00:00` } }),
        });
      }

      if (!checkoutRes.ok) {
        console.error('[createSubscriptionCheckout] Erro Asaas Checkout:', JSON.stringify(checkoutRes.data));
        const desc = checkoutRes.data?.errors?.[0]?.description || 'Erro ao criar checkout de cartão no Asaas.';
        return Response.json({ error: desc }, { status: 502 });
      }

      const checkoutId = checkoutRes.data?.id as string | undefined;
      const checkoutLink = (checkoutRes.data?.link as string | undefined)
        || `https://asaas.com/checkoutSession/show?id=${checkoutId}`;

      console.log(`Checkout Asaas (cartão) criado: ${checkoutId} para plano ${plan} (user: ${maskEmail(user.email)}, trialDays: ${effectiveTrialDays})`);

      // Marca consumo do trial no banco — mesma semântica do fluxo por fatura
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
                notes: `Trial Profissional ${effectiveTrialDays}d iniciado no checkout de cartão (Asaas session: ${checkoutId})`,
              });
            }
          }
        } catch (markErr) {
          console.warn('[createSubscriptionCheckout] Erro ao registrar trial_consumed_at:', (markErr as Error).message);
        }
      }

      return Response.json({
        url: checkoutLink,
        checkout_id: checkoutId || null,
        trial_days: effectiveTrialDays,
        gateway: 'asaas',
        method: 'CREDIT_CARD',
      });
    }

    const subscriptionBody: Record<string, unknown> = {
      customer: customerId,
      billingType,
      value: amount,
      cycle: isAnnual ? 'YEARLY' : 'MONTHLY',
      nextDueDate,
      description: `Trancoso Resolve: ${planDef.nome}${isAnnual ? ' (Anual)' : ''}`,
      externalReference: `${plan}|${isAnnual ? 'annual' : 'monthly'}|${user.email}`,
    };

    let subRes = await asaasFetch(apiKey, '/v3/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionBody),
    });

    // Fallback defensivo: se a conta não aceitar DINAMICO em assinatura, usa PIX
    if (!subRes.ok && billingType === 'DINAMICO') {
      console.warn('[createSubscriptionCheckout] DINAMICO rejeitado — retry com PIX:', JSON.stringify(subRes.data?.errors));
      billingType = 'PIX';
      subRes = await asaasFetch(apiKey, '/v3/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ ...subscriptionBody, billingType: 'PIX' }),
      });
    }

    if (!subRes.ok) {
      console.error('[createSubscriptionCheckout] Erro Asaas:', JSON.stringify(subRes.data));
      const desc = subRes.data?.errors?.[0]?.description || 'Erro ao criar assinatura no Asaas.';
      return Response.json({ error: desc }, { status: 502 });
    }

    const subscription = subRes.data;
    console.log(`Checkout Asaas criado: ${subscription.id} para plano ${plan} (user: ${maskEmail(user.email)}, trialDays: ${effectiveTrialDays})`);

    // ─── Registra consumo do trial no banco ──────────────────────────────────
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
              notes: `Trial Profissional ${effectiveTrialDays}d iniciado no checkout, assinatura Asaas: ${subscription.id}`,
            });
          }
        }
      } catch (markErr) {
        console.warn('[createSubscriptionCheckout] Erro ao registrar trial_consumed_at:', (markErr as Error).message);
      }
    }

    // ─── Localiza a primeira cobrança para redirecionar à fatura ─────────────
    // Com trial, a cobrança só existe na data de vencimento — nesse caso mandamos
    // o usuário para a página de confirmação (o Asaas cobra automaticamente depois).
    let invoiceUrl: string | null = null;
    let pixCopiaECola: string | null = null;
    let paymentId: string | null = null;

    try {
      const paymentsRes = await asaasFetch(
        apiKey,
        `/v3/payments?subscription=${subscription.id}&limit=1&sort=dueDate`
      );
      const firstPayment = paymentsRes.data?.data?.[0];
      if (firstPayment) {
        paymentId = firstPayment.id;
        invoiceUrl = firstPayment.invoiceUrl || null;
        if (firstPayment.billingType === 'PIX') {
          try {
            const qr = await asaasFetch(apiKey, `/v3/payments/${firstPayment.id}/pixQrCode`);
            pixCopiaECola = qr.data?.payload || null;
          } catch { /* QR é opcional — a fatura também exibe */ }
        }
      }
    } catch (payErr) {
      console.warn('[createSubscriptionCheckout] Cobrança inicial não localizada:', (payErr as Error).message);
    }

    const redirectUrl = invoiceUrl || `${BASE_URL}/AssinaturaConfirmada?subscription=${subscription.id}&trial=${effectiveTrialDays}`;

    return Response.json({
      url: redirectUrl,
      subscription_id: subscription.id,
      payment_id: paymentId,
      pix_copia_e_cola: pixCopiaECola,
      trial_days: effectiveTrialDays,
      gateway: 'asaas',
    });

  } catch (error) {
    console.error('Erro ao criar checkout:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
