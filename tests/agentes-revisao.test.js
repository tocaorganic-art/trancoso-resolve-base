import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { transformSync } from 'esbuild';

function carregar(fn, inicio, fim, nomes) {
  const src = readFileSync(`base44/functions/${fn}/entry.ts`, 'utf8');
  const bloco = src.slice(src.indexOf(inicio), src.indexOf(fim)).replaceAll('export function', 'function');
  const { code } = transformSync(bloco, { loader: 'ts' });
  return new Function(`${code}; return { ${nomes.join(', ')} };`)();
}

const rev = carregar('revisaoDiariaPrestadores', '// INICIO_REGRAS_REVISAO', '// FIM_REGRAS_REVISAO',
  ['deveAvisarTrial', 'verificacaoAtrasada', 'analiseManualAtrasada', 'textoAvisoTrial']);
const mod = carregar('moderarAvaliacao', '// INICIO_REGRAS_MODERACAO', '// FIM_REGRAS_MODERACAO', ['motivosModeracao']);
const ale = carregar('notificarAdminVerificacao', '// INICIO_REGRAS_ALERTA', '// FIM_REGRAS_ALERTA',
  ['precisaAlertarEquipe', 'semDadoSensivel']);

const agora = '2026-11-11T15:00:00Z'; // 12h na Bahia

test('trial avisa só em D-7 e D-1, e só com status trial', () => {
  assert.equal(rev.deveAvisarTrial({ status: 'trial', trial_end: '2026-11-18T20:00:00Z' }, agora), 7);
  assert.equal(rev.deveAvisarTrial({ status: 'trial', trial_end: '2026-11-12T10:00:00Z' }, agora), 1);
  assert.equal(rev.deveAvisarTrial({ status: 'trial', trial_end: '2026-11-15T10:00:00Z' }, agora), null);
  assert.equal(rev.deveAvisarTrial({ status: 'active', trial_end: '2026-11-18T20:00:00Z' }, agora), null);
});

test('texto do aviso segue a oferta oficial', () => {
  const { subject, body } = rev.textoAvisoTrial(7);
  assert.match(subject + body, /2 meses grátis/);
  assert.match(body, /sem cartão/);
  assert.doesNotMatch(subject + body, /30 dias/);
  assert.doesNotMatch(subject + body, /—/);
  assert.doesNotMatch(body, /wa\.me|whatsapp/i);
});

test('SLA de 48 horas para verificação aberta e análise manual', () => {
  assert.equal(rev.verificacaoAtrasada({ status: 'pending_review', updated_date: '2026-11-09T10:00:00Z' }, agora), true);
  assert.equal(rev.verificacaoAtrasada({ status: 'pending_review', updated_date: '2026-11-10T10:00:00Z' }, agora), false);
  assert.equal(rev.verificacaoAtrasada({ status: 'approved', updated_date: '2026-11-01T10:00:00Z' }, agora), false);
  assert.equal(rev.analiseManualAtrasada({ status_verificacao: 'em_analise_manual', data_verificacao: '2026-11-08T10:00:00Z' }, agora), true);
  assert.equal(rev.analiseManualAtrasada({ status_verificacao: 'aprovado', data_verificacao: '2026-11-08T10:00:00Z' }, agora), false);
});

test('moderação retém contato, dado pessoal e ofensa, e deixa elogio passar', () => {
  assert.deepEqual(mod.motivosModeracao('Ótimo serviço, muito pontual!'), []);
  assert.ok(mod.motivosModeracao('me chama no (73) 99999-1234').includes('telefone'));
  assert.ok(mod.motivosModeracao('fala comigo em joao@gmail.com').includes('e-mail'));
  assert.ok(mod.motivosModeracao('chama no wa.me/5573999').includes('link externo'));
  assert.ok(mod.motivosModeracao('serviço lixo').includes('linguagem ofensiva'));
  assert.deepEqual(mod.motivosModeracao(null), []);
});

test('alerta da equipe só em análise manual ou reprovação, e mascara CPF', () => {
  assert.equal(ale.precisaAlertarEquipe({ status_verificacao: 'em_analise_manual' }), true);
  assert.equal(ale.precisaAlertarEquipe({ status_verificacao: 'reprovado' }), true);
  assert.equal(ale.precisaAlertarEquipe({ status_verificacao: 'aprovado' }), false);
  assert.doesNotMatch(ale.semDadoSensivel('CPF 123.456.789-09 divergente'), /123\.456/);
});

test('workflows novos apontam para funções que existem', () => {
  const novos = ['Revisão Diária - Trial e Verificações', 'Moderação Automática de Avaliações', 'Alerta Equipe - Verificação Precisa de Revisão'];
  const funcoes = new Set(readdirSync('base44/functions'));
  for (const nome of novos) {
    const wf = JSON.parse(readFileSync(`base44/workflows/${nome}.jsonc`, 'utf8'));
    const fn = wf.definition.do[0].run_function.with.function_name;
    assert.ok(funcoes.has(fn), `${nome} -> ${fn}`);
  }
});

test('nenhuma função nova envia e-mail com CPF completo nem tem segredo fixo', () => {
  for (const fn of ['revisaoDiariaPrestadores', 'moderarAvaliacao', 'notificarAdminVerificacao']) {
    const src = readFileSync(`base44/functions/${fn}/entry.ts`, 'utf8');
    assert.match(src, /Deno\.env\.get\('AUTOMATION_WEBHOOK_SECRET'\)/);
    assert.doesNotMatch(src, /\.cpf\b/);
  }
});
