import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// ─── Price IDs ────────────────────────────────────────────────────────────────
const PRICE_IDS = {
  // Assinaturas recorrentes
  lancamento:          'price_1TY77iRX4Ldl6df52JOZUGqj', // Prestador Lançamento R$29,90/mês (60 dias grátis)
  regular:             'price_1TY77iRX4Ldl6df5cHFJebEA', // Prestador Mensal R$49,90/mês (7 dias grátis)
  empresa_lancamento:  'price_1TY77iRX4Ldl6df5BxKiMcBo', // Empresas Lançamento R$59,90/mês (7 dias grátis)
  empresa_regular:     'price_1TY77iRX4Ldl6df5VHk21uBQ', // Empresas Mensal R$89,90/mês (7 dias grátis)
  // Avulsos (one-time)
  avulso_prestador:    'price_1TY77iRX4Ldl6df5eEcvFJzq', // R$69,90 avulso prestador
  avulso_empresa:      'price_1TY77iRX4Ldl6df5CvfHR8pL', // R$99,99 avulso empresa
};

const VAGAS_LANCAMENTO = 50;
const BASE_URL = 'https://trancosoresolve.com.br';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, success_url, cancel_url } = await req.json();

    // ─── Verificar limite de vagas para plano lançamento prestador ────────────
    if (plan === 'lancamento') {
      const activeSubs = await base44.asServiceRole.entities.Subscription.filter({
        plan: 'lancamento',
        status: 'active',
      });
      const trialSubs = await base44.asServiceRole.entities.Subscription.filter({
        plan: 'lancamento',
        status: 'trial',
      });
      const total = (activeSubs?.length || 0) + (trialSubs?.length || 0);
      if (total >= VAGAS_LANCAMENTO) {
        return Response.json({
          error: 'vagas_esgotadas',
          message: 'As vagas do plano de lançamento estão esgotadas. Escolha o Plano Prestador Mensal para continuar.',
          redirect_to: 'regular',
        }, { status: 409 });
      }
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return Response.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const customerEmail = user.email;
    const isAvulso = plan.startsWith('avulso_');
    const isLancamento = plan === 'lancamento' || plan === 'empresa_lancamento';

    const successUrl = success_url ||
      (isAvulso
        ? `${BASE_URL}/AssinaturaConfirmada?avulso=true&session_id={CHECKOUT_SESSION_ID}`
        : `${BASE_URL}/AssinaturaConfirmada?session_id={CHECKOUT_SESSION_ID}`);
    const cancelUrl = cancel_url || `${BASE_URL}/Planos`;

    let sessionParams = {
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      locale: 'pt-BR',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
        user_email: customerEmail,
      },
    };

    if (isAvulso) {
      // Pagamento único
      sessionParams.mode = 'payment';
    } else {
      // Assinatura recorrente
      sessionParams.mode = 'subscription';
      const trialDays = isLancamento && plan === 'lancamento' ? 60 : 7;
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: {
          plan,
          user_email: customerEmail,
          trial_days: String(trialDays),
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Checkout criado: ${session.id} para plano ${plan} (user: ${customerEmail})`);
    return Response.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('Erro ao criar checkout:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});