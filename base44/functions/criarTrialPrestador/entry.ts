import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Chamada pela automação de entity (User update com user_type='prestador')
// ou diretamente do CadastroTipo após set do user_type.
//
// REGRA COMERCIAL IMUTÁVEL:
// - Cada prestador pode consumir APENAS UM benefício de trial em toda a sua vida.
// - O Teste Gratuito de 30 dias (sem cartão) e o trial do Plano Profissional (7 dias)
//   NÃO podem ser acumulados. Se o prestador já consumiu qualquer trial, não recebe novo.
// - trial_consumed_at, trial_type e trial_version ficam registrados para sempre.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Suporta: (1) automação de entity ({ event, data }) ou (2) chamada admin
    let userEmail = '';
    let userName = '';

    if (payload.data) {
      // Chamada de automação de entity — confiável porque é interna
      const userData = payload.data;
      if (userData.user_type !== 'prestador') {
        return Response.json({ ok: true, note: 'user_type != prestador, ignorado' });
      }
      userEmail = userData.email;
      userName = userData.full_name || '';
    } else {
      // Chamada direta: aceita do próprio usuário autenticado ou admin
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (user.role === 'admin' && payload.user_email) {
        userEmail = payload.user_email;
        userName = payload.user_name || '';
      } else {
        userEmail = user.email;
        userName = user.full_name || payload.user_name || '';
      }
    }

    if (!userEmail) {
      return Response.json({ error: 'user_email obrigatório' }, { status: 400 });
    }

    // ─── Verifica trial já consumido ──────────────────────────────────────────
    // REGRA: qualquer registro de Subscription com trial_consumed_at preenchido
    // significa que o benefício de trial foi esgotado — não conceder novo trial.
    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
    if (existing && existing.length > 0) {
      const sub = existing[0] as { trial_consumed_at?: string; status?: string; plan?: string };

      // Já tem trial_consumed_at → trial já foi consumido anteriormente
      if (sub.trial_consumed_at) {
        console.warn(
          `[criarTrialPrestador] Trial já consumido para ${userEmail}. ` +
          `trial_consumed_at=${sub.trial_consumed_at}. Ignorado.`
        );
        return Response.json({
          ok: false,
          note: 'trial_ja_consumido',
          message: 'Este prestador já utilizou o benefício de trial gratuito.',
        });
      }

      // Assinatura existe mas sem trial_consumed_at (criada antes desta feature)
      // → migrar: marcar trial_consumed_at agora para evitar acúmulo futuro
      if (sub.plan === 'trial' || sub.status === 'trial') {
        console.log(`[criarTrialPrestador] Assinatura trial existente sem trial_consumed_at. Migrando ${userEmail}.`);
        try {
          await base44.asServiceRole.entities.Subscription.update(
            (existing[0] as { id: string }).id,
            {
              trial_consumed_at: new Date().toISOString(),
              trial_type: 'free_30d',
              trial_version: 1,
              notes: 'trial_consumed_at adicionado retroativamente na migração v2',
            }
          );
        } catch (migErr) {
          console.warn('[criarTrialPrestador] Erro na migração:', (migErr as Error).message);
        }
        return Response.json({ ok: true, note: 'assinatura_migrada' });
      }

      // Assinatura existe com plano pago → não cria trial
      console.log(`[criarTrialPrestador] Já existe assinatura (${sub.plan}/${sub.status}) para ${userEmail}. Ignorado.`);
      return Response.json({ ok: true, note: 'já existe assinatura' });
    }

    // ─── Cria o Teste Gratuito de 30 dias ────────────────────────────────────
    const today = new Date();
    const trialEnd = new Date(today);
    trialEnd.setDate(trialEnd.getDate() + 30);

    const trialStart = today.toISOString().split('T')[0];
    const trialEndDate = trialEnd.toISOString().split('T')[0];
    const trialConsumedAt = today.toISOString();

    await base44.asServiceRole.entities.Subscription.create({
      user_email: userEmail,
      plan: 'trial',
      status: 'trial',
      trial_start: trialStart,
      trial_end: trialEndDate,
      // Marca o consumo do benefício de trial — NUNCA sobrescrever
      trial_consumed_at: trialConsumedAt,
      trial_type: 'free_30d',
      trial_version: 1,
      amount: 0,
      payment_method: 'manual',
      notes: 'Teste Gratuito de 30 dias — criado no cadastro como prestador',
    });

    console.log(`[criarTrialPrestador] Teste Gratuito criado para ${userEmail}: ${trialStart} → ${trialEndDate}`);

    // ─── Email de boas-vindas (fire-and-forget) ───────────────────────────────
    const firstName = userName.split(' ')[0] || 'Prestador';
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: '🌴 Bem-vindo(a) ao Trancoso Resolve!',
        body: `Olá, ${firstName}!\n\nSeja muito bem-vindo(a) ao Trancoso Resolve, a plataforma que conecta os melhores profissionais aos turistas e moradores de Trancoso.\n\nSeu Teste Gratuito de 30 dias começa agora (até ${trialEnd.toLocaleDateString('pt-BR')}).\n\nDurante o teste você pode:\n• Criar e publicar seus serviços\n• Receber solicitações de agendamento de clientes\n• Ser encontrado pelos clientes na plataforma\n• Gerenciar sua agenda e financeiro\n\nPara aproveitar ao máximo:\n1. Complete seu perfil com foto e bio: https://trancosoresolve.com.br/MeuPerfilPrestador\n2. Cadastre seus serviços: https://trancosoresolve.com.br/MeusServicos\n3. Acesse seu painel: https://trancosoresolve.com.br/Dashboard\n\nApós o teste, continue com o Plano Profissional por apenas R$ 19,90/mês — preço de lançamento para os primeiros prestadores verificados.\n\nDúvidas? contato@tocaexperience.com.br\n\nUm abraço,\nEquipe Trancoso Resolve 🌊`,
        from_name: 'Trancoso Resolve',
      });
    } catch (emailErr) {
      console.warn('[criarTrialPrestador] email não enviado:', (emailErr as Error).message);
    }

    return Response.json({ ok: true, trial_start: trialStart, trial_end: trialEndDate });
  } catch (error) {
    console.error('[criarTrialPrestador] erro:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
