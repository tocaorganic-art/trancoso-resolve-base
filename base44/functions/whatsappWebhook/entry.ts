import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DEFAULT_VERIFY_TOKEN = 'trancoso_resolve_2026';

// === SISTEMA DE RESPOSTAS CONVERSACIONAIS ===

const LEAD_KEYWORDS = [
  'preço', 'preco', 'serviço', 'servico', 'preciso', 'contratar',
  'diarista', 'eletricista', 'piscineiro', 'pedreiro', 'cozinheiro',
  'chef', 'jardineiro', 'encanador', 'agendar', 'orçamento', 'orcamento',
  'quanto custa', 'valor', 'contrato', 'reformar', 'limpeza', 'cozinhar',
  'piscina', 'jardim', 'pintor', 'pintura', 'azulejista', 'marido',
  'caseiro', 'faxineiro', 'cozinheira', 'camareira', 'auxiliar',
  'mototaxi', 'corrida', 'transfer', 'festa', 'evento', 'casamento',
  'dj', 'fotógrafo', 'fotografo', 'decoração', 'decoracao',
];

const PRESTADOR_KEYWORDS = [
  'cadastrar', 'cadastro', 'cadastre', 'registrar', 'registro',
  'prestador', 'profissional', 'anunciar', 'anúncio', 'anuncio',
  'plano', 'planos', 'assinatura', 'mensalidade', 'trabalhar',
  'oferecer', 'meu serviço', 'meu servico', 'sou prestador',
  'quero aparecer', 'divulgar', 'vitrine',
];

const INFO_KEYWORDS = [
  'olá', 'ola', 'oi', 'bom dia', 'boa tarde', 'boa noite',
  'informação', 'informacao', 'como funciona', 'o que é', 'o que e',
  'ajuda', 'falar com', 'atendente', 'contato',
];

const PLANOS_KEYWORDS = [
  'plano', 'planos', 'preço do plano', 'quanto custa o plano',
  'gratuito', 'grátis', 'gratis', 'profissional', 'elite',
  'mensalidade', 'assinatura', 'pagar',
];

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function classificarIntencao(texto: string): 'lead' | 'prestador' | 'planos' | 'info' | 'outro' {
  const lower = texto.toLowerCase().trim();
  if (PRESTADOR_KEYWORDS.some((kw) => lower.includes(kw))) return 'prestador';
  if (PLANOS_KEYWORDS.some((kw) => lower.includes(kw))) return 'planos';
  if (LEAD_KEYWORDS.some((kw) => lower.includes(kw))) return 'lead';
  if (INFO_KEYWORDS.some((kw) => lower.includes(kw))) return 'info';
  return 'outro';
}

function gerarResposta(intencao: string, messageText: string, contactName: string): string {
  const nome = contactName ? contactName.split(' ')[0] : '';

  switch (intencao) {
    case 'lead': {
      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! 👋 Recebemos seu pedido aqui na Trancoso Resolve. Já estou registrando tudo pra te ajudar 🌴\n\nPra encontrar o profissional ideal pra você, me conta:\n1) Qual serviço você precisa?\n2) Em qual bairro ou região de Trancoso?\n3) Tem urgência ou pode agendar?\n\nAssim que você responder, eu busco o melhor prestador pra você!`,
        `Olá${nome ? ' ' + nome : ''}! Que bom que você chegou até nós 😊 A Trancoso Resolve conecta você com profissionais verificados em Trancoso.\n\nMe conta rapidinho:\n1) Que serviço você tá precisando?\n2) Em qual região de Trancoso?\n3) É urgente ou tem flexibilidade de horário?\n\nVou encontrar o profissional certo pra você!`,
        `Oi${nome ? ' ' + nome : ''}! Perfeito, a Trancoso Resolve é o lugar certo 🌴 Já registrei seu contato.\n\nPra eu te indicar o melhor profissional:\n1) Qual serviço você procura?\n2) Qual bairro/região?\n3) Melhor horário pra atendimento?\n\nResponda quando puder que eu já fico de olho 👀`,
      ];
      return getRandomResponse(respostas);
    }

    case 'prestador': {
      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! Que ótimo que você quer fazer parte da Trancoso Resolve 🙌 Somos a vitrine digital oficial de Trancoso.\n\nPra eu já adiantar seu cadastro aqui mesmo:\n1) Qual seu nome completo?\n2) Qual serviço você oferece?\n3) Você atende presencialmente em Trancoso ou é serviço remoto?\n4) Qual seu WhatsApp pra contato?\n\nDepois te explico os planos disponíveis e como funciona a vitrine!`,
        `Olá${nome ? ' ' + nome : ''}! Excelente! A Trancoso Resolve é a vitrine digital oficial de prestadores de Trancoso 🌴\n\nComo prestador cadastrado você tem:\n✅ Aparecer no site como profissional verificado\n✅ Receber novos clientes direto no WhatsApp\n✅ Estatísticas de visualizações e cliques\n\nPra começar, me conta: qual serviço você presta e qual seu nome completo?`,
        `Oi${nome ? ' ' + nome : ''}! Que massa que você quer se cadastrar! 🌴 A Trancoso Resolve é a plataforma que conecta moradores e turistas aos melhores prestadores de Trancoso.\n\nPra agilizar, me passa:\n1) Seu nome completo\n2) Qual serviço você oferece\n3) Bairro/região de atendimento\n4) WhatsApp pra contato\n\nEu já começo a montar seu perfil!`,
      ];
      return getRandomResponse(respostas);
    }

    case 'planos': {
      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! Os planos da Trancoso Resolve foram pensados pra caber no seu momento 🌴\n\nTem planos a partir de R$ 0 (gratuito) pra começar a aparecer no site. Conforme você cresce, pode subir de plano e ter mais destaque.\n\nQuer que eu te explique as opções? Me conta qual serviço você oferece que eu te mostro o plano ideal!`,
        `Olá${nome ? ' ' + nome : ''}! Posso te explicar os planos sim 😊 A Trancoso Resolve tem opções pra todos os tamanhos de negócio.\n\nCada plano oferece diferentes níveis de destaque na vitrine digital. Me conta: qual serviço você presta e qual seu momento atual (começando, já estabelecido, etc)?\n\nAssim eu te indico a melhor opção!`,
      ];
      return getRandomResponse(respostas);
    }

    case 'info': {
      const respostas = [
        `Oi! 👋 Aqui é da Trancoso Resolve 🌴\n\nSomos a vitrine digital oficial de Trancoso. Conectamos moradores, turistas e empresários aos melhores prestadores de serviço da região.\n\nComo podemos te ajudar hoje?\n\n1) Preciso de um serviço\n2) Quero me cadastrar como prestador\n3) Quero conhecer os planos\n\nÉ só me dizer! 😊`,
        `Olá! Bem-vindo(a) à Trancoso Resolve 🌳\n\nSomos a plataforma que conecta quem precisa de serviço com quem oferece em Trancoso e região. Tudo verificado, com avaliações de quem já usou.\n\nO que você precisa?\n1) Encontrar um profissional\n2) Se cadastrar como prestador\n3) Tirar dúvidas sobre planos\n\nTô aqui pra ajudar!`,
        `Oi! Que bom falar com você! 😊 A Trancoso Resolve é a vitrine digital de serviços de Trancoso.\n\nAqui você encontra profissionais verificados pra tudo: encanador, eletricista, diarista, pedreiro, jardineiro e muito mais. Também pode se cadastrar como prestador se quiser! 🌴\n\nMe conta: você tá procurando um serviço ou quer se cadastrar?`,
      ];
      return getRandomResponse(respostas);
    }

    default: {
      const respostas = [
        `Oi! Recebemos sua mensagem aqui na Trancoso Resolve 🌴 Para que eu possa te ajudar melhor, me conta: você tá procurando um serviço ou quer se cadastrar como prestador? 😊`,
        `Olá! Obrigado pelo contato com a Trancoso Resolve 🌳 Pra eu te direcionar direito: você precisa de um profissional ou quer fazer parte da nossa vitrine de prestadores?`,
        `Oi! Recebemos sua mensagem 😊 Aqui é da Trancoso Resolve, a plataforma de serviços de Trancoso. Me conta rapidinho: você busca um serviço ou quer se cadastrar como prestador? 🌴`,
      ];
      return getRandomResponse(respostas);
    }
  }
}

async function enviarRespostaWABA(fromPhone: string, mensagem: string): Promise<void> {
  const token = Deno.env.get('token-id-whatsapp') || '';
  const phoneId = Deno.env.get('phone-number-id-whatsapp') || '';
  if (!token || !phoneId) {
    console.warn('[whatsappWebhook] token-id-whatsapp ou phone-number-id-whatsapp não configurados — pulando resposta automática');
    return;
  }

  await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: fromPhone,
      type: 'text',
      text: { preview_url: false, body: mensagem },
    }),
  });
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || DEFAULT_VERIFY_TOKEN;

    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === verifyToken) {
        return new Response(challenge || '', { status: 200 });
      }
      console.warn('[whatsappWebhook] verificação falhou:', { mode, token });
      return new Response('Forbidden', { status: 403 });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const base44 = createClientFromRequest(req);

      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      const contact = change?.value?.contacts?.[0];

      if (!message) {
        return Response.json({ status: 'status_update_ignored' }, { status: 200 });
      }

      const fromPhone = message.from;
      const messageText = message.text?.body || '';
      const contactName = contact?.profile?.name || '';
      const messageId = message.id;

      console.log(`[whatsappWebhook] mensagem recebida de +${fromPhone}: "${messageText.substring(0, 80)}"`);

      await base44.asServiceRole.entities.LogWhatsApp.create({
        tipo: 'recebido',
        telefone: `+${fromPhone}`,
        mensagem: messageText,
        status: 'recebido',
        message_id: messageId,
        timestamp: new Date().toISOString(),
      });

      const intencao = classificarIntencao(messageText);
      const replyText = gerarResposta(intencao, messageText, contactName);

      await enviarRespostaWABA(fromPhone, replyText);

      await base44.asServiceRole.entities.LogWhatsApp.create({
        tipo: 'resposta_ia',
        telefone: `+${fromPhone}`,
        mensagem: replyText.substring(0, 500),
        status: 'enviado',
        timestamp: new Date().toISOString(),
      });

      if (intencao === 'lead' || intencao === 'prestador') {
        try {
          await base44.asServiceRole.entities.LeadPreLancamento.create({
            name: contactName || `WhatsApp +${fromPhone}`,
            phone: `+${fromPhone}`,
            message: messageText,
            source: 'whatsapp-webhook',
            type: intencao === 'prestador' ? 'prestador' : 'cliente',
          });
        } catch (e) {
          console.warn('[whatsappWebhook] erro ao criar LeadPreLancamento:', (e as Error).message);
        }
      }

      return Response.json({
        status: 'processed',
        intencao,
        contact_name: contactName,
        from: fromPhone
      }, { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    console.error('[whatsappWebhook] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});
