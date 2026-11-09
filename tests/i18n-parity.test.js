import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import translations, { LANGUAGES } from '../src/i18n/translations.js';

const flatten = (obj, prefix = '') => {
  const out = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...flatten(value, path));
    } else {
      out.push(path);
    }
  }
  return out;
};

const codes = LANGUAGES.map(l => l.code);

test('todos os idiomas expõem exatamente o mesmo conjunto de chaves', () => {
  const base = flatten(translations.pt).sort();
  for (const code of codes) {
    assert.ok(translations[code], `idioma ausente: ${code}`);
    const keys = flatten(translations[code]).sort();
    const faltando = base.filter(k => !keys.includes(k));
    const sobrando = keys.filter(k => !base.includes(k));
    assert.deepEqual(faltando, [], `chaves faltando em ${code}`);
    assert.deepEqual(sobrando, [], `chaves sobrando em ${code}`);
  }
});

test('nenhum valor de tradução está vazio', () => {
  for (const code of codes) {
    for (const key of flatten(translations[code])) {
      const value = key.split('.').reduce((acc, part) => acc?.[part], translations[code]);
      if (Array.isArray(value)) {
        assert.ok(value.length > 0 && value.every(v => typeof v === 'string' && v.trim()), `${code}.${key}`);
      } else {
        assert.equal(typeof value, 'string', `${code}.${key} não é string`);
        assert.ok(value.trim().length > 0, `${code}.${key} está vazio`);
      }
    }
  }
});

const walk = (dir, files = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?)$/.test(entry)) files.push(full);
  }
  return files;
};

const resolve = (dict, key) =>
  key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);

test('toda chave usada no código existe nos quatro idiomas', () => {
  const arquivos = walk('src').filter(f => !f.includes('i18n/translations'));
  const usadas = new Set();
  for (const arquivo of arquivos) {
    const conteudo = readFileSync(arquivo, 'utf8');
    for (const m of conteudo.matchAll(/\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]\s*\)/g)) {
      usadas.add(m[1]);
    }
  }
  // chaves montadas dinamicamente (ex.: banner.${slide}Cta)
  for (const slide of [1, 2, 3]) {
    for (const campo of ['Title', 'Sub', 'Cta', 'Alt']) usadas.add(`banner.slide${slide}${campo}`);
  }
  // templates com interpolação (ex.: hero.categories.${key}) não são verificáveis aqui
  for (const chave of usadas) {
    for (const code of codes) {
      assert.notEqual(resolve(translations[code], chave), undefined, `chave ausente: ${code}.${chave}`);
    }
  }
});
