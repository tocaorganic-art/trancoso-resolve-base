# Checklist manual — RLS de FounderGrant

A RLS do Base44 roda no motor da plataforma, não é simulável em `node:test`.
Validar manualmente no ambiente Base44 (preview/staging, nunca produção com
dados reais) antes de fazer merge desta branch. Não usar contas ou dados
reais de prestadores — usar usuários de teste dedicados.

RLS aplicada (`base44/entities/FounderGrant.jsonc`):

```jsonc
"rls": {
  "read":   { "user_condition": { "role": "admin" } },
  "create": { "user_condition": { "role": "admin" } },
  "update": { "user_condition": { "role": "admin" } },
  "delete": { "user_condition": { "role": "admin" } }
}
```

## Roteiro

1. **Anônimo (sem sessão) não lista `FounderGrant`.**
   Tentar `entities.FounderGrant.list()` sem autenticação → esperado: erro de permissão, nenhum registro retornado.

2. **Anônimo não lê por ID.**
   Tentar `entities.FounderGrant.get(<id de um grant existente>)` sem autenticação → esperado: erro de permissão.

3. **Anônimo não pesquisa por e-mail.**
   Tentar `entities.FounderGrant.filter({ provider_email: "<email de teste>" })` sem autenticação → esperado: erro de permissão ou lista vazia (nunca o registro real).

4. **Prestador autenticado (não-admin) não lê grant de outro prestador.**
   Logar como prestador de teste A, tentar ler o grant do prestador de teste B por ID ou filtro → esperado: erro de permissão.

5. **Prestador autenticado (não-admin) não lê o próprio grant.**
   Logar como prestador de teste A (com grant ativo), tentar `entities.FounderGrant.filter({ provider_email: "a@teste.com" })` → esperado hoje: erro de permissão (nenhuma exceção de "dono" foi adicionada nesta branch, ver comentário em `FounderGrant.jsonc` — o produto atual não precisa disso, pois nenhuma tela lê a entity diretamente).

6. **Admin consegue operar normalmente.**
   Logar como usuário com `role: admin`, confirmar `list`, `get`, `filter`, `create`, `update`, `delete` funcionam.

7. **Functions server-side continuam funcionando (asServiceRole ignora RLS).**
   Confirmar que `getFounderStats`, `mercadoPagoWebhook` e `cancelarAssinatura` continuam lendo/escrevendo `FounderGrant` normalmente (elas usam `base44.asServiceRole`, que não é afetado pela RLS). Testar chamando `getFounderStats` autenticado e anônimo — ambos devem receber o DTO agregado normalmente.

## Registro do resultado

Preencher e colar no PR antes do merge:

| Cenário | Resultado esperado | Resultado observado | OK? |
|---|---|---|---|
| Anônimo lista | negado | | |
| Anônimo lê por ID | negado | | |
| Anônimo pesquisa por e-mail | negado | | |
| Prestador lê grant de terceiro | negado | | |
| Prestador lê o próprio grant | negado (hoje) | | |
| Admin opera | permitido | | |
| getFounderStats (anônimo) | DTO agregado, sem PII | | |
| getFounderStats (autenticado) | DTO agregado, sem PII | | |
