import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Chamada pela automação de entity (User update com user_type='prestador')
// ou diretamente do CadastroTipo após set do user_type

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
      // Usa o email do próprio usuário autenticado (ou o informado no payload, se admin)
      if (user.role === 'admin' && payload.user_email) {
        userEmail = payload.user_email;
        userName = payload.user_name || '';
      } else {
        // Prestador criando o próprio trial
        userEmail = user.email;
        userName = user.full_name || payload.user_name || '';
      }
    }

    if (!userEmail) {
      return Response.json({ error: 'user_email obrigatório' }, { status: 400 });
    }

    // Verifica se já existe assinatura (evita duplicar)
    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
    if (existing && existing.length > 0) {
      console.log(`[criarTrialPrestador] Já existe assinatura para ${userEmail}. Ignorado.`);
      return Response.json({ ok: true, note: 'já existe assinatura' });
    }

    // Trial de 14 dias
    const today = new Date();
    const trialEnd = new Date(today);
    trialEnd.setDate(trialEnd.getDate() + 14);

    const trialStart = today.toISOString().split('T')[0];
    const trialEndDate = trialEnd.toISOString().split('T')[0];

    await base44.asServiceRole.entities.Subscription.create({
      user_email: userEmail,
      plan: 'trial',
      status: 'trial',
      trial_start: trialStart,
      trial_end: trialEndDate,
      amount: 0,
      payment_method: 'manual',
      notes: 'Trial automático criado no cadastro como prestador',
    });

    console.log(`[criarTrialPrestador] Trial criado para ${userEmail}: ${trialStart} → ${trialEndDate}`);

    // Envia email de boas-vindas (fire-and-forget, não bloqueia em caso de erro)
    const firstName = userName.split(' ')[0] || 'Prestador';
    try { await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: '🌴 Bem-vindo(a) ao Trancoso Resolve!',
      body: `Olá, ${firstName}!

Seja muito bem-vindo(a) ao Trancoso Resolve, a plataforma que conecta os melhores profissionais aos turistas e moradores de Trancoso.

Seu período de teste de 14 dias começa agora (até ${trialEnd.toLocaleDateString('pt-BR')}).

Durante o trial você pode:
• Criar e publicar seus serviços
• Receber solicitações de agendamento de clientes
• Ser encontrado pelos clientes na plataforma
• Gerenciar sua agenda e financeiro

Para aproveitar ao máximo:
1. Complete seu perfil com foto e bio: https://trancosoresolve.base44.app/MeuPerfilPrestador
2. Cadastre seus serviços: https://trancosoresolve.base44.app/MeusServicos
3. Acesse seu painel: https://trancosoresolve.base44.app/Dashboard

Após o trial, continue com a assinatura mensal por apenas R$ 29,90/mês (plano lançamento) ou R$ 49,90/mês.

Dúvidas? Fale com a gente: contato@tocaexperience.com.br

Um abraço,
Equipe Trancoso Resolve 🌊`,
      from_name: 'Trancoso Resolve',
    }); } catch (emailErr) { console.warn('[criarTrialPrestador] email não enviado:', emailErr.message); }

    return Response.json({ ok: true, trial_start: trialStart, trial_end: trialEndDate });
  } catch (error) {
    console.error('[criarTrialPrestador] erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});