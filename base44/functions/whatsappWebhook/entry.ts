import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DEFAULT_VERIFY_TOKEN = 'trancoso_resolve_2026';
const SITE_URL = 'https://trancosoresolve.com.br';
const CODE_VERSION = 'v5-fixed-urls-br';

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
  'carpinteiro': '/servicos/carpinteiro-trancoso',
  'marceneiro': '/servicos/carpinteiro-trancoso',
  'marido': '/servicos/marido-de-aluguel-trancoso',
  'caseiro': '/servicos/caseiro-trancoso',
  'cozinheira': '/servicos/chef-trancoso',
  'camareira': '/servicos/camareira-trancoso',
};

const SERVICO_KEYWORDS = [
  'preço','preco','serviço','servico','preciso','contratar',
  'diarista','eletricista','piscineiro','pedreiro','cozinheiro',
  'chef','jardineiro','encanador','agendar','orçamento','orcamento',
  'quanto custa','valor','contrato','reformar','limpeza','cozinhar',
  'piscina','jardim','pintor','pintura','azulejista','marido',
  'caseiro','faxineiro','cozinheira','camareira','auxiliar',
  'mototaxi','corrida','transfer','festa','evento','casamento',
  'dj','fotógrafo','fotografo','decoração','decoracao',
  'carpinteiro','marceneiro','madeira','móveis','moveis',
  'tem alguém','tem alguem','conhece alguém','conhece alguem',
  'indica','indicação','indicacao','alguém faz','alguem faz',
  'profissional','quem faz','alguém presta','alguem presta',
  'buscar','procurando',
];

const PRESTADOR_KEYWORDS = [
  'cadastrar','cadastro','cadastre','registrar','registro',
  'prestador','anunciar','anúncio','anuncio',
  'trabalhar','oferecer','meu serviço','meu servico',
  'sou prestador','quero aparecer','divulgar','vitrine',
  'quero ser prestador','quero anunciar','quero oferecer',
  'anunciar meu','cadastrar meu',
];

const COMO_FUNCIONA_KEYWORDS = [
  'como funciona','como que funciona','como q funciona',
  'o que é','o que e','o que voce faz','o que você faz',
  'pra que serve','para que serve','duvida','dúvida',
  'explica','me explica','funcionamento',
];

const SEGURANCA_KEYWORDS = [
  'segurança','seguranca','confiança','confianca','confiável',
  'confiavel','verificado','verificação','verificacao',
  'antecedentes','criminal','seguro','confio','é seguro',
  'e seguro','posso confiar','documento','verificam',
  'risco','golpe','fraude',
];

const PLANOS_KEYWORDS = [
  'plano','planos','preço do plano','quanto custa o plano',
  'gratuito','grátis','gratis','mensalidade','assinatura',
  'pagar','quanto custa anunciar','valor do plano',
];

const SAUDACAO_KEYWORDS = [
  'olá','ola','oi','bom dia','boa tarde','boa noite',
  'informação','informacao','ajuda','falar com','atendente','contato',
];

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function identificarServico(texto: string): string | null {
  const lower = texto.toLowerCase().trim();
  for (const [keyword, pagina] of Object.entries(SERVICO_PARA_PAGINA)) {
    if (lower.includes(keyword)) return pagina;
  }
  return null;
}

function classificarIntencao(texto: string): 'servico' | 'prestador' | 'como_funciona' | 'seguranca' | 'planos' | 'saudacao' | 'outro' {
  const lower = texto.toLowerCase().trim();
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
      const paginaServico = identificarServico(messageText);
      const linkServico = paginaServico ? `${SITE_URL}${paginaServico}` : SITE_URL;
      if (paginaServico) {
        return `Oi${nome ? ' ' + nome : ''}! 👋 Achamos o que você precisa! Veja os profissionais disponíveis aqui: ${linkServico}\n\nLá você vê os prestadores verificados em Trancoso, com avaliações e contato direto.\n\nSe preferir, me conta:\n1) Em qual bairro ou região de Trancoso?\n2) Tem urgência ou pode agendar?\n\nAssim eu te ajudo a encontrar o profissional certo! 🌴`;
      }
      return `Oi${nome ? ' ' + nome : ''}! 👋 Você pode encontrar o profissional que precisa direto no site: ${SITE_URL}\n\nLá você busca pelo serviço e já vê os profissionais disponíveis em Trancoso, com avaliações e contato direto.\n\nMas se preferir, me conta:\n1) Qual serviço você precisa?\n2) Em qual bairro ou região de Trancoso?\n3) Tem urgência ou pode agendar?\n\nAssim eu te ajudo a encontrar o prestador certo! 🌴`;
    }
    case 'prestador': {
      return `Oi${nome ? ' ' + nome : ''}! Que ótimo que você quer fazer parte da Trancoso Resolve 🙌 Somos a vitrine digital oficial de Trancoso.\n\nComece seu cadastro direto no site: ${SITE_URL}/SejaPrestador\n\nOu me passa aqui:\n1) Qual seu nome completo?\n2) Qual serviço você oferece?\n3) Bairro/região de atendimento?\n4) WhatsApp pra contato?\n\nDepois te explico os planos e como funciona a vitrine!`;
    }
    case 'como_funciona': {
      return `Oi${nome ? ' ' + nome : ''}! Posso te explicar 😊\n\nA Trancoso Resolve é uma vitrine digital: você busca o serviço, vê os profissionais verificados de Trancoso, compara avaliações e entra em contato direto.\n\nDetalhes aqui: ${SITE_URL}/ComoFunciona\n\nFicou com dúvida? Me pergunta! 🌴`;
    }
    case 'seguranca': {
      return `Oi${nome ? ' ' + nome : ''}! Ótima pergunta 🛡️ A segurança é prioridade na Trancoso Resolve.\n\nTodo prestador passa por verificação de identidade (documento + selfie) e antecedentes criminais. Só profissionais verificados aparecem no site.\n\nSaiba mais: ${SITE_URL}/Seguranca\n\nFicou com dúvida? Me pergunta! 😊`;
    }
    case 'planos': {
      return `Oi${nome ? ' ' + nome : ''}! Os planos da Trancoso Resolve foram pensados pra caber no seu momento 🌴\n\nVeja todos os planos no site: ${SITE_URL}/Planos\n\nTem planos a partir de R$ 0 (gratuito). Conforme você cresce, pode subir de plano e ter mais destaque.\n\nMe conta qual serviço você oferece que eu te mostro o plano ideal!`;
    }
    case 'saudacao': {
      return `Oi! 👋 Aqui é da Trancoso Resolve 🌴\n\nSomos a vitrine digital oficial de Trancoso. Conectamos moradores, turistas e empresários aos melhores prestadores de serviço da região.\n\nAcesse: ${SITE_URL}\n\nComo podemos te ajudar?\n1) Preciso de um serviço\n2) Quero me cadastrar como prestador\n3) Como funciona a plataforma?\n\nÉ só me dizer! 😊`;
    }
    default: {
      return `Oi! Recebemos sua mensagem aqui na Trancoso Resolve 🌴\n\nVocê pode buscar serviços ou se cadastrar como prestador no site: ${SITE_URL}\n\nPra eu te ajudar melhor: você tá procurando um serviço ou quer se cadastrar como prestador? 😊`;
    }
  }
}

async function enviarRespostaWABA(fromPhone: string, mensagem: string): Promise<void> {
  const token = Deno.env.get('token-id-whatsapp') || '';
  const phoneId = Deno.env.get('phone-number-id-whatsapp') || '';
  if (!token || !phoneId) {
    console.warn('[whatsappWebhook] secrets não configurados');
    return;
  }
  await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

      console.log(`[whatsappWebhook ${CODE_VERSION}] mensagem de +${fromPhone}: "${messageText.substring(0, 80)}"`);

      try {
        await base44.asServiceRole.entities.LogWhatsApp.create({
          tipo: 'recebido',
          telefone: `+${fromPhone}`,
          mensagem: messageText,
          status: 'recebido',
          message_id: messageId,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[whatsappWebhook] erro LogWhatsApp:', (e as Error).message);
      }

      const intencao = classificarIntencao(messageText);
      const replyText = gerarResposta(intencao, messageText, contactName);

      await enviarRespostaWABA(fromPhone, replyText);

      try {
        await base44.asServiceRole.entities.LogWhatsApp.create({
          tipo: 'resposta_ia',
          telefone: `+${fromPhone}`,
          mensagem: replyText.substring(0, 500),
          status: 'enviado',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[whatsappWebhook] erro LogWhatsApp resposta:', (e as Error).message);
      }

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
          console.warn('[whatsappWebhook] erro LeadPreLancamento:', (e as Error).message);
        }
      }

      return Response.json({
        status: 'processed',
        intencao,
        contact_name: contactName,
        from: fromPhone,
        code_version: CODE_VERSION,
      }, { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    console.error('[whatsappWebhook] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});
