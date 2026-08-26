import test from 'node:test';
import assert from 'node:assert/strict';
import { getAutomationReply } from '../base44/functions/_shared/automationResponses.js';

test('usa a mesma resposta de cadastro em texto com e sem acento', () => {
  const accented = getAutomationReply('Quero fazer meu cadastro como prestador');
  const plain = getAutomationReply('quero fazer meu cadastro como prestador');
  assert.equal(accented.intent, 'prestador');
  assert.equal(accented.text, plain.text);
  assert.match(accented.text, /SejaPrestador/);
});

test('orienta cliente sem pedir migração para WhatsApp', () => {
  const reply = getAutomationReply('quero contratar um serviço');
  assert.equal(reply.intent, 'cliente');
  assert.match(reply.text, /trancosoresolve\.com\.br/);
  assert.doesNotMatch(reply.text.toLowerCase(), /whatsapp/);
});

test('mantém preços e condições na página oficial de planos', () => {
  const reply = getAutomationReply('qual o preço do plano?');
  assert.equal(reply.intent, 'planos');
  assert.match(reply.text, /\/Planos/);
});
