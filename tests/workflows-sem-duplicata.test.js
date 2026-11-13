import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'base44/workflows';
const workflows = readdirSync(dir)
  .filter((f) => f.endsWith('.jsonc'))
  .map((file) => {
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const cfg = json.trigger?.config ?? {};
    const fns = (json.definition?.do ?? [])
      .flatMap((step) => Object.values(step))
      .map((s) => s?.with?.function_name)
      .filter(Boolean);
    return { file, cfg, fns };
  });

function pares() {
  const out = [];
  for (let i = 0; i < workflows.length; i += 1) {
    for (let j = i + 1; j < workflows.length; j += 1) {
      const a = workflows[i];
      const b = workflows[j];
      if (a.fns.some((fn) => b.fns.includes(fn))) out.push([a, b]);
    }
  }
  return out;
}

test('nenhuma função é chamada por dois workflows no mesmo evento da mesma entidade', () => {
  for (const [a, b] of pares()) {
    if (a.cfg.trigger_type !== 'entity' || b.cfg.trigger_type !== 'entity') continue;
    if (a.cfg.entity_name !== b.cfg.entity_name) continue;
    const comuns = (a.cfg.events ?? []).filter((e) => (b.cfg.events ?? []).includes(e));
    assert.deepEqual(comuns, [], `${a.file} e ${b.file} disparam em dobro em ${comuns.join(', ')}`);
  }
});

test('nenhuma função agendada roda duas vezes no mesmo cron', () => {
  for (const [a, b] of pares()) {
    if (a.cfg.trigger_type !== 'scheduled' || b.cfg.trigger_type !== 'scheduled') continue;
    assert.notEqual(
      a.cfg.cron_expression,
      b.cfg.cron_expression,
      `${a.file} e ${b.file} repetem o mesmo agendamento`,
    );
  }
});
