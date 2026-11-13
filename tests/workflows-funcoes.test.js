import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const workflows = readdirSync('base44/workflows').filter((f) => f.endsWith('.jsonc'));
const chamadas = workflows.flatMap((f) => {
  const src = readFileSync(`base44/workflows/${f}`, 'utf8');
  return [...src.matchAll(/"function_name":\s*"([^"]+)"/g)].map((m) => ({ wf: f, fn: m[1] }));
});

test('todo workflow chama uma função que existe no repositório', () => {
  for (const { wf, fn } of chamadas) {
    assert.ok(existsSync(`base44/functions/${fn}/entry.ts`), `${wf} chama ${fn}, que não existe`);
  }
});

test('função chamada por workflow não exige só o segredo: aceita o admin que o Base44 usa', () => {
  for (const fn of new Set(chamadas.map((c) => c.fn))) {
    const src = readFileSync(`base44/functions/${fn}/entry.ts`, 'utf8');
    if (!src.includes('x-automation-secret')) continue;
    assert.match(src, /auth\.me\(|isTrustedCaller|role === ['"]admin['"]/, `${fn} recusaria o próprio workflow`);
  }
});
