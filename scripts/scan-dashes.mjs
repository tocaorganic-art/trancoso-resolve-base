// Script de validação (não faz parte do build): visita cada rota em dois viewports
// e escaneia title, meta tags, texto visível e atributos (alt/aria-label/placeholder)
// por travessão (—), meia-risca (–) ou " - " usado como separador.
import { chromium } from 'playwright';

const BASE = process.env.SCAN_BASE_URL || 'http://localhost:4173';

// Lista baseada nas rotas REAIS definidas em src/App.jsx (não nos nomes supostos do
// pedido original, que incluía variantes PascalCase/kebab inexistentes como /Sobre).
const routes = [
  '/', '/About', '/sobre', '/Contact', '/contato', '/planos', '/seja-prestador',
  '/ServicosCategoria', '/Servicos', '/servicos', '/participar', '/investidores', '/prestador-fundador',
  '/como-funciona', '/ajuda', '/login', '/register', '/forgot-password', '/reset-password',
  '/politica-privacidade', '/termos-de-uso', '/TermosDeServico', '/PoliticaDevolucoes',
  '/PreLancamento', '/Recomendador', '/AssistenteIA', '/Concierge', '/TocaConcierge',
  '/AssinaturaConfirmada', '/SolicitacaoConfirmada', '/VerificacaoDocumento', '/VerificacaoAntecedentes',
  '/configuracoes', '/Assistentevirtual',
  '/Trancoso', '/ArraialDAjuda', '/Caraiva', '/PortoSeguro', '/costa-do-descobrimento',
  '/destinos/trancoso', '/destinos/arraial-dajuda', '/destinos/caraiva', '/destinos/porto-seguro',
  '/destinos/casamento-trancoso', '/destinos/reveillon-trancoso', '/guides/morar-em-trancoso',
  '/servicos/chef-trancoso', '/servicos/diarista-trancoso', '/servicos/dj-trancoso',
  '/servicos/eletricista-trancoso', '/servicos/encanador-trancoso', '/servicos/jardineiro-trancoso',
  '/servicos/motorista-trancoso', '/servicos/pedreiro-trancoso', '/servicos/pintor-trancoso',
  '/servicos/piscineiro-trancoso', '/servicos/seguranca-trancoso',
  '/servicos/cozinheiro-arraial-dajuda', '/servicos/diarista-arraial-dajuda',
  '/servicos/eletricista-arraial-dajuda', '/servicos/jardineiro-arraial-dajuda',
  '/servicos/pedreiro-arraial-dajuda', '/servicos/piscineiro-arraial-dajuda',
  '/servicos/cozinheiro-caraiva', '/servicos/diarista-caraiva', '/servicos/eletricista-caraiva',
  '/servicos/jardineiro-caraiva', '/servicos/pedreiro-caraiva', '/servicos/piscineiro-caraiva',
  '/servicos/cozinheiro-porto-seguro', '/servicos/diarista-porto-seguro',
  '/servicos/eletricista-porto-seguro', '/servicos/jardineiro-porto-seguro',
  '/servicos/pedreiro-porto-seguro', '/servicos/piscineiro-porto-seguro',
  '/servicos/quadrado-trancoso', '/servicos/pitinga-trancoso', '/servicos/rio-verde-trancoso',
  // Rotas internas (painel/admin) — esperado exigir login; serve para confirmar
  // que ao menos a tela de login/redirect não tem traço, conteúdo interno já
  // revisado por grep no código-fonte (src/pages/Admin*, FilaVerificacao, RelatorioDiario).
  '/FilaVerificacao', '/RelatorioDiario', '/AdminAntecedentes', '/AdminPagamentos',
  '/admin/campanha-regional', '/admin/marketing', '/admin/metricas', '/admin/seo',
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

// Padrões proibidos: travessão, meia-risca, hífen-separador (espaço-hífen-espaço).
const BAD = /—|–|\s-\s/;

function findBad(text) {
  if (!text) return [];
  const hits = [];
  const re = /(—|–|\s-\s)/g;
  let m;
  while ((m = re.exec(text))) {
    const start = Math.max(0, m.index - 40);
    const end = Math.min(text.length, m.index + 40);
    hits.push(text.slice(start, end).replace(/\s+/g, ' ').trim());
  }
  return hits;
}

async function scanRoute(page, route) {
  const url = BASE + route;
  const issues = [];
  let status = null;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    status = resp ? resp.status() : null;
  } catch (e) {
    return { route, error: String(e.message || e), issues: [] };
  }

  const data = await page.evaluate(() => {
    const getMeta = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.getAttribute('content') : null;
    };
    const attrs = [];
    document.querySelectorAll('[alt], [aria-label], [placeholder], [title]').forEach((el) => {
      ['alt', 'aria-label', 'placeholder', 'title'].forEach((a) => {
        const v = el.getAttribute(a);
        if (v) attrs.push(`${a}="${v}"`);
      });
    });
    return {
      title: document.title,
      ogTitle: getMeta('meta[property="og:title"]'),
      ogDescription: getMeta('meta[property="og:description"]'),
      description: getMeta('meta[name="description"]'),
      twitterTitle: getMeta('meta[name="twitter:title"]'),
      twitterDescription: getMeta('meta[name="twitter:description"]'),
      bodyText: document.body.innerText,
      attrs,
    };
  });

  const fields = {
    title: data.title,
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    description: data.description,
    twitterTitle: data.twitterTitle,
    twitterDescription: data.twitterDescription,
  };
  for (const [field, value] of Object.entries(fields)) {
    const hits = findBad(value);
    if (hits.length) issues.push({ field, hits });
  }
  const bodyHits = findBad(data.bodyText);
  if (bodyHits.length) issues.push({ field: 'bodyText', hits: bodyHits });

  for (const attr of data.attrs) {
    const hits = findBad(attr);
    if (hits.length) issues.push({ field: 'attr', hits });
  }

  return { route, status, issues };
}

async function main() {
  const browser = await chromium.launch();
  const report = [];
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    for (const route of routes) {
      const result = await scanRoute(page, route);
      if (result.error || (result.issues && result.issues.length)) {
        report.push({ viewport: vp.name, ...result });
      }
      process.stdout.write(`[${vp.name}] ${route} -> ${result.error ? 'ERRO: ' + result.error : (result.issues.length ? result.issues.length + ' problema(s)' : 'OK')}\n`);
    }
    await context.close();
  }
  await browser.close();

  console.log('\n=== RESUMO ===');
  if (report.length === 0) {
    console.log('ZERO ocorrências de traço encontradas em todas as rotas, desktop e mobile.');
  } else {
    console.log(`${report.length} rota(s)/viewport com problemas:`);
    for (const r of report) {
      console.log(`\n[${r.viewport}] ${r.route} (status ${r.status ?? 'n/a'})`);
      if (r.error) console.log(`  ERRO: ${r.error}`);
      for (const issue of r.issues || []) {
        console.log(`  campo=${issue.field}:`);
        for (const h of issue.hits) console.log(`    ...${h}...`);
      }
    }
  }
  process.exit(report.length === 0 ? 0 : 1);
}

main();
