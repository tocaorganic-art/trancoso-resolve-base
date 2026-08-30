import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Regressão: PR #7/#8/#9 corrigiram o Pixel ID oficial da Trancoso Resolve para
// 1469130194903035, mas os IDs antigos continuaram hardcoded nas functions de
// Conversions API do backend (metaCAPI, sendCapiEvent, testMetaConversion,
// mercadoPagoWebhook, cancelarAssinatura) — eventos server-side eram enviados
// para o Pixel errado, quebrando a deduplicação com o Pixel client-side.
// Este teste varre todo o repositório e falha se qualquer um dos dois IDs
// antigos reaparecer em código-fonte ou documentação.

const OLD_IDS = ['908361385639766', '2222634538513651'];
const OFFICIAL_PIXEL_ID = '1469130194903035';

const SCAN_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.md']);
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.claude', '.claude-flow',
  '.agents', '.swarm', '.npm-cache-codex', 'coverage',
]);

async function collectFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, files);
    } else if (/\.(test|spec)\.[^.]+$/.test(entry.name)) {
      continue;
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

test('nenhum arquivo do repositório referencia os Pixel IDs antigos do Meta', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const files = await collectFiles(root);
  const offenders = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const oldId of OLD_IDS) {
      if (content.includes(oldId)) {
        // AUDITORIA_FASE1_META_2026-08-26.md documenta a investigação histórica
        // do dia 26/08/2026 e traz uma errata explícita — mantido de propósito.
        if (file.includes('AUDITORIA_FASE1_META_2026-08-26.md')) continue;
        // fixLoop resubscreve o app do WhatsApp Business — usa um Meta App ID
        // (não o Pixel de anúncios); coincide em dígitos mas é outro recurso.
        if (file.includes(path.join('functions', 'fixLoop', 'entry.ts'))) continue;
        // este próprio arquivo de teste declara os IDs antigos como constantes.
        if (file.endsWith('meta-pixel-id-consistency.test.js')) continue;
        offenders.push(`${file} contém o ID antigo ${oldId}`);
      }
    }
  }

  assert.deepEqual(offenders, [], `IDs antigos encontrados:\n${offenders.join('\n')}`);
});

test('as functions de Meta Conversions API usam o Pixel ID oficial', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const capiFunctions = [
    'base44/functions/metaCAPI/entry.ts',
    'base44/functions/sendCapiEvent/entry.ts',
    'base44/functions/testMetaConversion/entry.ts',
    'base44/functions/mercadoPagoWebhook/entry.ts',
    'base44/functions/cancelarAssinatura/entry.ts',
  ];

  for (const relPath of capiFunctions) {
    const content = await readFile(path.join(root, relPath), 'utf8');
    assert.match(
      content,
      new RegExp(OFFICIAL_PIXEL_ID),
      `${relPath} deveria usar o Pixel ID oficial ${OFFICIAL_PIXEL_ID}`,
    );
  }
});
