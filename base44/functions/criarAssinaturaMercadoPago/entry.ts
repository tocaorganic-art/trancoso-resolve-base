import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Catálogo de planos — SOMENTE backend pode mapear plano → preço.
// Nunca expor ao frontend. Frontend envia apenas o identificador do plano.
//
// Regras comerciais aprovadas (não alterar sem autorização):
//   - Profissional Fundador: R$ 19,90/mês, 7 dias grátis, 100 Selos Fundadores
//   - Quando os Selos Fundadores acabarem, o preço NÃO muda automaticamente.
//     O backend retorna vagas_esgotadas e o fluxo para até decisão manual.
//
// Variáveis de ambiente necessárias:
//   MP_ACCESS_TOKEN    — token de acesso Mercado Pago (server-side, nunca expor)
//   MP_NOTIFICATION_URL — URL do webhook para receber notificações de pagamento
//   BASE_URL           — URL base do app (ex: https://www.trancosoresolve.com.br)
const PLANOS: Record<string, { nome: string; valor: number; frequencia: 'monthly'; trial_days?: number }> = {
  fundador: {
    nome: 'Prestador Fundador',
    valor: 19.90,
    frequencia: 'monthly',
    trial_days: 7,
  },
};

// 100 Selos Fundadores — quando esgotados, retorna vagas_esgotadas (sem redirect automático).
const VAGAS_FUNDADORES = 100;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized: autenticação obrigatória' }, { status: 401 });
    }

    const body = await req.json();
    const { plano, success_url, failure_url } = body;

    // --- Validação do plano ---
    if (!plano || !PLANOS[plano]) {
      return Response.json({
        error: `Plano inválido. Valores aceitos: ${Object.keys(PLANOS).join(', ')}`,
      }, { status: 400 });
    }

    const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpToken) {
      return Response.json({ error: 'Gateway de pagamento não configurado' }, { status: 503 });
    }

    const planoConfig = PLANOS[plano];

    // --- Idempotência: nunca cobrar o mesmo usuário duas vezes ---
    // Se já existir assinatura pendente/ativa/trial para este usuário, devolve
    // o preapproval pendente (mesmo fluxo) ou bloqueia a criação.
    const existentes = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email,
    });
    const ativa = existentes?.find(s =>
      ['ativa', 'pendente', 'trial', 'active', 'pending'].includes(s.status)
    );
    if (ativa) {
      // Pendente com preapproval válido → devolve o mesmo checkout em vez de criar outro.
      if (ativa.status === 'pendente' && ativa.mp_preapproval_id) {
        const mpPendente = await fetch(`https://api.mercadopago.com/preapproval/${ativa.mp_preapproval_id}`, {
          headers: { Authorization: `Bearer ${mpToken}` },
        });
        if (mpPendente.ok) {
          const data = await mpPendente.json();
          if (data?.init_point) {
            return Response.json({
              ok: true,
              checkout_url: data.init_point,
              preapproval_id: ativa.mp_preapproval_id,
              reutilizado: true,
            });
          }
        }
      }
      return Response.json({
        error: 'assinatura_existente',
        mensagem: 'Você já possui uma assinatura em andamento. Acompanhe no painel.',
      }, { status: 409 });
    }

    // --- Limite de Selos Fundadores ---
    // Quando os 100 Selos Fundadores acabarem, retorna vagas_esgotadas.
    // O preço NÃO muda automaticamente — decisão de precificação é manual.
    if (plano === 'fundador') {
      const ativas = await base44.asServiceRole.entities.Subscription.filter({
        plano: 'fundador',
        status: 'ativa',
      });
      const trials = await base44.asServiceRole.entities.Subscription.filter({
        plano: 'fundador',
        status: 'trial',
      });
      const pendentes = await base44.asServiceRole.entities.Subscription.filter({
        plano: 'fundador',
        status: 'pendente',
      });
      const total = (ativas?.length || 0) + (trials?.length || 0) + (pendentes?.length || 0);
      if (total >= VAGAS_FUNDADORES) {
        return Response.json({
          error: 'vagas_esgotadas',
          mensagem: 'Os Selos Fundadores estão esgotados. Entre em contato para ser avisado quando novas vagas abrirem.',
        }, { status: 409 });
      }
    }

    const BASE_URL = Deno.env.get('BASE_URL') || 'https://www.trancosoresolve.com.br';
    const notificationUrl = Deno.env.get('MP_NOTIFICATION_URL');

    // --- Cria preapproval (assinatura recorrente) no Mercado Pago ---
    const preapprovalPayload: Record<string, unknown> = {
      reason: planoConfig.nome,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planoConfig.valor,
        currency_id: 'BRL',
      },
      back_url: success_url || `${BASE_URL}/AssinaturaConfirmada?plano=${plano}`,
      payer_email: user.email,
      // external_reference estável (sem timestamp) — permite dedup no webhook.
      external_reference: `assinatura-${user.id}-${plano}`,
    };

    if (planoConfig.trial_days) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + planoConfig.trial_days);
      preapprovalPayload.free_trial = {
        frequency: planoConfig.trial_days,
        frequency_type: 'days',
      };
    }

    if (notificationUrl) {
      preapprovalPayload.notification_url = notificationUrl;
    }

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
        // Chave fixa por usuário+plano: cliques duplicados no MP retornam o
        // mesmo preapproval (idempotência real, sem Date.now()).
        'X-Idempotency-Key': `assinatura-${user.id}-${plano}`,
      },
      body: JSON.stringify(preapprovalPayload),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('[criarAssinaturaMercadoPago] MP error:', JSON.stringify(mpData));
      return Response.json({
        error: 'Erro ao criar assinatura no gateway de pagamento',
        detalhe: mpData?.message || `HTTP ${mpRes.status}`,
      }, { status: 502 });
    }

    const preapprovalId = mpData.id;
    const checkoutUrl = mpData.init_point;

    // Persiste referência da assinatura pendente
    await base44.asServiceRole.entities.Subscription.create({
      user_id: user.id,
      user_email: user.email,
      plano,
      status: 'pendente',
      gateway: 'mercadopago',
      mp_preapproval_id: preapprovalId,
      external_reference: preapprovalPayload.external_reference as string,
      criado_em: new Date().toISOString(),
    });

    console.log(`[criarAssinaturaMercadoPago] preapproval=${preapprovalId} plano=${plano} user=${user.id}`);

    return Response.json({
      ok: true,
      checkout_url: checkoutUrl,
      preapproval_id: preapprovalId,
    });

  } catch (err) {
    console.error('[criarAssinaturaMercadoPago] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});
