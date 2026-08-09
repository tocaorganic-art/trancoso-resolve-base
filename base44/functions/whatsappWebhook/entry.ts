import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DEFAULT_VERIFY_TOKEN = 'trancoso_resolve_2026';
const SITE_URL = 'https://trancosoresolve.com.br';

// === MAPEAMENTO DE SERVICOS PARA PAGINAS DO SITE ===
const SERVICO_PARA_PAGINA: Record<string, string> = {
  'eletricista': '/servicos/eletricista-trancoso',
  'encanador': '/servicos/encanador-trancoso',
  'diarista': '/servicos/diarista-trancoso',
  'faxineiro': '/servicos/diarista-trancoso',
  'pedreiro': '/servicos/pedreiro-trancoso',
  'pintor': '/servicos/pintor-trancoso',
  'pintura': '/servicos/pintor-trancoso',
  'jardineiro': '/servicos/jardineiro-trancoso',
  'jardim': '/servicos/jardineiro-trancoso',
  'cozinheiro': '/servicos/chef-trancoso',
  'chef': '/servicos/chef-trancoso',
  'piscineiro': '/servicos/piscineiro-trancoso',
  'piscina': '/servicos/piscineiro-trancoso',
  'azulejista': '/servicos/azulejista-trancoso',
  'dj': '/servicos/dj-trancoso',
  'fotógrafo': '/servicos/fotografo-trancoso',
  'fotografo': '/servicos/fotografo-trancoso',
  'decoração': '/servicos/decoracao-trancoso',
  'decoracao': '/servicos/decoracao-trancoso',
  'mototaxi': '/servicos/mototaxi-trancoso',
  'transfer': '/servicos/mototaxi-trancoso',
};

// === SISTEMA DE RESPOSTAS CONVERSACIONAIS ===

const SERVICO_KEYWORDS = [
  'preço', 'preco', 'serviço', 'servico', 'preciso', 'contratar',
  'diarista', 'eletricista', 'piscineiro', 'pedreiro', 'cozinheiro',
  'chef', 'jardineiro', 'encanador', 'agendar', 'orçamento', 'orcamento',
  'quanto custa', 'valor', 'contrato', 'reformar', 'limpeza', 'cozinhar',
  'piscina', 'jardim', 'pintor', 'pintura', 'azulejista', 'marido',
  'caseiro', 'faxineiro', 'cozinheira', 'camareira', 'auxiliar',
  'mototaxi', 'corrida', 'transfer', 'festa', 'evento', 'casamento',
  'dj', 'fotógrafo', 'fotografo', 'decoração', 'decoracao',
  'tem alguém', 'tem alguem', 'conhece alguém', 'conhece alguem',
  'indica', 'indicação', 'indicacao', 'alguém faz', 'alguem faz',
  'profissional', 'quem faz', 'alguém presta', 'alguem presta',
];

const PRESTADOR_KEYWORDS = [
  'cadastrar', 'cadastro', 'cadastre', 'registrar', 'registro',
  'prestador', 'anunciar', 'anúncio', 'anuncio',
  'trabalhar', 'oferecer', 'meu serviço', 'meu servico',
  'sou prestador', 'quero aparecer', 'divulgar', 'vitrine',
  'quero ser prestador', 'quero anunciar', 'quero oferecer',
];

const COMO_FUNCIONA_KEYWORDS = [
  'como funciona', 'como que funciona', 'como q funciona',
  'o que é', 'o que e', 'o que voce faz', 'o que você faz',
  'pra que serve', 'para que serve', 'duvida', 'dúvida',
  'explica', 'me explica', 'funcionamento',
];

const SEGURANCA_KEYWORDS = [
  'segurança', 'seguranca', 'confiança', 'confianca', 'confiável',
  'confiavel', 'verificado', 'verificação', 'verificacao',
  'antecedentes', 'criminal', 'seguro', 'confio', 'é seguro',
  'e seguro', 'posso confiar', 'documento', 'verificam',
  'verificacao de documento', 'verificacao de antecedentes',
];

const PLANOS_KEYWORDS = [
  'plano', 'planos', 'preço do plano', 'quanto custa o plano',
  'gratuito', 'grátis', 'gratis', 'mensalidade', 'assinatura',
  'pagar', 'quanto custa anunciar', 'valor do plano',
];

const SAUDACAO_KEYWORDS = [
  'olá', 'ola', 'oi', 'bom dia', 'boa tarde', 'boa noite',
  'informação', 'informacao', 'ajuda', 'falar com', 'atendente', 'contato',
];

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function identificarServico(texto: string): string | null {
  const lower = texto.toLowerCase().trim();
  for (const [keyword, pagina] of Object.entries(SERVICO_PARA_PAGINA)) {
    if (lower.includes(keyword)) {
      return pagina;
    }
  }
  return null;
}

function classificarIntencao(texto: string): 'servico' | 'prestador' | 'como_funciona' | 'seguranca' | 'planos' | 'saudacao' | 'outro' {
  const lower = texto.toLowerCase().trim();

  // Ordem de prioridade: seguranca > como_funciona > prestador > servico > planos > saudacao > outro
  // Seguranca e como_funciona primeiro para nao conflitar com 'contratar'/'servico' que sao genericos
  if (SEGURANCA_KEYWORDS.some((kw) => lower.includes(kw))) return 'seguranca';
  if (COMO_FUNCIONA_KEYWORDS.some((kw) => lower.includes(kw))) return 'como_funciona';
  if (PRESTADOR_KEYWORDS.some((kw) => lower.includes(kw))) return 'prestador';
  if (SERVICO_KEYWORDS.some((kw) => lower.includes(kw))) return 'servico';
  if (PLANOS_KEYWORDS.some((kw) => lower.includes(kw))) return 'planos';
  if (SAUDACAO_KEYWORDS.some((kw) => lower.includes(kw))) return 'saudacao';
  return 'outro';
}

function gerarResposta(intencao: string, messageText: string, contactName: string): string {
  const nome = contactName ? contactName.split(' ')[0] : '';

  switch (intencao) {
    case 'servico': {
      // Identifica se tem um servico especifico pra mandar o link direto
      const paginaServico = identificarServico(messageText);
      const linkServico = paginaServico ? `${SITE_URL}${paginaServico}` : SITE_URL;

      if (paginaServico) {
        const respostas = [
          `Oi${nome ? ' ' + nome : ''}! 👋 Achamos o que você precisa! Você pode ver os profissionais disponíveis direto aqui: ${linkServico}\n\nLá você vê os prestadores verificados em Trancoso, com avaliações e contato direto.\n\nSe preferir, me conta aqui mesmo:\n1) Em qual bairro ou região de Trancoso?\n2) Tem urgência ou pode agendar?\n\nAssim eu te ajudo a encontrar o profissional certo! 🌴`,
          `Olá${nome ? ' ' + nome : ''}! Pra facilitar, entre direto no link: ${linkServico}\n\nLá você já vê os profissionais disponíveis, com avaliações e contato direto 😊\n\nOu me conta aqui:\n1) Que região de Trancoso?\n2) É urgente ou tem flexibilidade de horário?\n\nVou encontrar o profissional certo pra você!`,
          `Oi${nome ? ' ' + nome : ''}! O jeito mais rápido é entrar no link: ${linkServico}\n\nLá você encontra os profissionais verificados de Trancoso, com avaliações de quem já usou 🌴\n\nSe preferir conversar aqui, me conta:\n1) Qual bairro/região?\n2) Melhor horário pra atendimento?\n\nResponda quando puder que eu te ajudo 👀`,
        ];
        return getRandomResponse(respostas);
      }

      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! 👋 Você pode encontrar o profissional que precisa direto no nosso site: ${SITE_URL}\n\nLá você busca pelo serviço (eletricista, encanador, diarista, pedreiro, etc) e já vê os profissionais disponíveis em Trancoso, com avaliações e contato direto.\n\nMas se preferir, me conta aqui mesmo:\n1) Qual serviço você precisa?\n2) Em qual bairro ou região de Trancoso?\n3) Tem urgência ou pode agendar?\n\nAssim eu te ajudo a encontrar o prestador certo! 🌴`,
        `Olá${nome ? ' ' + nome : ''}! Pra facilitar, você pode entrar direto no site ${SITE_URL} e buscar pelo serviço que você precisa. Lá você já vê os profissionais disponíveis em Trancoso, com avaliações e contato direto 😊\n\nOu me conta aqui:\n1) Que serviço você tá precisando?\n2) Em qual região de Trancoso?\n3) É urgente ou tem flexibilidade de horário?\n\nVou encontrar o profissional certo pra você!`,
        `Oi${nome ? ' ' + nome : ''}! O jeito mais rápido é entrar no site ${SITE_URL} e buscar pelo serviço. Lá você encontra os profissionais verificados de Trancoso, com avaliações de quem já usou 🌴\n\nSe preferir conversar aqui, me conta:\n1) Qual serviço você procura?\n2) Qual bairro/região?\n3) Melhor horário pra atendimento?\n\nResponda quando puder que eu te ajudo 👀`,
      ];
      return getRandomResponse(respostas);
    }

    case 'prestador': {
      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! Que ótimo que você quer fazer parte da Trancoso Resolve 🙌 Somos a vitrine digital oficial de Trancoso.\n\nVocê pode começar seu cadastro direto no site: ${SITE_URL}/SejaPrestador\n\nOu se preferir, me passa aqui:\n1) Qual seu nome completo?\n2) Qual serviço você oferece?\n3) Você atende presencialmente em Trancoso ou é serviço remoto?\n4) Qual seu WhatsApp pra contato?\n\nDepois te explico os planos disponíveis e como funciona a vitrine!`,
        `Olá${nome ? ' ' + nome : ''}! Excelente! A Trancoso Resolve é a vitrine digital oficial de prestadores de Trancoso 🌴\n\nComo prestador cadastrado você tem:\n✅ Aparecer no site como profissional verificado\n✅ Receber novos clientes direto no WhatsApp\n✅ Estatísticas de visualizações e cliques\n\nPra começar, entre no site ${SITE_URL}/SejaPrestador e faça seu cadastro, ou me conta aqui: qual serviço você presta e qual seu nome completo?`,
        `Oi${nome ? ' ' + nome : ''}! Que massa que você quer se cadastrar! 🌴 A Trancoso Resolve conecta moradores e turistas aos melhores prestadores de Trancoso.\n\nPra agilizar, entre no site ${SITE_URL}/SejaPrestador e comece seu cadastro. Ou me passa aqui:\n1) Seu nome completo\n2) Qual serviço você oferece\n3) Bairro/região de atendimento\n4) WhatsApp pra contato\n\nEu já começo a montar seu perfil!`,
      ];
      return getRandomResponse(respostas);
    }

    case 'como_funciona': {
      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! Posso te explicar como funciona 😊\n\nA Trancoso Resolve é uma vitrine digital: você busca pelo serviço que precisa, vê os profissionais verificados de Trancoso, compara avaliações e entra em contato direto.\n\nConfira todos os detalhes aqui: ${SITE_URL}/ComoFunciona\n\nFicou com dúvida? Me pergunta aqui que eu te ajudo! 🌴`,
        `Olá${nome ? ' ' + nome : ''}! Funciona assim: a Trancoso Resolve conecta moradores e turistas aos prestadores de serviço verificados em Trancoso. Você busca, compara, avalia e contrata direto.\n\nVeja o passo a passo completo: ${SITE_URL}/ComoFunciona\n\nQuer que eu te ajude com algo específico? 😊`,
        `Oi${nome ? ' ' + nome : ''}! A Trancoso Resolve é simples: busca o serviço, escolhe o profissional verificado, entra em contato e contrata. Tudo direto, sem intermediário.\n\nDetalhes completos: ${SITE_URL}/ComoFunciona\n\nMe conta: você procura um serviço ou quer se cadastrar? 🌴`,
      ];
      return getRandomResponse(respostas);
    }

    case 'seguranca': {
      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! Ótima pergunta 🛡️ A segurança dos clientes é prioridade na Trancoso Resolve.\n\nTodo prestador passa por verificação de identidade (documento + selfie) e verificação de antecedentes criminais. Só profissionais verificados aparecem no site.\n\nConfira nossa política de segurança completa: ${SITE_URL}/Seguranca\n\nFicou com alguma dúvida específica? Me pergunta! 😊`,
        `Olá${nome ? ' ' + nome : ''}! Pode confiar! 🛡️ Todos os prestadores da Trancoso Resolve são verificados:\n✅ Verificação de identidade (documento + selfie com IA)\n✅ Verificação de antecedentes criminais\n✅ Avaliações reais de quem já contratou\n\nSaiba mais: ${SITE_URL}/Seguranca\n\nQuer contratar um serviço com tranquilidade? É só acessar ${SITE_URL} 🌴`,
        `Oi${nome ? ' ' + nome : ''}! Entendo sua preocupação 😊 A Trancoso Resolve verifica todos os prestadores:\n1) Documento de identidade + selfie (análise por IA)\n2) Antecedentes criminais\n3) Avaliações dos clientes\n\nLeia nossa política completa: ${SITE_URL}/Seguranca\n\nTá tudo pronto pra você usar com tranquilidade! 🌴`,
      ];
      return getRandomResponse(respostas);
    }

    case 'planos': {
      const respostas = [
        `Oi${nome ? ' ' + nome : ''}! Os planos da Trancoso Resolve foram pensados pra caber no seu momento 🌴\n\nVocê pode ver todos os planos direto no site: ${SITE_URL}/Planos\n\nTem planos a partir de R$ 0 (gratuito) pra começar a aparecer no site. Conforme você cresce, pode subir de plano e ter mais destaque.\n\nQuer que eu te explique as opções? Me conta qual serviço você oferece que eu te mostro o plano ideal!`,
        `Olá${nome ? ' ' + nome : ''}! Posso te explicar os planos sim 😊 A Trancoso Resolve tem opções pra todos os tamanhos de negócio.\n\nConfira os planos no site: ${SITE_URL}/Planos\n\nMe conta: qual serviço você presta e qual seu momento atual (começando, já estabelecido, etc)? Assim eu te indico a melhor opção!`,
      ];
      return getRandomResponse(respostas);
    }

    case 'saudacao': {
      const respostas = [
        `Oi! 👋 Aqui é da Trancoso Resolve 🌴\n\nSomos a vitrine digital oficial de Trancoso. Conectamos moradores, turistas e empresários aos melhores prestadores de serviço da região.\n\nVocê pode buscar profissionais direto no site: ${SITE_URL}\n\nComo podemos te ajudar hoje?\n1) Preciso de um serviço\n2) Quero me cadastrar como prestador\n3) Como funciona a plataforma?\n\nÉ só me dizer! 😊`,
        `Olá! Bem-vindo(a) à Trancoso Resolve 🌳\n\nSomos a plataforma que conecta quem precisa de serviço com quem oferece em Trancoso e região. Tudo verificado, com avaliações de quem já usou.\n\nAcesse: ${SITE_URL}\n\nO que você precisa?\n1) Encontrar um profissional\n2) Se cadastrar como prestador\n3) Saber como funciona\n\nTô aqui pra ajudar!`,
        `Oi! Que bom falar com você! 😊 A Trancoso Resolve é a vitrine digital de serviços de Trancoso.\n\nNo site ${SITE_URL} você encontra profissionais verificados pra tudo: encanador, eletricista, diarista, pedreiro, jardineiro e muito mais. Também pode se cadastrar como prestador se quiser! 🌴\n\nMe conta: você tá procurando um serviço ou quer se cadastrar?`,
      ];
      return getRandomResponse(respostas);
    }

    default: {
      const respostas = [
        `Oi! Recebemos sua mensagem aqui na Trancoso Resolve 🌴\n\nVocê pode buscar serviços ou se cadastrar como prestador direto no site: ${SITE_URL}\n\nPra eu te ajudar melhor: você tá procurando um serviço, quer se cadastrar como prestador, ou tem dúvida sobre como funciona? 😊`,
        `Olá! Obrigado pelo contato com a Trancoso Resolve 🌳\n\nAcesse nosso site: ${SITE_URL}\n\nPra eu te direcionar direito: você precisa de um profissional, quer se cadastrar, ou tem dúvida sobre a plataforma?`,
        `Oi! Recebemos sua mensagem 😊 Aqui é da Trancoso Resolve, a plataforma de serviços de Trancoso.\n\nSite: ${SITE_URL}\n\nMe conta rapidinho: você busca um serviço, quer se cadastrar como prestador, ou quer saber como funciona? 🌴`,
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
      text: { preview_url: true, body: mensagem },
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

      if (intencao === 'servico' || intencao === 'prestador') {
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
