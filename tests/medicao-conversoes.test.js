import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  buildConversionParams,
  conversionKey,
  getConversionValue,
  isPagamentoConfirmado,
  pickSubscription,
} from '../src/utils/assinaturaConversao.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const AGORA = new Date('2026-10-30T15:00:00Z');

const ativa = {
  id: 'sub_local_1',
  plan: 'profissional',
  billing: 'monthly',
  status: 'active',
  subscription_start: '2026-10-30',
  asaas_subscription_id: 'sub_asaas_1',
  updated_date: '2026-10-30T14:58:00Z',
};

test('Google Ads: valor real do plano (Profissional 59,90; Boost 9,90; anual)', () => {
  assert.equal(getConversionValue(ativa), 59.9);
  assert.equal(getConversionValue({ ...ativa, plan: 'boost_prestador' }), 9.9);
  assert.equal(getConversionValue({ ...ativa, billing: 'annual' }), 599);
  assert.equal(getConversionValue({ ...ativa, plan: 'desconhecido' }), null);
});

test('Google Ads: só conta pagamento confirmado pelo backend e recente', () => {
  assert.equal(isPagamentoConfirmado(ativa, AGORA), true);
  assert.equal(isPagamentoConfirmado({ ...ativa, status: 'trial' }, AGORA), false);
  assert.equal(isPagamentoConfirmado({ ...ativa, status: 'expired' }, AGORA), false);
  assert.equal(isPagamentoConfirmado({ ...ativa, subscription_start: undefined }, AGORA), false);
  assert.equal(isPagamentoConfirmado({ ...ativa, subscription_start: '2026-09-01' }, AGORA), false);
  assert.equal(isPagamentoConfirmado(null, AGORA), false);
  // Registro não atualizado pelo webhook nos últimos 15 min (ex.: renovação antiga)
  assert.equal(isPagamentoConfirmado({ ...ativa, updated_date: '2026-10-29T10:00:00Z' }, AGORA), false);
  assert.equal(isPagamentoConfirmado({ ...ativa, updated_date: undefined }, AGORA), false);
});

test('Google Ads: parâmetros da conversão levam valor, moeda e transaction_id', () => {
  assert.deepEqual(buildConversionParams(ativa, AGORA), {
    send_to: 'AW-18431007500/bYDPCPzcwPEcEIy2y9RE',
    value: 59.9,
    currency: 'BRL',
    transaction_id: 'sub_local_1:2026-10-30',
  });
  assert.equal(buildConversionParams({ ...ativa, status: 'trial' }, AGORA), null);
  assert.equal(conversionKey(ativa), 'gads-assinatura-sent:sub_local_1:2026-10-30');
});

test('Google Ads: escolhe a assinatura do checkout atual ou a mais recente', () => {
  const antiga = { id: 'a', asaas_subscription_id: 'x', updated_date: '2026-01-01T00:00:00Z' };
  const nova = { id: 'b', asaas_subscription_id: 'y', updated_date: '2026-10-30T00:00:00Z' };
  assert.equal(pickSubscription([antiga, nova], 'x').id, 'a');
  assert.equal(pickSubscription([antiga, nova], null).id, 'b');
  assert.equal(pickSubscription([], null), null);
});

test('AssinaturaConfirmada: sem valor fixo 1,0 e sem marcar envio antes de enviar', async () => {
  const source = await read('../src/pages/AssinaturaConfirmada.jsx');

  assert.doesNotMatch(source, /value:\s*1\.0/);
  assert.doesNotMatch(source, /sessionStorage\.setItem\('gads-assinatura-conversion-sent'/);
  assert.match(source, /if \(trackAnalyticsEvent\('conversion', pendente\.params\)\) \{\s*storageSet\(pendente\.key, '1'\);/);
  assert.match(source, /Subscription\.filter/);
});

test('SolicitacaoConfirmada: marca de envio só depois do envio de fato', async () => {
  const source = await read('../src/pages/SolicitacaoConfirmada.jsx');

  assert.match(source, /if \(trackAnalyticsEvent\('conversion'[^)]*\)\) \{\s*sessionStorage\.setItem\(KEY, '1'\);/);
});

test('CadastroTipo: cadastro de prestador só é rastreado depois de CPF e LGPD salvos', async () => {
  const source = await read('../src/pages/CadastroTipo.jsx');
  const salvaPrivado = source.indexOf('ServiceProviderPrivate.create');
  const marcaSalvo = source.indexOf('dadosSensiveisSalvos = Boolean(');
  const rastreiaPrestador = source.indexOf("trackFirstRegistration(userAntesDoCadastro, 'prestador'");

  assert.ok(salvaPrivado > 0 && marcaSalvo > salvaPrivado, 'flag de dados salvos vem depois do upsert privado');
  assert.ok(rastreiaPrestador > marcaSalvo, 'evento do prestador vem depois do upsert privado');
  assert.match(source, /if \(dadosSensiveisSalvos\) \{/);
  assert.match(source, /autorizouVerificacao\);/);

  const onSuccess = source.slice(source.indexOf('onSuccess: async'), source.indexOf('onError:'));
  const antesDoReturnPrestador = onSuccess.slice(0, onSuccess.indexOf('return;'));
  assert.doesNotMatch(antesDoReturnPrestador, /trackFirstRegistration\(/);
});
