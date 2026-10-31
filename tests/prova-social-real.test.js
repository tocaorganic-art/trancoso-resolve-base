import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Depoimentos: nenhum texto fixo nem avatar de banco de imagem no componente', async () => {
  const source = await read('../src/components/home/Testimonials.jsx');

  assert.doesNotMatch(source, /pravatar/);
  assert.doesNotMatch(source, /Ana Júlia|Carlos F\.|Mariana C\./);
  assert.match(source, /if \(reais\.length === 0\) return null;/);
});

test('Depoimentos: traduções não carregam mais os comentários fabricados', async () => {
  const source = await read('../src/i18n/translations.js');

  assert.doesNotMatch(source, /testimonials: \{[^}]*comments:/);
  assert.doesNotMatch(source, /salvou minhas férias/);
});

test('Barra de prova social: sem fallback fixo de profissionais', async () => {
  const source = await read('../src/components/home/SocialProofBar.jsx');

  assert.doesNotMatch(source, /:\s*19\b/);
  assert.match(source, /total > 0/);
});
