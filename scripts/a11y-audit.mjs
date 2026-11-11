// Auditoria de acessibilidade (axe, WCAG 2 A e AA) em desktop e mobile.
// Uso: node scripts/a11y-audit.mjs [baseUrl]   (padrão http://localhost:5173)
// Sai com código 1 se houver violação séria ou crítica.
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = (process.argv[2] || process.env.A11Y_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const rotas = [
  '/',
  '/servicos',
  '/seja-prestador',
  '/planos',
  '/login',
  '/register',
  '/investidores',
  '/contato',
  '/ajuda',
  '/servicos/eletricista-trancoso',
  '/servicos/diarista-trancoso',
];
const viewports = [
  { nome: 'desktop', width: 1440, height: 900 },
  { nome: 'mobile', width: 390, height: 844 },
];
const graves = new Set(['serious', 'critical']);

const browser = await chromium.launch();
const resultados = [];
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  for (const rota of rotas) {
    const page = await context.newPage();
    const item = { rota, viewport: vp.nome, violacoes: [], erro: null };
    try {
      await page.goto(baseUrl + rota, { waitUntil: 'networkidle', timeout: 45000 });
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      item.violacoes = axe.violations.map((v) => ({
        id: v.id,
        impacto: v.impact,
        ajuda: v.help,
        nos: v.nodes.length,
        exemplo: v.nodes[0]?.target?.join(' ') ?? '',
      }));
    } catch (e) {
      item.erro = String(e?.message ?? e).split('\n')[0];
    }
    resultados.push(item);
    await page.close();
  }
  await context.close();
}
await browser.close();

const totalGraves = resultados.reduce(
  (n, r) => n + r.violacoes.filter((v) => graves.has(v.impacto)).length,
  0,
);
const erros = resultados.filter((r) => r.erro).length;
mkdirSync('docs/auditoria', { recursive: true });
writeFileSync(
  'docs/auditoria/a11y.json',
  `${JSON.stringify({ baseUrl, geradoEm: new Date().toISOString(), totalGraves, erros, resultados }, null, 2)}\n`,
);

for (const r of resultados) {
  const g = r.violacoes.filter((v) => graves.has(v.impacto));
  const resumo = r.erro ? `ERRO ${r.erro}` : `${g.length} graves, ${r.violacoes.length - g.length} leves`;
  console.log(`${r.viewport.padEnd(7)} ${r.rota.padEnd(34)} ${resumo}`);
  for (const v of g) console.log(`          [${v.impacto}] ${v.id} (${v.nos} nós) ${v.exemplo}`);
}
console.log(`\nTotal de violações sérias ou críticas: ${totalGraves}. Rotas com erro: ${erros}.`);
process.exit(totalGraves > 0 || erros > 0 ? 1 : 0);
