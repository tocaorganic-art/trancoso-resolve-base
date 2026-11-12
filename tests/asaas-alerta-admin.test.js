import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

const src = readFileSync('base44/functions/asaasWebhook/entry.ts', 'utf8');
const inicio = src.indexOf('const STATUS_ALERTA_ADMIN');
const fim = src.indexOf('async function alertarAdmin');
const { code } = transformSync(src.slice(inicio, fim).replace('export function', 'function'), { loader: 'ts' });
const precisaAlertaAdmin = new Function(`${code}; return precisaAlertaAdmin;`)();

test('chargeback e exclusões disparam alerta ao admin', () => {
  assert.equal(precisaAlertaAdmin('PAYMENT_CHARGEBACK_REQUESTED'), true);
  assert.equal(precisaAlertaAdmin('PAYMENT_DELETED'), true);
  assert.equal(precisaAlertaAdmin('SUBSCRIPTION_DELETED'), true);
  assert.equal(precisaAlertaAdmin('PAYMENT_UPDATED', 'CHARGEBACK_DISPUTE'), true);
});

test('pagamento normal não dispara alerta', () => {
  assert.equal(precisaAlertaAdmin('PAYMENT_RECEIVED', 'RECEIVED'), false);
  assert.equal(precisaAlertaAdmin('PAYMENT_OVERDUE', 'OVERDUE'), false);
});

test('alerta não altera status: nenhum mapa de status ganhou chargeback', () => {
  assert.doesNotMatch(src, /CHARGEBACK[A-Z_]*:\s*'/);
});

test('alerta vai para o e-mail de suporte, sem dado pessoal do pagador', () => {
  const bloco = src.slice(src.indexOf('async function alertarAdmin'), src.indexOf('// ─── Handler principal'));
  assert.match(bloco, /suporte@trancosoresolve\.com\.br/);
  assert.doesNotMatch(bloco, /customer|cpfCnpj|user_email|client_email/i);
});
