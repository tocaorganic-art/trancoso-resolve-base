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

---

# Checklist manual — IDOR / BOLA em entidades com dados sensíveis

Extensão do roteiro acima para outras entidades com PII ou dados financeiros.
IDOR (Insecure Direct Object Reference) e BOLA (Broken Object Level
Authorization) são o mesmo problema: o usuário autenticado troca o ID (ou
e-mail) no payload/URL e acessa ou altera o registro de outra pessoa. Validar
manualmente no ambiente Base44 (preview/staging, nunca produção com dados
reais), com pelo menos dois usuários de teste dedicados — Prestador A e
Prestador B — e nunca com CPF, antecedentes ou dados reais de terceiros.

Entidades cobertas e a RLS declarada em `base44/entities/*.jsonc`:

| Entidade | read | update | create |
|---|---|---|---|
| `ServiceProviderPrivate` (CPF, nascimento, nome da mãe) | dono (`created_by`) ou admin | dono ou admin | só grava com `created_by` do próprio usuário |
| `ServiceProvider` | dono (`created_by`) ou admin | dono ou admin | — |
| `Subscription` | dono (`data.user_email`) ou admin | admin | admin |
| `Payment` | `data.client_email` ou `data.provider_id` do próprio usuário, ou admin | — | admin |
| `ServiceRequest` | dono ou `data.client_email` do próprio usuário | — | dono ou admin |
| `Lead` | admin | admin | admin |

## Roteiro

1. **Prestador A não lê `ServiceProviderPrivate` do Prestador B por ID.**
   Logado como A, chamar `entities.ServiceProviderPrivate.get(<id do registro de B>)` → esperado: erro de permissão (RLS filtra por `created_by`, não pelo ID em si — confirmar que a plataforma realmente nega e não apenas omite campos).

2. **Prestador A não lê `ServiceProviderPrivate` de B por filtro em `service_provider_id`.**
   Logado como A, chamar `entities.ServiceProviderPrivate.filter({ service_provider_id: <id do ServiceProvider de B> })` → esperado: lista vazia ou erro, nunca o CPF/nascimento de B.

3. **Prestador A não atualiza `ServiceProviderPrivate` de B.**
   Logado como A, tentar `entities.ServiceProviderPrivate.update(<id do registro de B>, { nome_mae: "teste" })` → esperado: erro de permissão.

4. **Prestador A não forja o vínculo ao criar o próprio registro.**
   Logado como A (sem registro ainda), tentar `entities.ServiceProviderPrivate.create({ service_provider_id: <id do ServiceProvider de B>, cpf: ..., data_nascimento: ... })` → risco: a RLS de `create` só confere `created_by`, não valida se `service_provider_id` pertence a quem está criando. Esperado desejável: a function/tela que chama `create` valida que `service_provider_id` corresponde ao `ServiceProvider` do próprio usuário autenticado antes de enviar; se a tela não valida isso hoje, registrar como achado (não é RLS do Base44, é validação de aplicação ausente).

5. **Prestador A não lê o `ServiceProvider` de B com dados que deveriam ser privados.**
   Confirmar que o `ServiceProvider` público de B (lido por A, por ser uma listagem pública) nunca inclui CPF, nascimento ou nome da mãe — esses campos devem existir só em `ServiceProviderPrivate`. Checar a resposta completa do objeto, não só os campos exibidos na tela.

6. **Cliente A não lê a `Subscription` de outro usuário trocando o e-mail no filtro.**
   Logado como cliente A, tentar `entities.Subscription.filter({ "data.user_email": "<e-mail de B>" })` → esperado: lista vazia (a RLS compara contra `{{user.email}}` da sessão, não contra o valor enviado no filtro — confirmar que a plataforma ignora/nega o valor forjado).

7. **Prestador A não lê `Payment` de outro prestador trocando `provider_id`.**
   Logado como A, tentar `entities.Payment.filter({ "data.provider_id": "<id de B>" })` ou `.get(<id de um Payment de B>)` → esperado: erro de permissão ou lista vazia.

8. **Cliente A não lê `ServiceRequest` de outro cliente.**
   Logado como cliente A, tentar `entities.ServiceRequest.get(<id de uma solicitação de B>)` e `.filter({ "data.client_email": "<e-mail de B>" })` → esperado: erro de permissão ou lista vazia nos dois casos.

9. **Anônimo e não-admin não leem `Lead` em nenhuma hipótese.**
   Tentar `entities.Lead.list()`, `.get(<id>)` e `.filter(...)` sem sessão e depois autenticado como prestador comum (não-admin) → esperado: erro de permissão em todos os casos (a captura pública de lead passa por function server-side com `asServiceRole`, nunca por escrita direta do cliente — confirmar que não existe tela ou endpoint que leia `Lead` direto pelo navegador).

10. **Admin opera normalmente em todas as entidades acima.**
    Logado como `role: admin`, confirmar `list`/`get`/`filter` nas 6 entidades e `update`/`create` onde a RLS permite a admin.

11. **Functions server-side continuam funcionando (`asServiceRole` ignora RLS).**
    Confirmar que as functions que leem/gravam essas entidades no backend (ex.: webhook do Asaas para `Subscription`/`Payment`, function de captura pública de `Lead`) continuam operando normalmente autenticado e anônimo, já que usam `base44.asServiceRole`.

## Registro do resultado

Preencher e colar no PR antes do merge:

| Cenário | Resultado esperado | Resultado observado | OK? |
|---|---|---|---|
| A lê ServiceProviderPrivate de B por ID | negado | | |
| A lê ServiceProviderPrivate de B por filtro | negado | | |
| A atualiza ServiceProviderPrivate de B | negado | | |
| A cria ServiceProviderPrivate forjando service_provider_id de B | negado ou achado registrado | | |
| ServiceProvider público de B não expõe CPF/nascimento | confirmado | | |
| A lê Subscription de B trocando e-mail no filtro | negado | | |
| A lê Payment de B trocando provider_id | negado | | |
| A lê ServiceRequest de B | negado | | |
| Anônimo/não-admin lê Lead | negado | | |
| Admin opera nas 6 entidades | permitido | | |
| Functions server-side (asServiceRole) | funcionando | | |
