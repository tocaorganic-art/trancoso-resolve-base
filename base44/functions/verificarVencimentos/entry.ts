import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── Verificar Vencimentos ───────────────────────────────────────────────────
// Automação agendada (diária):
// 1. Assinaturas 'active' com next_billing_date vencido → 'expired' + lembrete.
// 2. Trials vencidos: status 'trial', ou 'active' SEM preapproval (nunca
//    converteram em pagamento), com trial_end no passado → 'expired'.
// Também registra cada vencimento na entidade LogPagamento.
//
// Segurança: opera apenas sobre assinaturas/trials já vencidos (data < hoje) —
// nenhuma ação destrutiva. Usa asServiceRole para acesso total às entidades.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date().toISOString().split('T')[0];
    const expired: Array<{ subscription_id: string; email: string; due_date: string; origem: string }> = [];
    const processed = new Set<string>();
    let reminders = 0;

    // ── 1. Assinaturas ativas com cobrança vencida ──
    const subs = await base44.asServiceRole.entities.Subscription.filter({ status: 'active' });

    for (const sub of subs || []) {
      const due = sub.next_billing_date;
      if (!due || due >= today) continue;

      // 1. Marcar assinatura como expirada
      await base44.asServiceRole.entities.Subscription.update(sub.id, { status: 'expired' });
      processed.add(sub.id);

      // 2. Buscar prestador pelo email para obter telefone
      let phone: string | null = null;
      let providerId: string | null = null;
      try {
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({ email: sub.user_email });
        const provider = providers?.[0];
        if (provider) {
          providerId = provider.id;
          phone = (provider as any).phone || null;
        }
      } catch (e) {
        console.warn(`[verificarVencimentos] Erro ao buscar prestador para ${sub.user_email}:`, (e as Error).message);
      }

      // 3. Gerar lembrete de renovação no LogWhatsApp
      if (phone) {
        try {
          await base44.asServiceRole.entities.LogWhatsApp.create({
            tipo: 'lembrete_renovacao',
            telefone: phone,
            mensagem: `Olá! Sua assinatura do plano ${sub.plan} venceu em ${due}. Acesse https://trancosoresolve.com.br/Planos para renovar e continuar com todos os benefícios da Trancoso Resolve. 🌴`,
            status: 'pendente',
            timestamp: new Date().toISOString(),
            referencia_id: sub.id,
            referencia_tipo: 'Subscription',
          });
          reminders++;
        } catch (e) {
          console.warn(`[verificarVencimentos] Erro ao logar lembrete para ${sub.user_email}:`, (e as Error).message);
        }
      }

      // 4. Registrar vencimento no LogPagamento
      try {
        await base44.asServiceRole.entities.LogPagamento.create({
          evento: 'vencimento',
          status: 'expired',
          prestador_id: providerId || undefined,
          prestador_email: sub.user_email,
          plano: sub.plan,
          valor: sub.amount,
          mercadopago_id: sub.mp_preapproval_id || undefined,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.warn(`[verificarVencimentos] LogPagamento não registrado:`, (e as Error).message);
      }

      expired.push({ subscription_id: sub.id, email: sub.user_email, due_date: String(due), origem: 'assinatura' });
    }

    // ── 2. Trials vencidos ──
    // 'trial' com trial_end passado, ou 'active' SEM preapproval (nunca
    // converteu em assinatura paga) com trial_end passado → 'expired'.
    const trialCandidates = [
      ...(await base44.asServiceRole.entities.Subscription.filter({ status: 'trial' })),
      ...(await base44.asServiceRole.entities.Subscription.filter({ status: 'active' })),
    ];

    for (const sub of trialCandidates) {
      if (processed.has(sub.id)) continue;
      if (!sub.trial_end || sub.trial_end >= today) continue;
      if (sub.status === 'active' && sub.mp_preapproval_id) continue; // assinatura paga: tratada acima

      await base44.asServiceRole.entities.Subscription.update(sub.id, { status: 'expired' });
      processed.add(sub.id);

      try {
        await base44.asServiceRole.entities.LogPagamento.create({
          evento: 'vencimento_trial',
          status: 'expired',
          prestador_email: sub.user_email,
          plano: sub.plan,
          valor: sub.amount,
          mercadopago_id: sub.mp_preapproval_id || undefined,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.warn(`[verificarVencimentos] LogPagamento (trial) não registrado:`, (e as Error).message);
      }

      expired.push({ subscription_id: sub.id, email: sub.user_email, due_date: String(sub.trial_end), origem: 'trial' });
    }

    console.log(`[verificarVencimentos] ${expired.length} assinatura(s)/trial(is) expirado(s), ${reminders} lembrete(s) gerados.`);
    return Response.json({
      success: true,
      checked: processed.size,
      expired: expired.length,
      reminders,
      details: expired,
    });
  } catch (error) {
    console.error('[verificarVencimentos] Erro:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});