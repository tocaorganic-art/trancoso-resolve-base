import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DEFAULT_VERIFY_TOKEN = 'trancoso_resolve_2026';
const CODE_VERSION = 'v5.3-filtered';

const IGNORED_NUMBERS = ['5573998283579', '55739998283579', '13368103670', '3368103670'];

function isIgnoredNumber(phone: string): boolean {
  const clean = phone.replace(/\D/g, '');
  for (const n of IGNORED_NUMBERS) {
    if (clean === n || clean.endsWith(n) || n.endsWith(clean)) return true;
  }
  return false;
}

const PRESTADOR_KEYWORDS = ['cadastrar','cadastro','prestador','seja prestador','sejaprestador','ofereço serviço','ofereco servico','sou prestador','trabalhar','meu serviço','meu servico','profissional','plano','planos','quero anunciar','anunciar','vitrine'];
const SERVICO_KEYWORDS = ['preço','preco','serviço','servico','preciso','contratar','diarista','eletricista','piscineiro','pedreiro','cozinheiro','chef','jardineiro','encanador','agendar','orçamento','orcamento','quanto custa','valor','contrato','reformar','limpeza','cozinhar','piscina','jardim','marceneiro','pintor','faz tudo','caseiro','babá','baba','motorista','fotógrafo','fotografo','dj'];
const SEGURANCA_KEYWORDS = ['seguro','segurança','verificado','confiável','confiavel','garantia'];
const COMO_FUNCIONA_KEYWORDS = ['como funciona','funciona','que é','o que é','plataforma','site'];
const INFO_KEYWORDS = ['olá','ola','oi','bom dia','boa tarde','boa noite','informação','informacao'];

type Intencao = 'prestador'|'servico'|'seguranca'|'como_funciona'|'info'|'outro';

function classificarIntencao(texto: string): Intencao {
  const lower = texto.toLowerCase();
  if (SEGURANCA_KEYWORDS.some((kw) => lower.includes(kw))) return 'seguranca';
  if (COMO_FUNCIONA_KEYWORDS.some((kw) => lower.includes(kw))) return 'como_funciona';
  if (PRESTADOR_KEYWORDS.some((kw) => lower.includes(kw))) return 'prestador';
  if (SERVICO_KEYWORDS.some((kw) => lower.includes(kw))) return 'servico';
  if (INFO_KEYWORDS.some((kw) => lower.includes(kw))) return 'info';
  return 'outro';
}

function getReplyByIntencao(intencao: Intencao, messageText: string): string {
  const lower = messageText.toLowerCase();
  switch (intencao) {
    case 'prestador':
      return 'Oi! Que massa que você quer se cadastrar! 🌴\n\nA Trancoso Resolve conecta moradores e turistas aos melhores prestadores de Trancoso.\n\nPra agilizar, entre no site https://trancosoresolve.com.br/SejaPrestador e comece seu cadastro. Ou me passa aqui:\n\n1) Seu nome completo\n2) Qual serviço você oferece\n3) Bairro/região de atendimento\n4) WhatsApp pra contato\n\nEu já começo a montar seu perfil!';
    case 'servico': {
      const servicosMap: Record<string, string> = {'jardineiro':'jardineiro-trancoso','jardim':'jardineiro-trancoso','eletricista':'eletricista-trancoso','encanador':'encanador-trancoso','pedreiro':'pedreiro-trancoso','pintor':'pintor-trancoso','diarista':'diarista-trancoso','limpeza':'diarista-trancoso','cozinheiro':'cozinheiro-trancoso','chef':'chef-trancoso','piscineiro':'piscineiro-trancoso','piscina':'piscineiro-trancoso','marceneiro':'marceneiro-trancoso','caseiro':'caseiro-trancoso','motorista':'motorista-trancoso','fotógrafo':'fotografo-trancoso','fotografo':'fotografo-trancoso','dj':'dj-trancoso'};
      for (const [keyword, slug] of Object.entries(servicosMap)) {
        if (lower.includes(keyword)) return `Oi! 👋 Achamos o que você precisa! Veja os profissionais disponíveis aqui: https://trancosoresolve.com.br/servicos/${slug}\n\nLá você vê os prestadores verificados em Trancoso, com avaliações e contato direto.\n\nSe preferir, me conta:\n1) Em qual bairro ou região de Trancoso?\n2) Tem urgência ou pode agendar?\n\nAssim eu te ajudo a encontrar o profissional certo! 🌴`;
      }
      return 'Oi! Recebemos sua mensagem aqui na Trancoso Resolve 🌴\n\nVocê pode buscar serviços ou se cadastrar como prestador no site: https://trancosoresolve.com.br\n\nPra eu te ajudar melhor: você tá procurando um serviço ou quer se cadastrar como prestador? 😊';
    }
    case 'seguranca':
      return 'Ótima pergunta! 🔒 Na Trancoso Resolve, todos os prestadores passam por verificação. Avaliações reais de clientes garantem confiança.\n\nSaiba mais: https://trancosoresolve.com.br\n\nQuer contratar um serviço ou se cadastrar como prestador?';
    case 'como_funciona':
    case 'info':
      return 'Oi! 👋 Aqui é da Trancoso Resolve 🌴\n\nSomos a vitrine digital oficial de Trancoso. Conectamos moradores, turistas e empresários aos melhores prestadores de serviço da região.\n\nAcesse: https://trancosoresolve.com.br\n\nComo podemos te ajudar?\n1) Preciso de um serviço\n2) Quero me cadastrar como prestador\n3) Como funciona a plataforma?\n\nÉ só me dizer! 😊';
    default:
      return 'Oi! Recebemos sua mensagem aqui na Trancoso Resolve 🌴\n\nVocê pode buscar serviços ou se cadastrar como prestador no site: https://trancosoresolve.com.br\n\nPra eu te ajudar melhor: você tá procurando um serviço ou quer se cadastrar como prestador? 😊';
  }
}

async function enviarRespostaWABA(fromPhone: string, mensagem: string): Promise<void> {
  const token = Deno.env.get('token-id-whatsapp') || '';
  const phoneId = Deno.env.get('phone-number-id-whatsapp') || '';
  if (!token || !phoneId) { console.warn('[whatsappWebhook] secrets não configurados'); return; }
  await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: fromPhone, type: 'text', text: { preview_url: false, body: mensagem } }),
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
      if (mode === 'subscribe' && token === verifyToken) return new Response(challenge || '', { status: 200 });
      return new Response('Forbidden', { status: 403 });
    }
    if (req.method === 'POST') {
      const body = await req.json();
      const base44 = createClientFromRequest(req);
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      const contact = change?.value?.contacts?.[0];
      if (!message) return Response.json({ status: 'status_update_ignored' }, { status: 200 });
      const fromPhone = message.from;
      const messageText = message.text?.body || '';
      const contactName = contact?.profile?.name || '';
      const messageId = message.id;

      if (isIgnoredNumber(fromPhone)) {
        console.log(`[whatsappWebhook] MENSAGEM IGNORADA (número oficial): +${fromPhone}`);
        return Response.json({ status: 'ignored_official_number', code_version: CODE_VERSION }, { status: 200 });
      }
      if (!messageText || messageText.trim().length === 0) {
        return Response.json({ status: 'no_text_ignored', code_version: CODE_VERSION }, { status: 200 });
      }
      console.log(`[whatsappWebhook] mensagem recebida de +${fromPhone}: "${messageText.substring(0, 80)}"`);

      try {
        await base44.asServiceRole.entities.LogWhatsApp.create({ tipo: 'recebido', telefone: `+${fromPhone}`, mensagem: messageText, status: 'recebido', message_id: messageId, timestamp: new Date().toISOString() });
      } catch (e) { console.warn('[whatsappWebhook] erro log:', (e as Error).message); }

      const intencao = classificarIntencao(messageText);
      let leadId: string | null = null;
      if (intencao === 'servico' || intencao === 'prestador') {
        try {
          const lead = await base44.asServiceRole.entities.LeadPreLancamento.create({ name: contactName || `WhatsApp +${fromPhone}`, phone: `+${fromPhone}`, message: messageText, source: 'whatsapp-webhook-v5.2', type: intencao === 'prestador' ? 'prestador' : 'cliente' });
          leadId = lead?.id || null;
        } catch (e) { console.warn('[whatsappWebhook] erro lead:', (e as Error).message); }
      }

      const replyText = getReplyByIntencao(intencao, messageText);
      await enviarRespostaWABA(fromPhone, replyText);

      try {
        await base44.asServiceRole.entities.LogWhatsApp.create({ tipo: 'enviado', telefone: `+${fromPhone}`, mensagem: replyText, status: 'enviado', timestamp: new Date().toISOString() });
      } catch (e) { console.warn('[whatsappWebhook] erro log resposta:', (e as Error).message); }

      return Response.json({ status: 'processed', intencao, lead_created: leadId !== null, code_version: CODE_VERSION }, { status: 200 });
    }
    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    console.error('[whatsappWebhook] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});
