import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    // Verificação de autenticação obrigatória
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Unauthorized: missing or invalid auth header");
      return Response.json({ error: "Não autorizado. Faça login para continuar." }, { status: 401 });
    }

    const { price_id, plan_name, success_url, cancel_url } = await req.json();

    if (!price_id) {
      console.error("Missing price_id");
      return Response.json({ error: "price_id é obrigatório" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: success_url || `${req.headers.get("origin")}/Planos?success=true`,
      cancel_url: cancel_url || `${req.headers.get("origin")}/Planos?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan_name: plan_name || "",
      },
      locale: "pt-BR",
    });

    console.log(`Checkout session created: ${session.id} for plan: ${plan_name}`);
    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});