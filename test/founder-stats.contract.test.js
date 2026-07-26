// Testes de contrato para o DTO público de disponibilidade de vagas Fundador.
//
// Reimplementa a MESMA lógica de base44/functions/getFounderStats/entry.ts
// (ver test/README.md para por que não é um import direto). Qualquer mudança
// no comportamento de entry.ts deve ser espelhada aqui.
//
// REGRA COMERCIAL CRÍTICA:
//   taken = total de vagas PERMANENTEMENTE consumidas (active + revoked).
//   Grants revogados NÃO liberam a vaga para outro prestador.
//   active é apenas informacional (quem ainda tem o selo ativo).
//   remaining = 100 - taken (nunca negativo).

import test from 'node:test';
import assert from 'node:assert/strict';

const FOUNDER_LIMIT = 100;

// Espelha o corpo do try em entry.ts (versão corrigida — taken = allGrants.length).
function computeFounderStats(grants) {
  const allGrants = grants || [];
  // taken = vagas consumidas permanentemente (active + revoked)
  const taken = allGrants.length;
  // active = fundadores que ainda mantêm o selo vigente
  const active = allGrants.filter((g) => g && g.status === 'active').length;
  return {
    taken,
    active,
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
    active: null,
    remaining: null,
    limit: FOUNDER_LIMIT,
    open: false,
    unavailable: true,
    error: 'FOUNDER_STATS_UNAVAILABLE',
  };
}

const ALLOWED_PUBLIC_FIELDS = new Set([
  'taken', 'active', 'remaining', 'limit', 'open', 'unavailable', 'error',
]);
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
    assert.equal(
      Object.prototype.hasOwnProperty.call(dto, field),
      false,
      `DTO não deve conter "${field}"`
    );
  }
  for (const key of Object.keys(dto)) {
    assert.ok(ALLOWED_PUBLIC_FIELDS.has(key), `Campo inesperado no DTO público: "${key}"`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// CONTAGEM DE VAGAS
// ────────────────────────────────────────────────────────────────────────────

test('contagem: zero grants — 100 vagas disponíveis', () => {
  const dto = computeFounderStats([]);
  assert.equal(dto.taken, 0);
  assert.equal(dto.active, 0);
  assert.equal(dto.remaining, 100);
  assert.equal(dto.open, true);
  assertNoForbiddenFields(dto);
});

test('contagem: um grant ativo', () => {
  const dto = computeFounderStats([{ status: 'active' }]);
  assert.equal(dto.taken, 1);
  assert.equal(dto.active, 1);
  assert.equal(dto.remaining, 99);
  assert.equal(dto.open, true);
});

test('contagem: 99 grants ativos — ainda aberto, 1 vaga restante', () => {
  const grants = Array.from({ length: 99 }, () => ({ status: 'active' }));
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 99);
  assert.equal(dto.active, 99);
  assert.equal(dto.remaining, 1);
  assert.equal(dto.open, true);
});

test('contagem: 100 grants ativos — fechado, 0 vagas', () => {
  const grants = Array.from({ length: 100 }, () => ({ status: 'active' }));
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 100);
  assert.equal(dto.active, 100);
  assert.equal(dto.remaining, 0);
  assert.equal(dto.open, false);
});

// ────────────────────────────────────────────────────────────────────────────
// REGRA CRÍTICA: GRANTS REVOGADOS CONSOMEM VAGA PERMANENTEMENTE
// ────────────────────────────────────────────────────────────────────────────

test('REGRA: grant revogado CONTA como vaga consumida — não libera para outro', () => {
  const grants = [
    { status: 'active' },
    { status: 'active' },
    { status: 'revoked' }, // revogação NÃO libera a vaga
    { status: 'revoked' }, // revogação NÃO libera a vaga
  ];
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 4,   'taken deve contar active + revoked');
  assert.equal(dto.active, 2,  'active conta apenas quem ainda tem o selo');
  assert.equal(dto.remaining, 96);
  assert.equal(dto.open, true);
});

test('REGRA: 90 ativos + 10 revogados = 100 tomados, 0 restantes, fechado', () => {
  const grants = [
    ...Array.from({ length: 90 }, () => ({ status: 'active' })),
    ...Array.from({ length: 10 }, () => ({ status: 'revoked' })),
  ];
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 100);
  assert.equal(dto.active, 90);
  assert.equal(dto.remaining, 0);
  assert.equal(dto.open, false, 'programa FECHADO mesmo com apenas 90 ativos');
});

test('REGRA: 0 ativos + 100 revogados = 100 tomados, programa fechado', () => {
  // Caso extremo: todos cancelaram mas o programa não reabre
  const grants = Array.from({ length: 100 }, () => ({ status: 'revoked' }));
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 100);
  assert.equal(dto.active, 0);
  assert.equal(dto.remaining, 0);
  assert.equal(dto.open, false);
});

test('contagem: remaining nunca fica negativo mesmo com >100 grants (dado inconsistente)', () => {
  const grants = Array.from({ length: 137 }, () => ({ status: 'active' }));
  const dto = computeFounderStats(grants);
  assert.equal(dto.taken, 137);
  assert.equal(dto.remaining, 0, 'remaining deve ser clampado em 0, nunca negativo');
  assert.equal(dto.open, false);
});

test('contagem: grants sem status ou undefined não quebram e não afetam taken', () => {
  const dto = computeFounderStats([{}, { status: undefined }, { status: 'pending' }]);
  // Todos os 3 são contados em taken (são registros existentes)
  assert.equal(dto.taken, 3);
  // Mas nenhum é "active"
  assert.equal(dto.active, 0);
});

test('contagem: lista nula ou indefinida não quebra (equivalente a array vazio)', () => {
  assert.equal(computeFounderStats(null).taken, 0);
  assert.equal(computeFounderStats(undefined).taken, 0);
});

// ────────────────────────────────────────────────────────────────────────────
// PREVENÇÃO DE ACÚMULO DE TRIAL
// ────────────────────────────────────────────────────────────────────────────

// Espelha a lógica de criarTrialPrestador/entry.ts e createSubscriptionCheckout/entry.ts
function shouldGrantTrial(existingSubscription, trialDaysRequested) {
  if (!existingSubscription) {
    // Sem assinatura anterior: concede trial normalmente
    return { grant: true, effectiveDays: trialDaysRequested };
  }
  if (existingSubscription.trial_consumed_at) {
    // Trial já foi consumido — não concede outro
    return { grant: false, effectiveDays: 0 };
  }
  return { grant: true, effectiveDays: trialDaysRequested };
}

test('trial: primeiro usuário sem assinatura recebe trial completo', () => {
  const result = shouldGrantTrial(null, 7);
  assert.equal(result.grant, true);
  assert.equal(result.effectiveDays, 7);
});

test('trial: usuário com trial_consumed_at não recebe novo trial', () => {
  const sub = { trial_consumed_at: '2026-01-01T00:00:00Z', trial_type: 'free_30d' };
  const result = shouldGrantTrial(sub, 7);
  assert.equal(result.grant, false, 'trial já consumido — não conceder novo');
  assert.equal(result.effectiveDays, 0, 'effectiveDays deve ser zero');
});

test('trial: usuário com Teste Gratuito (30d) não recebe trial Profissional (7d)', () => {
  // Simula usuário que fez trial gratuito e agora assina o Profissional
  const sub = { trial_consumed_at: '2026-01-01T00:00:00Z', trial_type: 'free_30d' };
  const result = shouldGrantTrial(sub, 7);
  assert.equal(result.grant, false, 'quem usou o Teste Gratuito não recebe trial do Profissional');
  assert.equal(result.effectiveDays, 0);
});

test('trial: usuário sem trial_consumed_at mas com assinatura existente recebe trial normalmente', () => {
  // Assinatura criada antes da feature de trial_consumed_at
  const sub = { plan: 'trial', status: 'trial' }; // sem trial_consumed_at
  const result = shouldGrantTrial(sub, 7);
  assert.equal(result.grant, true);
  assert.equal(result.effectiveDays, 7);
});

test('trial: fail-closed — erro ao verificar trial anterior bloqueia o trial por segurança', () => {
  // Espelha o comportamento de createSubscriptionCheckout: em erro → effectiveDays = 0
  function checkoutTrialDays(checkFailed, requested) {
    if (checkFailed) return 0; // fail-closed
    return requested;
  }
  assert.equal(checkoutTrialDays(true, 7), 0, 'em erro, não concede trial por segurança');
  assert.equal(checkoutTrialDays(false, 7), 7);
});

// ────────────────────────────────────────────────────────────────────────────
// PRIVACIDADE E CAMPOS PÚBLICOS
// ────────────────────────────────────────────────────────────────────────────

test('DTO público (sucesso) não expõe nenhum campo sensível de FounderGrant', () => {
  const dto = computeFounderStats([
    { status: 'active', provider_email: 'x@y.com', id: 'abc', position: 1 }
  ]);
  assertNoForbiddenFields(dto);
});

test('DTO público (indisponível) não expõe stack trace nem detalhes internos', () => {
  const dto = unavailableFounderStats();
  const serialized = JSON.stringify(dto);
  assert.ok(!serialized.includes('Error'), 'não deve serializar objetos de erro/stack');
  assertNoForbiddenFields(dto);
});

test('falha: DTO de indisponibilidade nunca declara vagas disponíveis', () => {
  const dto = unavailableFounderStats();
  assert.equal(dto.open, false, 'open nunca pode ser true quando a consulta falhou');
  assert.equal(dto.taken, null, 'taken deve ser null — não inventar 0');
  assert.equal(dto.remaining, null, 'remaining deve ser null — não inventar 100');
  assert.equal(dto.unavailable, true);
  assertNoForbiddenFields(dto);
});

// ────────────────────────────────────────────────────────────────────────────
// SIMULAÇÃO DE CONCORRÊNCIA (lógica, não I/O)
// ────────────────────────────────────────────────────────────────────────────

// Espelha a checagem de idempotência antes de criar grant.
function simulateAtomicAllocation(existingGrants, newEmail) {
  // Simula a verificação no mercadoPagoWebhook
  const taken = existingGrants.length;
  if (taken >= FOUNDER_LIMIT) {
    return { ok: false, reason: 'sem_vagas' };
  }
  const alreadyHasGrant = existingGrants.some(
    (g) => g.provider_email === newEmail
  );
  if (alreadyHasGrant) {
    return { ok: false, reason: 'ja_tem_grant' };
  }
  // Simula criação do grant
  return { ok: true, position: taken + 1 };
}

test('concorrência: 99 grants existentes — primeira alocação OK', () => {
  const existing = Array.from({ length: 99 }, (_, i) => ({
    status: 'active',
    provider_email: `p${i}@example.com`,
  }));
  const result = simulateAtomicAllocation(existing, 'novo@example.com');
  assert.equal(result.ok, true);
  assert.equal(result.position, 100);
});

test('concorrência: 100 grants existentes — alocação bloqueada', () => {
  const existing = Array.from({ length: 100 }, (_, i) => ({
    status: 'active',
    provider_email: `p${i}@example.com`,
  }));
  const result = simulateAtomicAllocation(existing, 'novo@example.com');
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'sem_vagas');
});

test('concorrência: 90 ativos + 10 revogados = 100 taken — alocação bloqueada', () => {
  const existing = [
    ...Array.from({ length: 90 }, (_, i) => ({
      status: 'active',
      provider_email: `a${i}@example.com`,
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      status: 'revoked',
      provider_email: `r${i}@example.com`,
    })),
  ];
  const result = simulateAtomicAllocation(existing, 'novo@example.com');
  assert.equal(result.ok, false, 'vagas esgotadas contando revogados');
  assert.equal(result.reason, 'sem_vagas');
});

test('concorrência: idempotência — mesmo email não recebe dois grants', () => {
  const existing = [
    { status: 'active', provider_email: 'mesmo@example.com' },
  ];
  const result = simulateAtomicAllocation(existing, 'mesmo@example.com');
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'ja_tem_grant', 'idempotência: mesmo email bloqueado');
});

test('concorrência: email revogado não recebe novo grant (regra comercial)', () => {
  // Simula prestador que cancelou e tenta voltar como Fundador
  const existing = [
    { status: 'revoked', provider_email: 'cancelou@example.com' },
  ];
  const result = simulateAtomicAllocation(existing, 'cancelou@example.com');
  assert.equal(result.ok, false, 'ex-fundador não recupera o selo ao retornar');
  assert.equal(result.reason, 'ja_tem_grant');
});

// ────────────────────────────────────────────────────────────────────────────
// FOUNDER SLOT — lógica de alocação atômica
// Espelha base44/functions/mercadoPagoWebhook/entry.ts :: allocateFounderSlot
// ────────────────────────────────────────────────────────────────────────────

const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

// Replica a lógica de filtragem de candidatos em allocateFounderSlot.
function findCandidateSlots(allSlots, nowMs = Date.now()) {
  return allSlots
    .filter((s) => {
      if (s.status === 'available') return true;
      if (s.status === 'reserved') {
        // Reserva expirada (> 10 min) — pode ser reutilizada
        const age = nowMs - new Date(s.reserved_at || 0).getTime();
        return age > RESERVATION_TIMEOUT_MS;
      }
      return false; // granted, revoked, pending_reconciliation não são candidatos
    })
    .sort((a, b) => a.position - b.position);
}

// Replica a verificação de idempotência por idempotency_key.
function checkIdempotencyKey(allSlots, key) {
  return allSlots.find((s) => s.idempotency_key === key) || null;
}

test('FounderSlot: slot disponível é encontrado corretamente', () => {
  const slots = [
    { position: 1, status: 'granted' },
    { position: 2, status: 'available' },
    { position: 3, status: 'available' },
  ];
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].position, 2, 'deve retornar o menor position disponível primeiro');
});

test('FounderSlot: sem slots não há candidatos', () => {
  const slots = [
    { position: 1, status: 'granted' },
    { position: 2, status: 'revoked' },
    { position: 3, status: 'pending_reconciliation' },
  ];
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 0, 'granted/revoked/pending_reconciliation não são candidatos');
});

test('FounderSlot: reserva ainda válida não é candidato', () => {
  const recentReservation = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 min atrás
  const slots = [{ position: 1, status: 'reserved', reserved_at: recentReservation }];
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 0, 'reserva com menos de 10 min não é candidato');
});

test('FounderSlot: reserva expirada (> 10 min) é candidato para realocação', () => {
  const expiredReservation = new Date(Date.now() - 11 * 60 * 1000).toISOString(); // 11 min atrás
  const slots = [{ position: 1, status: 'reserved', reserved_at: expiredReservation }];
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 1, 'reserva expirada volta ao pool de candidatos');
});

test('FounderSlot: idempotência — chave duplicada retorna slot existente', () => {
  const key = 'provider123:preapproval456';
  const slots = [
    { position: 1, status: 'granted', idempotency_key: key },
    { position: 2, status: 'available' },
  ];
  const existing = checkIdempotencyKey(slots, key);
  assert.ok(existing, 'deve encontrar slot existente pela idempotency_key');
  assert.equal(existing.position, 1);
});

test('FounderSlot: chave inexistente retorna null (prossegue para nova alocação)', () => {
  const slots = [{ position: 1, status: 'granted', idempotency_key: 'outro:key' }];
  const existing = checkIdempotencyKey(slots, 'provider123:preapproval456');
  assert.equal(existing, null, 'chave não encontrada — alocar novo slot');
});

test('FounderSlot: slot revogado NUNCA vira candidato (regra permanente)', () => {
  const slots = [
    { position: 1, status: 'revoked', revoked_at: new Date().toISOString() },
  ];
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 0, 'slot revogado nunca retorna ao pool');
});

test('FounderSlot: 100 slots todos granted — nenhum candidato disponível', () => {
  const slots = Array.from({ length: 100 }, (_, i) => ({
    position: i + 1,
    status: 'granted',
  }));
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 0, 'nenhuma vaga disponível após 100 concessões');
});

test('FounderSlot: 99 granted + 1 available — apenas 1 candidato, posição correta', () => {
  const slots = [
    ...Array.from({ length: 99 }, (_, i) => ({ position: i + 1, status: 'granted' })),
    { position: 100, status: 'available' },
  ];
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].position, 100);
});

test('FounderSlot: idempotency_key formato correto (providerId:preapprovalId)', () => {
  const providerId = 'abc123';
  const preapprovalId = 'PAP-xyz789';
  const key = `${providerId}:${preapprovalId}`;
  assert.ok(key.includes(':'), 'formato deve conter ":" como separador');
  const [pid, paid] = key.split(':');
  assert.equal(pid, providerId);
  assert.equal(paid, preapprovalId);
});

test('FounderSlot: dois checkouts do mesmo prestador não alocam dois slots', () => {
  // Simula: primeiro checkout já tem idempotency_key; segundo deve reusar o mesmo slot
  const providerId = 'provider-A';
  const preapprovalId = 'PAP-111';
  const key = `${providerId}:${preapprovalId}`;

  const slots = [
    { position: 1, status: 'reserved', idempotency_key: key, provider_id: providerId },
    { position: 2, status: 'available' },
  ];

  // Segundo checkout verifica idempotência primeiro
  const existing = checkIdempotencyKey(slots, key);
  assert.ok(existing, 'segundo checkout deve encontrar slot já reservado pela key');
  assert.equal(existing.position, 1, 'não aloca novo slot — reutiliza o existente');
});

test('FounderSlot: 10 webhooks para o mesmo slot não criam 10 grants', () => {
  // Simula: idempotency_key é a mesma nos 10 webhooks
  const key = 'provider-B:PAP-222';
  const slots = [{ position: 5, status: 'granted', idempotency_key: key }];

  let grantsCreated = 0;
  for (let i = 0; i < 10; i++) {
    const existing = checkIdempotencyKey(slots, key);
    if (!existing) {
      grantsCreated++; // Nunca deve cair aqui
    }
  }
  assert.equal(grantsCreated, 0, '10 webhooks idênticos não criam novos grants');
});

test('FounderSlot: slot pending_reconciliation não retorna ao pool (aguarda admin)', () => {
  const slots = [{ position: 50, status: 'pending_reconciliation' }];
  const candidates = findCandidateSlots(slots);
  assert.equal(candidates.length, 0, 'slot em reconciliação não pode ser realocado automaticamente');
});
