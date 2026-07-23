import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

// ─── Price IDs ────────────────────────────────────────────────────────────────
const PRICE_IDS: Record<string, string> = {
  lancamento:         'price_1TY77iRX4Ldl6df52JOZUGqj',
  regular:            'price_1TY77iRX4Ldl6df5cHFJebEA',
  empresa_lancamento: 'price_1TY77iRX4Ldl6df5BxKiMcBo',
  empresa_regular:    'price_1TY77iRX4Ldl6df5VHk21uBQ',
  avulso_prestador:   'price_1TY77iRX4Ldl6df5eEcvFJzq',
  avulso_empresa:     'price_1TY77iRX4Ldl6df5CvfHR8pL',
};

const VAGAS_LANCAMENTO = 50;
const BASE_URL = 'https://trancosoresolve.com.br';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Stripe não configurado: STRIPE_SECRET_KEY ausente.' }, { status: 503 });
    }
    const stripe = new Stripe(stripeKey);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, success_url, cancel_url } = await req.json();

    // ─── Verificar limite de vagas para plano lançamento ──────────────────────
    if (plan === 'lancamento') {
      const activeSubs = await base44.asServiceRole.entities.Subscription.filter({ plan: 'lancamento', status: 'active' });
      const trialSubs  = await base44.asServiceRole.entities.Subscription.filter({ plan: 'lancamento', status: 'trial' });
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

    const customerEmail = user.email as string;
    const isAvulso = (plan as string).startsWith('avulso_');
    const isLancamento = plan === 'lancamento' || plan === 'empresa_lancamento';

    const successUrl = success_url ||
      (isAvulso
        ? `${BASE_URL}/AssinaturaConfirmada?avulso=true&session_id={CHECKOUT_SESSION_ID}`
        : `${BASE_URL}/AssinaturaConfirmada?session_id={CHECKOUT_SESSION_ID}`);
    const cancelUrl = cancel_url || `${BASE_URL}/Planos`;

    const trialDays = (!isAvulso && isLancamento && plan === 'lancamento') ? 60 : 7;

    // Constrói params de forma tipada — evita "property does not exist" do TypeScript
    const sessionParams: Record<string, unknown> = {
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isAvulso ? 'payment' : 'subscription',
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

    if (!isAvulso) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: {
          plan,
          user_email: customerEmail,
          trial_days: String(trialDays),
        },
      };
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as any
    );

    console.log(`Checkout criado: ${session.id} para plano ${plan} (user: ${customerEmail})`);
    return Response.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('Erro ao criar checkout:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
