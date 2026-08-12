# Roteiro executivo — Sync seletivo da automação de comunicação no Base44

> App Base44: `68eb21726a9614db4a82ba99` · Data: 11/08/2026
> Referência de detalhes: `docs/automacao-comunicacao.md` (templates, env vars §4, webhooks §5).
> Auditoria e divergências: `docs/automacao-relatorio-codex.md`.

## Decisões confirmadas

- **Schema `Lead` = Opção A**: alinhar o remoto ao formato do checkout (`name/phone/email/service_interest/location/source/status/score/notes/consent/consent_at`, required `name/phone/source/consent`, RLS read/write admin).
- **Idempotência corrigida no checkout** (3 functions): dedup por `leadgen_id` (Facebook), `message.id` (WhatsApp) e `message.mid` + persistência do ID (Messenger).
- **Sync SELETIVO**: NÃO sobrescrever `metaCAPI` (já existe no remoto, órfã), `LeadPreLancamento` (alteração pré-existente do checkout), `createSubscriptionCheckout`/`mercadoPagoWebhook` (remoto mais novo).

---

## Fase 0 — Preparação e snapshot

1. **Checkpoint** no sandbox Base44 (cria ponto de restauração antes de qualquer escrita).
   - Via UI do Base44 ou CLI, se disponível.
2. **Confirmar acesso/estado**:
   ```bash
   npx base44 list            # confirmar o app e credenciais
   npx base44 entities list   # ou equivalente; confirmar entidades atuais
   ```
3. **Backup dos dados de `Lead`** (export antes da migração) — via MCP `query_entities` (limit 500, paginar com `skip`) gravando JSON em `./tmp/leads-backup-$(date).json`. Conferir campos atuais (`nome`, `whatsapp`, `servico`, `origem`, `notas`, `bairro`, `consent`).

---

## Fase 1 — Migração de dados legados do `Lead` (ANTES do schema push)

Rename dos campos no remoto via MCP `update_entities` (suporta `$rename`/`$set`), em lotes de ≤500, usando query `{}` (ajustar para `has_more`).

1. **Rename** (preserva valores; não apaga):
   ```json
   { "nome": "name", "whatsapp": "phone", "servico": "service_interest",
     "origem": "source", "notas": "notes", "bairro": "location" }
   ```
   `email` permanece `email`. `status`, `lead_status`, `consent`, `profile_type`, `locality`, `category_interest`, `message`, `utm_*` permanecem como estão (campos sem equivalente no novo schema podem ser movidos para `notes` ou descartados após validação).
2. **Registros sem `source`** (não tinham `origem`): `$set { "source": "legado" }` — aplicar apenas onde `source` ausente (`query: { "source": { "$exists": false } }`).
3. **Consentimento**: preservar `consent` existente; onde ausente `$set { "consent": false }` **sem inventar aceite** (deixar `consent_at` ausente).
4. **Verificar amostra** pós-migração: `query_entities` com 10 registros — conferir `name/phone/source/notes` preenchidos e `consent:false` onde não havia indicação.

> ⚠️ `$rename` não valida contra schema; rodar a migração **antes** do push do schema para não esbarrar em `required`.

---

## Fase 2 — Schema push (Lead + LeadConversa)

1. Push dos schemas do checkout (já no formato final):
   ```bash
   npx base44 entities push   # Lead.jsonc + LeadConversa.jsonc (e demais novos)
   ```
   Isso: cria `LeadConversa`, atualiza `Lead` para required `name/phone/source/consent` e **fecha o RLS `create` aberto** (write → admin).
2. **Verificar no remoto** (MCP `list_entity_schemas` para `Lead`/`LeadConversa`):
   - `Lead`: required correto; RLS read/write admin; `create` não mais público.
   - `LeadConversa`: existe; required `canal/direcao/conteudo/status_entrega/enviado_em`.

---

## Fase 3 — `deno check` das functions novas (ANTES de publicar)

1. Instalar/garantir Deno (`deno --version`). Se indisponível localmente, rodar o check no sandbox/CI antes do deploy.
2. Checar as 7 functions novas:
   ```bash
   deno check base44/functions/createPublicLead/entry.ts \
             base44/functions/createLead/entry.ts \
             base44/functions/enviarWhatsApp/entry.ts \
             base44/functions/processarWebhookWhatsApp/entry.ts \
             base44/functions/processarLeadFacebook/entry.ts \
             base44/functions/processarWebhookMessenger/entry.ts \
             base44/functions/calcularLeadScore/entry.ts
   ```
3. Corrigir qualquer erro antes de publicar.

---

## Fase 4 — Deploy das functions (seletivo)

```bash
npx base44 functions deploy   # publica as functions novas
```

- **Só as 7 novas.** Não publicar/sobrescrever: `metaCAPI` (já existe no remoto), nem functions que o remoto tem mais novas (`createSubscriptionCheckout`, `mercadoPagoWebhook`).

---

## Fase 5 — Variáveis de ambiente

Configurar no painel Base44/Vercel (lista completa em `automacao-comunicacao.md` §4). As críticas desta entrega:
- `FB_PAGE_ACCESS_TOKEN`, `FB_VERIFY_TOKEN`, `FB_APP_SECRET` (webhooks Meta)
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` (WhatsApp Cloud API)
- `LEAD_TEAM_PHONE` (notificação de lead quente)
- `META_CAPI_INGEST_SECRET` — **só server-side; nunca no front** (a `metaCAPI` hoje é órfã; ativação deve ser via function interna, não do cliente)

---

## Fase 6 — Webhooks no Meta Business Manager

Registrar os 3 endpoints publicados pelo Base44 (URL real do app `68eb...`, não URL local) conforme `automacao-comunicacao.md` §5:
- `processarLeadFacebook` · `processarWebhookWhatsApp` · `processarWebhookMessenger` — cada um com `FB_VERIFY_TOKEN` + HMAC `x-hub-signature-256`.

Testes após registrar:
1. GET de verificação (hub.challenge) responde 200.
2. POST com assinatura válida processa e responde 200.
3. POST com assinatura inválida responde 401/403 (não processa).

---

## Fase 7 — Testes pós-sync

1. **Smoke do formulário**: submeter `LeadCaptureForm`/`Contact` → cria `Lead` via `createPublicLead`, redireciona ao WhatsApp, sem erro no console.
2. **Idempotência**: reenviar o mesmo `leadgen_id` → `200 duplicate` sem novo Lead/WhatsApp; reenviar mesmo `message.id`/`message.mid` → não duplica conversa.
3. **Score**: lead com score ≥70 → `status=qualificado` e notificação única para `LEAD_TEAM_PHONE` (guard `[hot_lead_notified]`).
4. **RLS**: admin lê `Lead`/`LeadConversa`; usuário comum **não** lê (retorna vazio/403).
5. **Gate local**: `npm run lint` e `npm run build` (build demora e fica mudo por `logLevel:'error'` no `vite.config.js` — aguardar exit code, não interromper).

---

## Riscos e limites

- **Migração**: `$rename` é não-destrutivo; `$set source:'legado'` só onde `source` ausente. Backup na Fase 0 permite rollback.
- **`createLead` órfã**: sem caller no front; pode ser removida do deploy se não for necessária.
- **`metaCAPI`/CAPI**: permanece inativa até decisão de chamada server-side; não publicar posts sociais nem ativar campanha (aguarda autorização).
- **Retenção LGPD**: definir política de retenção e via de exclusão de dados do titular antes do go-live de campanhas.
- **Nunca** push Base44 → GitHub (sobrescreve migração de marca).

## Checklist final

- [ ] Checkpoint criado e backup de `Lead` exportado
- [ ] Migração de dados legados validada (amostra)
- [ ] Schema `Lead`/`LeadConversa` pushados e RLS verificados
- [ ] `deno check` das 7 functions passou
- [ ] Functions deployadas (seletivo)
- [ ] Env vars configuradas
- [ ] Webhooks registrados e testados (GET/POST válido/inválido)
- [ ] Smoke + idempotência + score + RLS validados
- [ ] Decisão documentada (go-live de campanha fica para depois)
