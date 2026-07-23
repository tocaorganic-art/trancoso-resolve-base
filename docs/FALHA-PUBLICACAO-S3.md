# Falha de Publicação — "Failed to publish app assets to S3"

## Sintoma
Erro consistente ao publicar o app Trancoso Resolve:
```
Failed to publish app assets to S3
App ID: 68eb21726a9614db4a82ba99
```

## Causa Raiz
O repositório Git tinha **27.300 arquivos de `node_modules/`** (e `dist/`) rastreados no índice do Git. O pipeline de publicação do Base44 processa todos os arquivos rastreados pelo Git antes de fazer o upload para o S3. Esse volume massivo causava timeout/falha na etapa de upload dos assets.

> **Nota:** Os arquivos existiam no disco e no índice do Git, mas estavam no `.gitignore` — o `.gitignore` previne novos rastreamentos, mas não remove arquivos já rastreados.

## Solução (Commit `44656e3d`)
Desrastrear `node_modules/` e `dist/` do índice do Git (arquivos preservados no disco):

```bash
git rm -r --cached node_modules dist
git commit -m "Untrack node_modules and dist from git index (files preserved on disk)"
```

## Verificações que Passaram (lado do app — não eram a causa)
- `npm ci` → exit 0
- `npm run build` (vite build) → exit 0, dist/ com 191 arquivos (4.7 MB)
- `npm run lint` → 0 erros
- `npm run typecheck` → 0 erros
- 37 funções backend (Deno) → 0 erros de compilação
- 34 entidades → schema JSON válido
- Nenhum arquivo vazio ou com caracteres não-ASCII no `dist/`
- Maior arquivo: 1.3 MB (`manual-da-marca.pdf`)

## Estado do `.gitignore`
O `.gitignore` já continha `node_modules/` e `dist/`. O problema era que os arquivos foram commitados **antes** da entrada no `.gitignore` (ou via sync externo), e o `git rm --cached` era necessário para limpar o índice.

## Data da Correção
23/07/2026 — Publicação confirmada com sucesso após o commit `44656e3d`.

## Lição Aprendida
Se a falha de publicação for "Failed to publish app assets to S3" e o build passar limpo, **sempre verificar**:
```bash
git ls-files | wc -l
```
Se o número for anormalmente alto (milhares), provavelmente há `node_modules/` ou `dist/` rastreados. Executar `git rm -r --cached node_modules dist` e commitar.