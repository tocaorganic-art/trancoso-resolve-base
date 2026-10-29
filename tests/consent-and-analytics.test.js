import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { parseConsent } from '../src/utils/consent.js';

test('consentimento inválido é tratado como ausente', () => {
  assert.equal(parseConsent(null), null);
  assert.equal(parseConsent('{inválido'), null);
});

test('somente valores booleanos true liberam cookies opcionais', () => {
  assert.deepEqual(parseConsent('{"analytics":"true","marketing":1}'), {
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: null,
  });
});

test('HTML inicial não carrega Google, Meta ou Clarity antes do consentimento', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /googletagmanager\.com\/gtm\.js/);
  assert.doesNotMatch(html, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.doesNotMatch(html, /facebook\.com\/tr\?/);
  assert.doesNotMatch(html, /clarity\.ms\/tag/);
});

test('Clarity só é carregado junto do GA4, sob consentimento de analytics', async () => {
  const source = await readFile(new URL('../src/utils/consent.js', import.meta.url), 'utf8');
  const start = source.indexOf('export function activateOptionalTracking');
  const functionSource = source.slice(start);

  assert.match(
    functionSource,
    /if \(consent\.analytics\) \{\s*enableGoogleTagManager\([^)]*\);\s*enableMicrosoftClarity\([^)]*\);\s*\}/,
  );
});

test('solicitação de serviço não é registrada como compra', async () => {
  const analytics = await readFile(new URL('../src/utils/analytics.js', import.meta.url), 'utf8');
  const start = analytics.indexOf('export function trackSolicitacaoServico');
  const end = analytics.indexOf('export function trackContatoWhatsApp');
  const functionSource = analytics.slice(start, end);

  assert.match(functionSource, /service_request_submitted/);
  assert.match(functionSource, /SubmitApplication/);
  assert.doesNotMatch(functionSource, /['"]purchase['"]/i);
});

test('frontend não grava leads diretamente na entidade pública', async () => {
  const files = [
    '../src/pages/Contact.jsx',
    '../src/components/servicos/LeadCaptureForm.jsx',
    '../src/components/leads/LeadPrestadorForm.jsx',
  ];

  for (const path of files) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /LeadPreLancamento\.create/);
    assert.match(source, /createPublicLead/);
  }
});

test('RLS de leads não mantém escrita pública irrestrita', async () => {
  const entity = await readFile(
    new URL('../base44/entities/LeadPreLancamento.jsonc', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(entity, /"write"\s*:\s*true/);
  assert.match(entity, /"write"\s*:\s*\{\s*"user_condition"\s*:\s*\{\s*"role"\s*:\s*"admin"/s);
});
