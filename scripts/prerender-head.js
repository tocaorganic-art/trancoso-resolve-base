#!/usr/bin/env node
/**
 * prerender-head.js
 *
 * Gera arquivos HTML estáticos por rota com <title>, <meta description> e
 * <link rel="canonical"> próprios, injetados no dist/index.html de base.
 *
 * Resultado: crawlers recebem canonical correta no HTML bruto, sem precisar
 * executar JavaScript. O app React continua funcionando normalmente para
 * usuários (o JS sobrescreve o <head> após hidratação).
 *
 * Uso: node scripts/prerender-head.js
 * Requer: dist/index.html já existente (rodar após `npm run build`).
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const BASE_URL = 'https://www.trancosoresolve.com.br';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Cada entrada = { path, title, description, ogTitle?, ogDescription? }
const ROUTES = [
  // ── Destinos principais ────────────────────────────────────────────────
  {
    path: '/trancoso',
    title: 'Serviços em Trancoso, BA — Profissionais Verificados | Trancoso Resolve',
    description: 'Encontre diaristas, eletricistas, piscineiros, jardineiros e mais em Trancoso, Bahia. Profissionais verificados para villas, pousadas e residências. Atendimento rápido.',
  },
  {
    path: '/arraial-dajuda',
    title: "Serviços em Arraial d'Ajuda — Profissionais Verificados | Trancoso Resolve",
    description: "Diaristas, eletricistas, piscineiros e profissionais verificados em Arraial d'Ajuda, Bahia. Contrate com segurança, resposta em até 2 horas.",
  },
  {
    path: '/porto-seguro',
    title: 'Serviços em Porto Seguro — Profissionais Verificados | Trancoso Resolve',
    description: 'Profissionais verificados em Porto Seguro, Bahia: diaristas, eletricistas, jardineiros, piscineiros. Atendimento para residências, pousadas e empresas.',
  },
  {
    path: '/caraiva',
    title: 'Serviços em Caraíva — Profissionais Verificados | Trancoso Resolve',
    description: 'Diaristas, piscineiros e profissionais verificados em Caraíva, Bahia. Plataforma com avaliações reais e análise de antecedentes.',
  },

  // ── Páginas institucionais ─────────────────────────────────────────────
  {
    path: '/SejaPrestador',
    title: 'Seja Prestador | Trancoso Resolve — Ofereça Seus Serviços em Trancoso',
    description: 'Cadastre-se como prestador de serviços em Trancoso Resolve e conecte-se a clientes na Costa do Descobrimento. Crie seu perfil e comece a receber pedidos.',
  },
  {
    path: '/Planos',
    title: 'Planos para Prestadores | Trancoso Resolve',
    description: "Escolha o plano ideal para seu negócio em Trancoso, Arraial d'Ajuda ou Porto Seguro. Visibilidade, agendamentos e ferramentas para crescer.",
  },
  {
    path: '/About',
    title: 'Sobre o Trancoso Resolve — Nossa História e Missão',
    description: 'Conheça o Trancoso Resolve, o marketplace de serviços locais da Costa do Descobrimento. Nossa missão é conectar moradores e turistas a profissionais de confiança.',
  },
  {
    path: '/Contact',
    title: 'Contato | Trancoso Resolve',
    description: 'Entre em contato com o Trancoso Resolve. Atendimento via WhatsApp, e-mail ou formulário para clientes e prestadores de serviço.',
  },
  {
    path: '/ServicosCategoria',
    title: 'Todos os Serviços em Trancoso | Trancoso Resolve',
    description: "Explore todas as categorias de serviço disponíveis em Trancoso, Arraial d'Ajuda e Porto Seguro: diaristas, eletricistas, piscineiros, jardineiros e muito mais.",
  },

  // ── Serviços Trancoso ──────────────────────────────────────────────────
  {
    path: '/servicos/diarista-trancoso',
    title: 'Diarista em Trancoso, BA — Limpeza de Villas e Pousadas | Trancoso Resolve',
    description: 'Contrate diaristas verificadas em Trancoso, Bahia para limpeza de villas, pousadas e casas de temporada. Avaliações reais, resposta em até 2 horas.',
  },
  {
    path: '/servicos/eletricista-trancoso',
    title: 'Eletricista em Trancoso, BA — Emergência e Instalações | Trancoso Resolve',
    description: 'Eletricistas verificados em Trancoso para emergências, instalações e manutenção elétrica em residências, pousadas e villas. Atendimento rápido na Bahia.',
  },
  {
    path: '/servicos/piscineiro-trancoso',
    title: 'Piscineiro em Trancoso, BA — Limpeza e Manutenção | Trancoso Resolve',
    description: 'Serviço de limpeza e manutenção de piscinas em Trancoso, Bahia. Piscineiros verificados para villas, pousadas e residências.',
  },
  {
    path: '/servicos/pedreiro-trancoso',
    title: 'Pedreiro em Trancoso, BA — Reformas e Construção | Trancoso Resolve',
    description: 'Pedreiros verificados em Trancoso para reformas, construção e serviços gerais. Profissionais experientes na Costa do Descobrimento, Bahia.',
  },
  {
    path: '/servicos/pintor-trancoso',
    title: 'Pintor em Trancoso, BA — Pintura Interna e Externa | Trancoso Resolve',
    description: 'Pintores verificados em Trancoso, Bahia para pintura interna e externa de residências, villas e pousadas.',
  },
  {
    path: '/servicos/jardineiro-trancoso',
    title: 'Jardineiro em Trancoso, BA — Paisagismo e Manutenção | Trancoso Resolve',
    description: 'Jardineiros especializados em Trancoso para paisagismo, poda e manutenção de jardins em villas, pousadas e residências.',
  },
  {
    path: '/servicos/encanador-trancoso',
    title: 'Encanador em Trancoso, BA — Emergências e Instalações | Trancoso Resolve',
    description: 'Encanadores verificados em Trancoso para emergências hidráulicas, instalações e manutenção. Atendimento rápido para villas, pousadas e residências.',
  },
  {
    path: '/servicos/chef-trancoso',
    title: 'Chef e Cozinheiro Particular em Trancoso, BA | Trancoso Resolve',
    description: 'Contrate chef ou cozinheiro particular em Trancoso, Bahia para jantares, eventos e temporadas. Profissionais experientes em culinária local e internacional.',
  },
  {
    path: '/servicos/seguranca-trancoso',
    title: 'Segurança Particular em Trancoso, BA — Eventos e Residências | Trancoso Resolve',
    description: 'Profissionais de segurança verificados em Trancoso para eventos, residências e estabelecimentos. Costa do Descobrimento, Bahia.',
  },
  {
    path: '/servicos/motorista-trancoso',
    title: 'Motorista Particular em Trancoso, BA | Trancoso Resolve',
    description: 'Motoristas particulares verificados em Trancoso para traslados, passeios e serviços de transporte na Costa do Descobrimento, Bahia.',
  },
  {
    path: '/servicos/dj-trancoso',
    title: 'DJ em Trancoso, BA — Eventos e Festas | Trancoso Resolve',
    description: 'Contrate DJs para festas, casamentos e eventos em Trancoso, Bahia. Profissionais com equipamentos completos e experiência no Quadrado de Trancoso.',
  },
  {
    path: '/servicos/quadrado-trancoso',
    title: 'Serviços no Quadrado de Trancoso — Profissionais Locais | Trancoso Resolve',
    description: 'Serviços especializados na área do Quadrado de Trancoso. Diaristas, eletricistas e profissionais que conhecem o centro histórico de Trancoso.',
  },
  {
    path: '/servicos/rio-verde-trancoso',
    title: 'Serviços em Rio Verde, Trancoso — Profissionais Verificados | Trancoso Resolve',
    description: 'Profissionais verificados para casas e villas no bairro Rio Verde, Trancoso, Bahia. Diaristas, eletricistas e mais.',
  },
  {
    path: '/servicos/pitinga-trancoso',
    title: 'Serviços na Pitinga, Trancoso — Profissionais Verificados | Trancoso Resolve',
    description: 'Profissionais verificados para a Praia da Pitinga, Trancoso. Diaristas, jardineiros e manutenção de residências de praia.',
  },

  // ── Serviços Arraial d'Ajuda ───────────────────────────────────────────
  {
    path: '/servicos/diarista-arraial-dajuda',
    title: "Diarista em Arraial d'Ajuda, BA | Trancoso Resolve",
    description: "Diaristas verificadas em Arraial d'Ajuda, Bahia para limpeza de pousadas, casas de temporada e villas. Avaliações reais, resposta rápida.",
  },
  {
    path: '/servicos/eletricista-arraial-dajuda',
    title: "Eletricista em Arraial d'Ajuda, BA | Trancoso Resolve",
    description: "Eletricistas verificados em Arraial d'Ajuda para instalações e emergências elétricas. Atendimento rápido a residências e pousadas.",
  },
  {
    path: '/servicos/piscineiro-arraial-dajuda',
    title: "Piscineiro em Arraial d'Ajuda, BA | Trancoso Resolve",
    description: "Limpeza e manutenção de piscinas em Arraial d'Ajuda, Bahia. Piscineiros verificados, atendimento regular ou avulso.",
  },
  {
    path: '/servicos/cozinheiro-arraial-dajuda',
    title: "Cozinheiro e Chef em Arraial d'Ajuda, BA | Trancoso Resolve",
    description: "Chef e cozinheiro particular em Arraial d'Ajuda para jantares, eventos e temporadas.",
  },
  {
    path: '/servicos/jardineiro-arraial-dajuda',
    title: "Jardineiro em Arraial d'Ajuda, BA | Trancoso Resolve",
    description: "Jardineiros especializados em Arraial d'Ajuda para manutenção de jardins e paisagismo em pousadas e residências.",
  },
  {
    path: '/servicos/pedreiro-arraial-dajuda',
    title: "Pedreiro em Arraial d'Ajuda, BA | Trancoso Resolve",
    description: "Pedreiros verificados em Arraial d'Ajuda para reformas, construção e serviços gerais de manutenção residencial.",
  },

  // ── Serviços Porto Seguro ──────────────────────────────────────────────
  {
    path: '/servicos/diarista-porto-seguro',
    title: 'Diarista em Porto Seguro, BA | Trancoso Resolve',
    description: 'Diaristas verificadas em Porto Seguro, Bahia para limpeza de residências, pousadas e estabelecimentos.',
  },
  {
    path: '/servicos/eletricista-porto-seguro',
    title: 'Eletricista em Porto Seguro, BA | Trancoso Resolve',
    description: 'Eletricistas verificados em Porto Seguro para emergências e instalações elétricas residenciais e comerciais.',
  },
  {
    path: '/servicos/piscineiro-porto-seguro',
    title: 'Piscineiro em Porto Seguro, BA | Trancoso Resolve',
    description: 'Limpeza e manutenção de piscinas em Porto Seguro, Bahia. Profissionais verificados, atendimento residencial e empresarial.',
  },
  {
    path: '/servicos/cozinheiro-porto-seguro',
    title: 'Cozinheiro Particular em Porto Seguro, BA | Trancoso Resolve',
    description: 'Chef e cozinheiro particular em Porto Seguro para eventos, temporadas e jantares especiais.',
  },
  {
    path: '/servicos/jardineiro-porto-seguro',
    title: 'Jardineiro em Porto Seguro, BA | Trancoso Resolve',
    description: 'Jardineiros em Porto Seguro para manutenção de jardins, paisagismo e cuidados com áreas verdes.',
  },
  {
    path: '/servicos/pedreiro-porto-seguro',
    title: 'Pedreiro em Porto Seguro, BA | Trancoso Resolve',
    description: 'Pedreiros verificados em Porto Seguro para reformas, construção e serviços de manutenção.',
  },

  // ── Serviços Caraíva ───────────────────────────────────────────────────
  {
    path: '/servicos/diarista-caraiva',
    title: 'Diarista em Caraíva, BA | Trancoso Resolve',
    description: 'Diaristas verificadas em Caraíva, Bahia para limpeza de pousadas e residências de praia.',
  },
  {
    path: '/servicos/eletricista-caraiva',
    title: 'Eletricista em Caraíva, BA | Trancoso Resolve',
    description: 'Eletricistas em Caraíva para instalações e manutenção elétrica em residências e pousadas.',
  },
  {
    path: '/servicos/piscineiro-caraiva',
    title: 'Piscineiro em Caraíva, BA | Trancoso Resolve',
    description: 'Manutenção e limpeza de piscinas em Caraíva, Bahia. Profissionais disponíveis para residências e pousadas.',
  },
  {
    path: '/servicos/cozinheiro-caraiva',
    title: 'Cozinheiro em Caraíva, BA | Trancoso Resolve',
    description: 'Cozinheiro e chef particular em Caraíva para jantares e eventos. Especialistas em culinária da Costa do Descobrimento.',
  },
  {
    path: '/servicos/jardineiro-caraiva',
    title: 'Jardineiro em Caraíva, BA | Trancoso Resolve',
    description: 'Jardineiros em Caraíva para cuidado de jardins e áreas externas de pousadas e residências.',
  },
  {
    path: '/servicos/pedreiro-caraiva',
    title: 'Pedreiro em Caraíva, BA | Trancoso Resolve',
    description: 'Pedreiros em Caraíva para reformas e serviços de construção civil.',
  },

  // ── Destinos especiais ─────────────────────────────────────────────────
  {
    path: '/destinos/casamento-trancoso',
    title: 'Casamento em Trancoso, BA — Serviços e Fornecedores | Trancoso Resolve',
    description: 'Organize seu casamento em Trancoso com profissionais verificados: DJs, cozinheiros, seguranças e serviços de limpeza. Casamentos inesquecíveis no Quadrado.',
  },
  {
    path: '/destinos/reveillon-trancoso',
    title: 'Réveillon em Trancoso, BA — Serviços e Profissionais | Trancoso Resolve',
    description: 'Profissionais para seu Réveillon em Trancoso: cozinheiros, DJs, seguranças e limpeza de villa. Festas inesquecíveis na Costa do Descobrimento.',
  },

  // ── Guias ─────────────────────────────────────────────────────────────
  {
    path: '/guides/morar-em-trancoso',
    title: 'Morar em Trancoso, BA — Guia Completo | Trancoso Resolve',
    description: 'Guia completo para quem quer morar em Trancoso, Bahia: serviços essenciais, infraestrutura, profissionais locais e dicas de quem vive no Quadrado.',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeForAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectHead(html, route) {
  const canonical = `${BASE_URL}${route.path}`;
  const title     = escapeForAttr(route.title);
  const desc      = escapeForAttr(route.description);
  const ogTitle   = escapeForAttr(route.ogTitle        || route.title);
  const ogDesc    = escapeForAttr(route.ogDescription  || route.description);

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/,   `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,         `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,    `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,  `$1${ogTitle}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${ogDesc}$2`);
}

function outputPath(routePath) {
  // '/trancoso'              → 'dist/trancoso.html'
  // '/servicos/diarista'     → 'dist/servicos/diarista.html'
  const segments = routePath.split('/').filter(Boolean);
  return path.join(DIST_DIR, ...segments) + '.html';
}

// ── Main ───────────────────────────────────────────────────────────────────

const indexPath = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('✗ dist/index.html não encontrado. Execute `npm run build` antes.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexPath, 'utf-8');

let ok = 0;
let fail = 0;

for (const route of ROUTES) {
  try {
    const dest = outputPath(route.path);
    const dir  = path.dirname(dest);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dest, injectHead(baseHtml, route), 'utf-8');

    console.log(`  ✓  ${route.path}`);
    ok++;
  } catch (err) {
    console.error(`  ✗  ${route.path} — ${err.message}`);
    fail++;
  }
}

console.log(`\nPrerender concluído: ${ok} rotas geradas${fail ? `, ${fail} erros` : ''}.`);
if (fail) process.exit(1);
