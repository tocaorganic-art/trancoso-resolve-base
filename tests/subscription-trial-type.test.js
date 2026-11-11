import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const schema = JSON.parse(readFileSync('base44/entities/Subscription.jsonc', 'utf8'));
const permitidos = schema.properties.trial_type.enum;

test('todo trial_type gravado pelas funções existe no enum do Subscription', () => {
  const dir = 'base44/functions';
  const usados = new Set();
  for (const fn of readdirSync(dir)) {
    let src = '';
    try { src = readFileSync(join(dir, fn, 'entry.ts'), 'utf8'); } catch { continue; }
    if (!/Subscription/.test(src)) continue;
    for (const m of src.matchAll(/'((?:free|profissional)_\d+d)'/g)) usados.add(m[1]);
  }
  assert.ok(usados.has('free_60d'), 'criarTrialPrestador deve gravar free_60d');
  for (const t of usados) assert.ok(permitidos.includes(t), `trial_type ${t} fora do enum`);
});
