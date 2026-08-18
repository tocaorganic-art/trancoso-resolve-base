import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { provider_id, return_url, refresh_url } = body;

    if (!provider_id) {
      return Response.json({ error: 'provider_id obrigatório' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://trancosoresolve.com';
    const finalReturnUrl = return_url || `${origin}/MeuPerfilPrestador?stripe=success`;
    const finalRefreshUrl = refresh_url || `${origin}/MeuPerfilPrestador?stripe=refresh`;

    // Verifica se já tem conta Connect
    const existing = await base44.asServiceRole.entities.ProviderStripeAccount.filter({ provider_id });

    let stripeAccountId;
    let record;

    if (existing && existing.length > 0 && existing[0].stripe_account_id) {
      stripeAccountId = existing[0].stripe_account_id;
      record = existing[0];
      console.log(`[onboarding] Conta existente: ${stripeAccountId}`);
    } else {
      // Cria nova conta Express no Stripe Connect
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          provider_id,
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
        },
      });

      stripeAccountId = account.id;
      console.log(`[onboarding] Nova conta Stripe criada: ${stripeAccountId}`);

      if (existing && existing.length > 0) {
        await base44.asServiceRole.entities.ProviderStripeAccount.update(existing[0].id, {
          stripe_account_id: stripeAccountId,
          onboarding_status: 'in_progress',
        });
        record = { ...existing[0], stripe_account_id: stripeAccountId };
      } else {
        record = await base44.asServiceRole.entities.ProviderStripeAccount.create({
          provider_id,
          provider_email: user.email,
          stripe_account_id: stripeAccountId,
          onboarding_status: 'in_progress',
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
        });
      }
    }

    // Gera link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: finalRefreshUrl,
      return_url: finalReturnUrl,
      type: 'account_onboarding',
    });

    console.log(`[onboarding] Link gerado para ${stripeAccountId}`);

    // Salva a URL de onboarding
    if (record?.id) {
      await base44.asServiceRole.entities.ProviderStripeAccount.update(record.id, {
        onboarding_url: accountLink.url,
      });
    }

    return Response.json({
      ok: true,
      onboarding_url: accountLink.url,
      stripe_account_id: stripeAccountId,
    });

  } catch (error) {
    console.error('[onboarding] Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});