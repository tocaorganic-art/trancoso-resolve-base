# Testes — branch fix/founder-privacy-and-stats

Este projeto não tinha infraestrutura de testes automatizados (sem script
`test` no `package.json`, sem framework instalado). Esta branch introduz o
mínimo necessário: `node:test` (nativo do Node, nenhuma dependência nova) via
`npm test`.

## O que é testado automaticamente aqui

`founder-stats.contract.test.js` reimplementa, de forma isolada e comentada,
a mesma lógica pura de `base44/functions/getFounderStats/entry.ts`:
contagem de grants ativos, cálculo de `remaining`/`open`, e o formato exato
do DTO público (sucesso e indisponível).

Por quê reimplementar em vez de importar `entry.ts` diretamente: o arquivo
usa `import ... from 'npm:@base44/sdk@...'` (especificador exclusivo do
runtime Deno usado pelo Base44) e `Deno.serve(...)`, que não existem sob
Node. Não foi extraída uma função pura para um módulo irmão dentro de
`base44/functions/getFounderStats/` porque todas as 39 functions do projeto
hoje são um único arquivo `entry.ts` autocontido — introduzir um import
relativo ali é uma mudança de padrão de deploy não verificada neste
ambiente (incerto se `base44 functions deploy` empacota arquivos irmãos), e
o escopo desta branch é privacidade/contador, não refatorar o pipeline de
deploy de functions.

**Risco residual, documentado explicitamente**: se `entry.ts` for editado
no futuro sem atualizar este teste em paralelo, os dois podem divergir
silenciosamente. Mitigação recomendada para uma branch futura: extrair a
lógica pura para um módulo compartilhado depois de confirmar com a
Base44/documentação como `functions deploy` lida com múltiplos arquivos por
function.

## O que NÃO pode ser testado automaticamente aqui

A RLS (`base44/entities/FounderGrant.jsonc`) é aplicada pelo motor do
Base44 em runtime — não há como simular isso em `node:test` sem um
ambiente Base44 real. Ver `test/MANUAL-RLS-CHECKLIST.md` para o roteiro de
validação manual com usuários de teste (anônimo, prestador dono do grant,
outro prestador, admin).

## Rodando

```bash
npm test
```
