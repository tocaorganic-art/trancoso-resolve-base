import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPublicLeadPayload,
  isValidBrazilianPhone,
  normalizeLeadName,
  normalizePhone,
} from '../src/utils/leadValidation.js';

test('normaliza nome e telefone sem transportar formatação', () => {
  assert.equal(normalizeLeadName('  Maria   da Silva  '), 'Maria da Silva');
  assert.equal(normalizePhone('(73) 9 9828-3579'), '73998283579');
});

test('aceita telefones brasileiros com 10 ou 11 dígitos', () => {
  assert.equal(isValidBrazilianPhone('(73) 99828-3579'), true);
  assert.equal(isValidBrazilianPhone('(73) 3288-1234'), true);
  assert.equal(isValidBrazilianPhone('1234'), false);
});

test('monta payload público com allowlist e consentimento explícito', () => {
  const payload = buildPublicLeadPayload({
    name: '  Ana  ',
    phone: '(73) 99828-3579',
    email: ' ANA@EXAMPLE.COM ',
    message: ' Preciso de diarista ',
    serviceInterest: 'Limpeza',
    source: 'pagina-servico',
    type: 'cliente',
    consent: true,
    website: '',
    ignored: 'não deve entrar',
  });

  assert.deepEqual(payload, {
    name: 'Ana',
    phone: '73998283579',
    email: 'ana@example.com',
    message: 'Preciso de diarista',
    service_interest: 'Limpeza',
    source: 'pagina-servico',
    type: 'cliente',
    consent: true,
    website: '',
  });
});
