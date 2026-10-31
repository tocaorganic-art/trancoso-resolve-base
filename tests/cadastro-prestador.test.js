import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { isValidCpf, isValidBirthDate, validatePrestadorForm } from '../src/utils/cadastroPrestador.js';

// CPFs gerados apenas para teste (dígitos verificadores válidos, sem titular conhecido).
const CPF_VALIDO = '529.982.247-25';
const HOJE = new Date('2026-10-30T12:00:00Z');

const formValido = {
  tipoPessoa: 'pf',
  cpf: CPF_VALIDO,
  nomeCompleto: 'Fulano de Tal',
  dataNascimento: '1990-05-20',
  cnpj: '',
  autorizouVerificacao: true,
};

test('CPF: aceita dígitos verificadores corretos, com ou sem máscara', () => {
  assert.equal(isValidCpf(CPF_VALIDO), true);
  assert.equal(isValidCpf('52998224725'), true);
});

test('CPF: rejeita dígito errado, tamanho errado e sequência repetida', () => {
  assert.equal(isValidCpf('529.982.247-24'), false);
  assert.equal(isValidCpf('1234567890'), false);
  assert.equal(isValidCpf('111.111.111-11'), false);
  assert.equal(isValidCpf(''), false);
});

test('Data de nascimento: rejeita data inexistente, futura ou fora do formato', () => {
  assert.equal(isValidBirthDate('1990-05-20', HOJE), true);
  assert.equal(isValidBirthDate('1990-02-30', HOJE), false);
  assert.equal(isValidBirthDate('2027-01-01', HOJE), false);
  assert.equal(isValidBirthDate('20/05/1990', HOJE), false);
});

test('Formulário válido não retorna erro', () => {
  assert.equal(validatePrestadorForm(formValido, HOJE), null);
});

test('Formulário exige CPF, nome, nascimento, CNPJ (MEI/PJ) e autorização LGPD', () => {
  assert.match(validatePrestadorForm({ ...formValido, cpf: '123' }, HOJE), /CPF/);
  assert.match(validatePrestadorForm({ ...formValido, nomeCompleto: 'Ana' }, HOJE), /nome completo/);
  assert.match(validatePrestadorForm({ ...formValido, dataNascimento: '' }, HOJE), /data de nascimento/);
  assert.match(validatePrestadorForm({ ...formValido, tipoPessoa: 'mei', cnpj: '12' }, HOJE), /CNPJ/);
  assert.match(validatePrestadorForm({ ...formValido, autorizouVerificacao: false }, HOJE), /Autorize/);
});

test('CadastroTipo: card "Sou Prestador" abre o formulário em vez de gravar o tipo de conta', async () => {
  const source = await readFile(new URL('../src/pages/CadastroTipo.jsx', import.meta.url), 'utf8');
  const start = source.indexOf('const handlePrestadorClick');
  const end = source.indexOf('const handlePrestadorSubmit');
  const clickHandler = source.slice(start, end);

  assert.match(clickHandler, /setStep\('tipo_pessoa'\)/);
  assert.doesNotMatch(clickHandler, /mutate\(/);
});

test('CadastroTipo: sem alert() nativo e sem timeout que força /Dashboard', async () => {
  const source = await readFile(new URL('../src/pages/CadastroTipo.jsx', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /\balert\(/);
  assert.doesNotMatch(source, /setTimeout\([\s\S]{0,120}\/Dashboard/);
});
