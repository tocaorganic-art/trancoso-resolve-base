#!/usr/bin/env node
/**
 * test-whatsapp.js — testa envio de mensagens WhatsApp do Trancoso Resolve
 *
 * Uso:
 *   node scripts/test-whatsapp.js <telefone> <tipo> [nome] [extra]
 *
 * Exemplos:
 *   node scripts/test-whatsapp.js 5573998283579 boas_vindas "Maria Silva"
 *   node scripts/test-whatsapp.js 5573998283579 aprovacao "João Costa" "https://trancosoresolve.com.br/planos"
 *   node scripts/test-whatsapp.js 5573998283579 link_pagamento "Ana Lima" "https://trancosoresolve.com.br/planos"
 *   node scripts/test-whatsapp.js 5573998283579 boas_vindas_plano "Carlos" "Prestador Lançamento (R$29,90/mês)"
 *   node scripts/test-whatsapp.js 5573998283579 suporte "Pedro"
 *
 * Variáveis de ambiente opcionais:
 *   BASE44_APP_ID   — App ID do Base44 (para envio real via function)
 *   BASE44_TOKEN    — Token de autenticação Base44
 *   DRY_RUN=true    — apenas exibe a mensagem e o link wa.me, sem enviar
 */

const [,, telefoneArg, tipo = 'boas_vindas', nome = 'Prestador', extra = ''] = process.argv;

if (!telefoneArg) {
  console.error('Uso: node scripts/test-whatsapp.js <telefone> <tipo> [nome] [extra]');
  console.error('Tipos: boas_vindas | aprovacao | link_pagamento | boas_vindas_plano | suporte');
  process.exit(1);
}

// Normaliza para E.164 brasileiro
let tel = telefoneArg.replace(/\D/g, '');
if (!tel.startsWith('55') && tel.length <= 11) tel = `55${tel}`;
const telE164 = `+${tel}`;

// Templates de mensagem
const templates = {
  boas_vindas: (n) =>
    `Olá, *${n}*! 👋\nBem-vindo(a) ao *Trancoso Resolve* — o hub de serviços da Costa do Descobrimento.\nRecebemos seu cadastro e nossa equipe está revisando seu perfil.\nEm breve você receberá uma confirmação. Qualquer dúvida, é só chamar! 😊`,

  aprovacao: (n, link) =>
    `🎉 Parabéns, *${n}*!\nSeu perfil foi *aprovado* no *Trancoso Resolve*!\nAgora você já aparece para clientes em Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva.\nComplete seu plano para começar a receber contatos:\n👉 ${link || 'https://trancosoresolve.com.br/planos'}\nBem-vindo(a) à família Trancoso Resolve! 🌴`,

  link_pagamento: (n, link) =>
    `Olá, *${n}*! 💳\nSeu perfil está aprovado! Para ativar sua conta e começar a receber clientes, complete seu plano pelo link abaixo:\n👉 ${link || 'https://trancosoresolve.com.br/planos'}\nQualquer dúvida, estamos aqui! 😊`,

  boas_vindas_plano: (n, plano) =>
    `Olá, *${n}*! 🎉 Seu plano *${plano || 'Trancoso Resolve'}* está ativo.\n\nA partir de agora seu perfil aparece nas buscas e você começa a receber leads de clientes na região.\n\nAcesse seu painel: https://trancosoresolve.com.br/dashboard\n\nQualquer dúvida, é só chamar. A gente resolve! ✅`,

  suporte: (n) =>
    `Olá, *${n}*! 🛠️\nNossa equipe de suporte do *Trancoso Resolve* recebeu sua solicitação e em breve retornará.\nHorário de atendimento: Seg–Sex, 8h–18h.\nEnquanto isso, consulte nosso guia: https://trancosoresolve.com.br/manual`,
};

const templateFn = templates[tipo];
if (!templateFn) {
  console.error(`Tipo inválido: "${tipo}". Use: ${Object.keys(templates).join(' | ')}`);
  process.exit(1);
}

const mensagem = templateFn(nome, extra);
const linkWaMe = `https://wa.me/${tel}?text=${encodeURIComponent(mensagem)}`;

console.log('\n─────────────────────────────────────────');
console.log(`Tipo    : ${tipo}`);
console.log(`Destino : ${telE164}`);
console.log(`Nome    : ${nome}`);
if (extra) console.log(`Extra   : ${extra}`);
console.log('─────────────────────────────────────────');
console.log('\nMensagem:\n');
console.log(mensagem);
console.log('\n─────────────────────────────────────────');
console.log('\nLink wa.me (abre no celular):\n');
console.log(linkWaMe);
console.log('');

// Modo dry-run: só exibe, não envia
if (process.env.DRY_RUN === 'true') {
  console.log('DRY_RUN=true — nenhuma requisição enviada.\n');
  process.exit(0);
}

// Envio real via Base44 function (requer BASE44_APP_ID + BASE44_TOKEN)
const appId = process.env.BASE44_APP_ID;
const token = process.env.BASE44_TOKEN;

if (!appId || !token) {
  console.log('ℹ️  BASE44_APP_ID e/ou BASE44_TOKEN não definidos.');
  console.log('   Para envio real, rode:');
  console.log(`   BASE44_APP_ID=<id> BASE44_TOKEN=<token> node scripts/test-whatsapp.js ${tel} ${tipo} "${nome}"${extra ? ` "${extra}"` : ''}`);
  console.log('   Ou abra o link wa.me acima no seu celular para enviar manualmente.\n');
  process.exit(0);
}

const url = `https://app.base44.com/api/apps/${appId}/functions/enviarMensagemWhatsApp`;

console.log('Enviando via Base44...\n');

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    tipo,
    telefone: telE164,
    mensagem,
  }),
})
  .then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      console.log(`✅ Mensagem enviada! message_id=${data.message_id} log_id=${data.log_id}\n`);
    } else {
      console.error(`❌ Falha ao enviar: ${data.error || JSON.stringify(data)}\n`);
      console.log('Fallback — abra o link wa.me acima no celular para enviar manualmente.\n');
    }
  })
  .catch((err) => {
    console.error(`❌ Erro de rede: ${err.message}\n`);
    console.log('Fallback — abra o link wa.me acima no celular para enviar manualmente.\n');
  });
