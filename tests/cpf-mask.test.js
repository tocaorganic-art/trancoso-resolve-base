import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CPF_MASCARADO_VAZIO,
  containsCpf,
  maskCpf,
  maskCpfInText,
  onlyDigits,
} from '../src/lib/cpf-mask.js';

test('mascara CPF com e sem pontuação mantendo o miolo visível', () => {
  assert.equal(maskCpf('123.456.789-01'), '***.456.789-**');
  assert.equal(maskCpf('12345678901'), '***.456.789-**');
  assert.equal(maskCpf(' 123 456 789 01 '), '***.456.789-**');
});

test('devolve máscara vazia quando o valor não tem 11 dígitos', () => {
  assert.equal(maskCpf(''), CPF_MASCARADO_VAZIO);
  assert.equal(maskCpf(null), CPF_MASCARADO_VAZIO);
  assert.equal(maskCpf('1234'), CPF_MASCARADO_VAZIO);
  assert.equal(maskCpf('123456789012'), CPF_MASCARADO_VAZIO);
});

test('onlyDigits ignora pontuação e valores não textuais', () => {
  assert.equal(onlyDigits('123.456.789-01'), '12345678901');
  assert.equal(onlyDigits(undefined), '');
  assert.equal(onlyDigits(12345678901), '');
});

test('mascara CPF dentro de texto livre sem tocar no resto', () => {
  const entrada = 'CPF do titular: 123.456.789-01, nascido em 10/05/1990. Protocolo 2024.';
  const saida = maskCpfInText(entrada);
  assert.equal(saida, 'CPF do titular: ***.456.789-**, nascido em 10/05/1990. Protocolo 2024.');
  assert.equal(saida.includes('123.456.789-01'), false);
});

test('mascara mais de um CPF no mesmo texto', () => {
  const saida = maskCpfInText('titular 111.222.333-44 e conjuge 555.666.777-88');
  assert.equal(saida, 'titular ***.222.333-** e conjuge ***.666.777-**');
});

test('não altera datas nem números curtos', () => {
  assert.equal(maskCpfInText('data 10/05/1990 e pedido 12345'), 'data 10/05/1990 e pedido 12345');
  assert.equal(maskCpfInText(''), '');
  assert.equal(maskCpfInText(null), '');
});

test('containsCpf identifica presença de CPF em texto', () => {
  assert.equal(containsCpf('doc 123.456.789-01 anexo'), true);
  assert.equal(containsCpf('doc 12345678901 anexo'), true);
  assert.equal(containsCpf('data 10/05/1990'), false);
  assert.equal(containsCpf(''), false);
  assert.equal(containsCpf(undefined), false);
});

test('mascarar duas vezes não corrompe o resultado', () => {
  const uma = maskCpfInText('cpf 123.456.789-01');
  assert.equal(maskCpfInText(uma), uma);
});
