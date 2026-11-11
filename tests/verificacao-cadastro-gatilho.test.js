import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = JSON.parse(
  readFileSync('base44/workflows/Auto Verificar Novo Prestador.jsonc', 'utf8'),
);
const fn = readFileSync('base44/functions/verificarAntecedentes/entry.ts', 'utf8');

test('gatilho dispara no ServiceProviderPrivate com CPF e nascimento', () => {
  assert.equal(workflow.trigger.config.entity_name, 'ServiceProviderPrivate');
  assert.deepEqual(workflow.trigger.config.events, ['create']);
  assert.match(workflow.trigger.condition, /trigger\.data\.cpf/);
  assert.match(workflow.trigger.condition, /trigger\.data\.data_nascimento/);
});

test('id do prestador vem de data.service_provider_id antes de data.id', () => {
  const linha = fn.split('\n').find((l) => l.includes('body.data?.service_provider_id'));
  assert.ok(linha, 'precedência de service_provider_id ausente');
  assert.ok(
    linha.indexOf('body.data?.service_provider_id') < linha.indexOf('body.data?.id'),
  );
});

test('consulta paga só roda com INFOSIMPLES_CONSULTA_ATIVA=true', () => {
  assert.match(fn, /Deno\.env\.get\("INFOSIMPLES_CONSULTA_ATIVA"\) === "true"/);
  const gate = fn.indexOf('consultaPagaAtiva');
  const chamada = fn.indexOf('"https://api.infosimples.com');
  assert.ok(gate > 0 && chamada > gate, 'gate precisa vir antes da chamada paga');
});

test('análise manual não depende mais de isInternal (PJ e dados faltando)', () => {
  assert.doesNotMatch(fn, /isInternal && \(provider as any\)\.autorizou_verificacao/);
  assert.match(fn, /!isPessoaFisica/);
});
