import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Autenticação obrigatória
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    if (!user) {
      return Response.json({ error: 'Faça login para chamar um prestador.' }, { status: 401 });
    }

    const { id_prestador } = await req.json();

    if (!id_prestador) {
      return Response.json({ error: 'ID do prestador é obrigatório.' }, { status: 400 });
    }

    // Busca o prestador pelo id no ServiceProvider
    const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ id: id_prestador });
    const provider = providers?.[0];

    if (!provider) {
      return Response.json({ error: 'Prestador não encontrado.' }, { status: 404 });
    }

    // Verifica assinatura ativa do prestador
    const today = new Date().toISOString().split('T')[0];
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: provider.created_by,
      status: 'active',
    });

    const hasActiveSubscription = subscriptions?.some(sub => {
      if (sub.status !== 'active') return false;
      if (sub.trial_end && today > sub.trial_end) return false;
      if (sub.next_billing_date && today > sub.next_billing_date) return false;
      return true;
    });

    // Também aceita trial ativo
    const trialSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: provider.created_by,
      status: 'trial',
    });

    const hasActiveTrial = trialSubscriptions?.some(sub => {
      return sub.trial_end && today <= sub.trial_end;
    });

    if (!hasActiveSubscription && !hasActiveTrial) {
      return Response.json(
        { error: 'Este prestador não está disponível no momento. Tente outro prestador.' },
        { status: 403 }
      );
    }

    // Obtém WhatsApp do cliente (client_phone pode estar no user ou em ServiceRequest anterior)
    const clientPhone = user.phone || '';

    // Obtém WhatsApp do prestador
    const providerPhone = provider.phone || '';

    if (!providerPhone) {
      return Response.json(
        { error: 'Este prestador não possui WhatsApp cadastrado.' },
        { status: 422 }
      );
    }

    // Registra a chamada como ServiceRequest com status especial
    await base44.asServiceRole.entities.ServiceRequest.create({
      client_id: user.id,
      client_name: user.full_name || user.email,
      client_phone: clientPhone,
      client_email: user.email,
      provider_id: id_prestador,
      date: today,
      status: 'Pendente',
      message: 'Contato via WhatsApp',
    });

    console.log(`[chamarPrestador] cliente=${user.email} prestador=${id_prestador}`);

    return Response.json({
      whatsapp_cliente: clientPhone,
      whatsapp_prestador: providerPhone,
      provider_name: provider.full_name,
    });
  } catch (error) {
    console.error('[chamarPrestador] erro:', error.message);
    return Response.json({ error: 'Ocorreu um problema. Tente novamente em alguns instantes.' }, { status: 500 });
  }
});