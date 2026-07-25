// Testes de contrato para o DTO público de disponibilidade de vagas Fundador.
//
// Reimplementa a MESMA lógica de base44/functions/getFounderStats/entry.ts
// (ver test/README.md para por que não é um import direto). Qualquer mudança
// no comportamento de entry.ts deve ser espelhada aqui.

import test from 'node:test';
import assert from 'node:assert/strict';

const FOUNDER_LIMIT = 100;

// Espelha o corpo do try em entry.ts.
function computeFounderStats(grants) {
  const taken = (grants || []).filter((g) => g && g.status === 'active').length;
  return {
    taken,
    remaining: Math.max(0, FOUNDER_LIMIT - taken),
    limit: FOUNDER_LIMIT,
    open: taken < FOUNDER_LIMIT,
    unavailable: false,
  };
}

// Espelha o corpo do catch em entry.ts.
function unavailableFounderStats() {
  return {
    taken: null,
    remaining: null,
    limit: FOUNDER_LIMIT,
    open: false,
    unavailable: true,
    error: 'FOUNDER_STATS_UNAVAILABLE',
  };
}

const ALLOWED_PUBLIC_FIELDS = new Set(['taken', 'remaining', 'limit', 'open', 'unavailable', 'error']);
const FORBIDDEN_FIELDS = [
  'provider_email',
  'provider_name',
  'provider_id',
  'revocation_reason',
  'id',
  'granted_at',
  'revoked_at',
  'position',
  'promotion_version',
];

function assertNoForbiddenFields(dto) {
  for (const field of FORBIDDEN_FIELDS) {
    assert.equal(Object.prototype.hasOwnProperty.call(dto, field), false, `DTO não deve conter "${field}"`);
  }
  for (const key of Object.keys(dto)) {
    assert.ok(ALLOWED_PUBLIC_FIELDS.has(key), `Campo inesperado no DTO público: "${key}"`);
  }
}

test('contagem: zero grants ativos', () => {
  const dto = computeFounderStats([]);
  assert.equal(dto.taken, 0);
  assert.equal(dto.remaining, 100);
  assert.equal(dto.open, true);
  assertNoForbiddenFields(dto);
});

test('contagem: um grant ativo', () => {
  const dto = computeFounderStats([{ status: 'active' }]);
  assert.equal(dto.taken, 1);
  assert.equal(dto.remaining, 99);
  assert.equal(dto.open, true);
});

test('contagem: 99 ativos ainda está aberto', () => {
  const grants = Array.from({ length: 99 }, () => ({ status: 'active' }));
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 99);
  assert.equal(dto.remaining, 1);
  assert.equal(dto.open, true);
});

test('contagem: 100 ativos fecha o programa', () => {
  const grants = Array.from({ length: 100 }, () => ({ status: 'active' }));
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 100);
  assert.equal(dto.remaining, 0);
  assert.equal(dto.open, false);
});

test('contagem: grants revogados não contam', () => {
  const grants = [
    { status: 'active' },
    { status: 'active' },
    { status: 'revoked' },
    { status: 'revoked' },
  ];
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 2);
  assert.equal(dto.remaining, 98);
});

test('contagem: limite nunca fica negativo mesmo com mais de 100 grants ativos (dado inconsistente)', () => {
  const grants = Array.from({ length: 137 }, () => ({ status: 'active' }));
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 137);
  assert.equal(dto.remaining, 0, 'remaining deve ser clampado em 0, nunca negativo');
  assert.equal(dto.open, false);
});

test('contagem: grants sem status ou undefined não quebram e não contam', () => {
  const dto = computeFounderStats([{}, { status: undefined }, { status: 'pending' }]);
  assert.equal(dto.taken, 0);
});

test('contagem: lista nula ou indefinida não quebra (equivalente a array vazio)', () => {
  assert.equal(computeFounderStats(null).taken, 0);
  assert.equal(computeFounderStats(undefined).taken, 0);
});

test('falha: DTO de indisponibilidade nunca declara vagas', () => {
  const dto = unavailableFounderStats();
  assert.equal(dto.open, false, 'open nunca pode ser true quando a consulta falhou');
  assert.notEqual(dto.taken, 0, 'taken não pode ser inventado como 0 em erro');
  assert.notEqual(dto.remaining, 100, 'remaining não pode ser inventado como 100 em erro');
  assert.equal(dto.taken, null);
  assert.equal(dto.remaining, null);
  assert.equal(dto.unavailable, true);
  assertNoForbiddenFields(dto);
});

test('DTO público (sucesso) não expõe nenhum campo sensível de FounderGrant', () => {
  const dto = computeFounderStats([{ status: 'active', provider_email: 'x@y.com', id: 'abc' }]);
  assertNoForbiddenFields(dto);
});

test('DTO público (indisponível) não expõe stack trace nem detalhes internos', () => {
  const dto = unavailableFounderStats();
  const serialized = JSON.stringify(dto);
  assert.ok(!serialized.includes('Error'), 'não deve serializar objetos de erro/stack');
  assertNoForbiddenFields(dto);
});
