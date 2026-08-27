# Relatório de implementação — automação de comunicação e leads

Data: 11/08/2026
Projeto: Trancoso Resolve
Checkout: `codex/lancamento-trancoso-resolve`

## Arquivos criados

- `base44/entities/Lead.jsonc`
- `base44/entities/LeadConversa.jsonc`
- `base44/functions/createLead/entry.ts`
- `base44/functions/enviarWhatsApp/entry.ts`
- `base44/functions/processarWebhookWhatsApp/entry.ts`
- `base44/functions/processarLeadFacebook/entry.ts`
- `base44/functions/processarWebhookMessenger/entry.ts`
- `base44/functions/calcularLeadScore/entry.ts`
- `src/lib/whatsapp-templates.ts`
- `src/lib/facebook-pixel.ts`
- `docs/automacao-comunicacao.md`
- `docs/social-launch-posts.md`

## Integrações locais realizadas

- `LeadCaptureForm` ganhou email opcional, serviço, localidade, campo source oculto, consentimento LGPD explícito, fallback para o WhatsApp oficial e mensagem de sucesso solicitada.
- O formulário chama `createPublicLead` (que grava em `Lead`) e o rastreamento centralizado chama `trackLead` do Meta Pixel após consentimento.
- Cadastro de cliente/prestador usa `trackRegistration`; confirmação de assinatura usa `trackPurchase` sem inventar valor.
- Page views usam `trackPageView`; a inicialização do Pixel foi ligada ao fluxo de consentimento existente.
- O Pixel mantém o ID oficial como fallback seguro e aceita `VITE_FB_PIXEL_ID` configurável.
- O webhook Facebook foi revisado para tratar o formato real de Lead Ads (`leadgen_id`), buscar `field_data` pela Graph API e só persistir após consentimento explícito.

## Variáveis necessárias

Frontend: `VITE_FB_PIXEL_ID`, `VITE_BASE44_APP_ID`, `VITE_BASE44_BACKEND_URL`.
Base44: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `FB_PIXEL_ID`, `FB_PAGE_ACCESS_TOKEN`, `FB_VERIFY_TOKEN`, `FB_APP_SECRET`, `LEAD_TEAM_PHONE`.

Nenhum valor de token, chave ou secret foi lido, exibido ou gravado.

## Ações manuais externas

1. Sincronizar os arquivos no sandbox remoto Base44 oficial quando os créditos estiverem disponíveis.
2. Confirmar RLS e a existência real das entidades `Lead` e `LeadConversa` no sandbox.
3. Configurar variáveis de ambiente no Base44/Vercel sem colocá-las no repositório.
4. Registrar e testar os três webhooks no Meta Business Manager, com HMAC e verify token.
5. Aprovar/criar os templates que ainda não existem; manter `trc_bem_vindo_lead` como nome oficial de boas-vindas.
6. Configurar o formulário Lead Ads com consentimento LGPD explícito.
7. Revisar o texto social com Tony e publicar somente após autorização. O agente não ativou campanha.

## Próximos passos após o Base44 voltar ao ar

- Fazer checkpoint antes da sincronização.
- Rodar build e typecheck Deno no sandbox.
- Testar GET de verificação, POST assinado e POST com assinatura inválida.
- Testar deduplicação de leads, score, notificação de lead quente e status de entrega.
- Fazer smoke autenticado do formulário, cadastro, assinatura e consentimento de cookies.
- Confirmar produção, domínio e logs reais; build local ou preview isolado não comprovam go-live.

## Limitações e status

Não houve deploy, publish, chamada real à Meta, alteração de secrets, ativação de campanha ou migração de produção. O backend está preparado em código e documentação, mas a prontidão operacional depende do sandbox Base44, das aprovações da Meta e dos testes reais descritos acima.

## Auditoria de revisão (11/08) — evidência objetiva

Sessão de revisão/validação da entrega de automação de comunicação. Acesso MCP read-only ao sandbox Base44 oficial (`68eb21726a9614db4a82ba99`) **está disponível** — as afirmações deste arquivo foram verificadas contra o remoto, não apenas contra o código local.

### Estado do Base44 remoto vs. checkout

| Item | Remoto | Checkout | Impacto |
|---|---|---|---|
| Entidade `Lead` | **Existe**, schema: `nome, whatsapp, email, bairro, servico, origem, status, notas, profile_type, locality, category_interest, message, utm_*, consent, lead_status`; required `nome`; RLS create aberto, read/update/delete admin | schema: `name, phone, email, service_interest, location, source, status, score, notes, consent, consent_at`; required `name, phone, source, consent`; RLS read/write admin | **Divergência bloqueante.** `createPublicLead`/`createLead` gravam `name/phone/source/...` — com o schema remoto atual o `required: ["nome"]` não é atendido e os campos novos não existem. Sync precisa reconciliar schema (migrar dados legados p/ os novos campos OU adaptar as functions) antes de sobrescrever |
| Entidade `LeadConversa` | **Não existe** | criada no checkout | Precisa ser criada no sync |
| Entidade `LeadPreLancamento` | Existe | modificada no checkout (adicionado `consent_at`; RLS write `true` → `admin`) | Alteração pré-existente do checkout; não sobrescrever sem revisão |
| Functions novas (createPublicLead, createLead, enviarWhatsApp, processarWebhookWhatsApp, processarLeadFacebook, processarWebhookMessenger, calcularLeadScore) | **Nenhuma existe** | criadas no checkout | Criação programática no sync |
| `metaCAPI` | **Existe** (órfã, sem invocação) | órfã no checkout | Consistente; ativação é passo manual |

### Achados de revisão (corrigir antes/ao sincronizar)

1. **Idempotência ausente nos webhooks (Alta).** `processarLeadFacebook` cria `Lead` + `LeadConversa` + envia `enviarWhatsApp` **sem dedup por `leadgen_id`** — retry/delivery at-least-once da Meta gera leads e mensagens duplicados. `processarWebhookWhatsApp` e `processarWebhookMessenger` idem para `message_id`/`message.mid` nas conversas (a dedup só existe no update de status, não no create). Correção curta: checar existência de `notes:leadgen_id:` / `message_id` antes de criar.
2. **`metaCAPI` órfã e contrato de segredo (Média).** Nenhum caller no front nem nas functions. Se for ativada via front, o `META_CAPI_INGEST_SECRET` vazaria para o navegador. Ativação correta: chamar `metaCAPI` de uma function server-side (via `asServiceRole.functions.invoke`), nunca do cliente; `em`/`ph` devem chegar já hasheados SHA-256 (o código não hasheia).
3. **`enviarWhatsApp`/`calcularLeadScore` protegidos no rascunho atual.** A versão preparada exige administrador autenticado ou chamada interna com `AUTOMATION_WEBHOOK_SECRET`; o segredo deve existir no ambiente Base44 e nunca ser registrado em logs ou enviado pelo frontend.
4. **`createLead` órfã (Baixa).** Nenhum caller no src; só `createPublicLead` é usada pelos formulários. Remover ou documentar uso interno.
5. **LGPD — exclusão e retenção (Baixa/Média).** Sem endpoint para o titular excluir os próprios dados de `Lead`/`LeadConversa` (RLS admin-only) e sem política de retenção/TTL. Recomendar prazo de retenção documentado + via de exclusão (email/endpoint) para cumprir direito de exclusão.
6. **`trackPurchase` (pixel) sem `value` (Baixa).** Envia `currency: 'BRL'` sem valor monetário; a Meta marca o evento incompleto. Incluir `value` quando disponível no fluxo de assinatura.
7. **`PageViewTracker.jsx` usa literal `GA_MEASUREMENT_ID` (Baixa).** Placeholder nunca substituído; inofensivo (GA real carrega via GTM-5CQLT5JM), mas limpar para evitar ruído no console.

### Veredito da validação

- **Lint:** 0 erros / 0 warnings nos `.js/.jsx` da entrega. Arquivos `.ts` e `base44/` estão **fora da config do eslint do repo** (ignorados) — sintaxe Deno deve ser validada no sandbox (`deno check`) durante o sync.
- **Secrets:** grep em toda a entrega não encontrou token/secret commitado; usos são `Deno.env.get` (correto). `client_secret` do Stripe em `criarPagamentoServico` é o campo retornado pela API (esperado, não é vazamento).
- **Consentimento:** form público (LeadCaptureForm/Contact) exige consentimento obrigatório com link à Política de Privacidade + honeypot `sr-only` + sem escrita direta de entidades (via `createPublicLead`). Pixel/GTM só ativam com consentimento (localStorage) + guard duplo. Nenhum PII é enviado ao pixel (apenas serviço/localidade/origem).
- **Não está pronto para go-live sem o sync e os testes reais do sandbox** (item "Limitações e status"). A camada de código revisada é segura o bastante para ir ao sandbox; os achados de idempotência e o bloqueio de schema `Lead` devem ser resolvidos durante a sincronização.

### Decisão de sync (11/08) — schema `Lead` = Opção A + correções de idempotência

**Decisão:** alinhar o schema remoto ao formato do checkout (Opção A). O checkout já usa `name/phone/email/service_interest/location/source/status/score/notes/consent/consent_at` com RLS read/write admin; o remoto está no formato antigo (`nome/whatsapp/email/bairro/servico/origem/status/notas/...`, required `nome`, RLS `create` aberto).

**Correções de idempotência já aplicadas no checkout** (11/08):
1. `processarLeadFacebook/entry.ts` — dedup por `leadgen_id` (busca `notes` contendo `leadgen_id:<id>` entre os últimos leads do mesmo phone+facebook) antes de criar.
2. `processarWebhookWhatsApp/entry.ts` — dedup por `message.id` em `LeadConversa` (pula reentrega).
3. `processarWebhookMessenger/entry.ts` — dedup por `message.mid` e grava `message_id` na conversa de entrada (antes não gravava, inviabilizando dedup futuro).

**Plano de migração remota (quando o sync for autorizado):**
1. Atualizar o schema `Lead` para o formato do checkout (campos novos + `required` `name/phone/source/consent` + RLS read/write admin — fechar o `create` aberto).
2. Migrar registros legados: `nome→name`, `whatsapp→phone`, `servico→service_interest`, `origem→source`, `bairro→location`, `notas→notes`, `email→email`. Registros sem `source`/`consent` entram como `source:'legado'` e `consent:false` (sem inventar aceite; `consent_at` ausente).
3. Criar a entidade `LeadConversa` (checkout).
4. Criar as 7 functions novas.
5. Não sobrescrever `metaCAPI`/`LeadPreLancamento` sem revisão.
6. Rodar `deno check` das functions no sandbox antes de publicar.
7. Manter `trc_bem_vindo_lead` como template oficial de boas-vindas; registrar/testar os 3 webhooks no Meta Business Manager com HMAC e verify token (passos já listados acima).

> **Ordem exata de operações + comandos:** ver `docs/sync-base44-roteiro-executivo.md` (Fases 0–7 + checklist).
