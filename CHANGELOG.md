# Changelog

Todas as mudanças notáveis neste projeto estão documentadas neste arquivo.

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)

---

## [Unreleased]

### Adicionado
- `README.md` — reescrito em PT-BR com quick start, deploy detalhado, modelo híbrido e links para docs
- `base44/entities/LogWhatsApp.jsonc` — entidade de auditoria para mensagens WhatsApp (campos: prestador_id, tipo, telefone, mensagem, status, message_id, erro, timestamp, referencia_id, referencia_tipo; RLS admin-only)
- `base44/functions/enviarMensagemWhatsApp/entry.ts` — function Deno para envio de WhatsApp via Z-API ou WABA; normalização E.164 para números BR; log persistido via service role
- `src/api/whatsapp.js` — stub client frontend para chamar `enviarMensagemWhatsApp` via Base44 SDK
- `scripts/deploy.sh` — script de deploy para Linux/macOS (guia interativo: Vercel + Base44 + Stripe)
- `scripts/deploy.ps1` — script de deploy para Windows PowerShell
- `PLANO_DE_ACAO.md` — plano de ação detalhado com comandos de deploy, checklist e próximos passos
- `CHANGELOG.md` — este arquivo

### Alterado
- `base44/functions/stripeWebhook/entry.ts` — adicionado envio de WhatsApp de boas-vindas após `checkout.session.completed`; integração não-bloqueante (falha no WhatsApp não afeta resposta ao Stripe)
- `package.json` — scripts: `sitemap`, `deploy`, `deploy:auto`, `deploy:windows`, `deploy:unix`, `deploy:vercel`, `deploy:base44`, `deploy:base44:fn`, `deploy:base44:entities`

---

## [2026-06-27]

### Adicionado

#### WhatsApp + Stripe Webhook
- **`base44/entities/LogWhatsApp.jsonc`**
  - Entidade de auditoria para todas as mensagens WhatsApp disparadas pela plataforma
  - Campos: `prestador_id`, `tipo` (enum boas_vindas_plano/lead_novo/lembrete_renovacao/verificacao_aprovada/aviso_admin), `telefone`, `mensagem`, `status` (enviado/falhou/pendente), `message_id`, `erro`, `timestamp`, `referencia_id`, `referencia_tipo`
  - RLS: leitura e escrita restritas a role `admin`

- **`base44/functions/enviarMensagemWhatsApp/entry.ts`** (Deno edge function)
  - Suporte a dois provedores via `WHATSAPP_PROVIDER` env var: `zapi` (padrão) e `waba`
  - Z-API: `https://api.z-api.io/instances/{ZAPI_INSTANCE_ID}/token/{ZAPI_TOKEN}/send-text`
  - WABA (Meta Graph API v19.0): `https://graph.facebook.com/v19.0/{WABA_PHONE_ID}/messages`
  - Normalização automática para E.164 brasileiro (prepend `55` se necessário)
  - Persiste log em `LogWhatsApp` via `base44.asServiceRole` (contorna RLS)
  - Retorna `{ success, message_id, log_id }` ou `{ success: false, error, log_id }`

- **`src/api/whatsapp.js`** (stub frontend/admin)
  - Exporta `enviarMensagemWhatsApp(params)` via `base44.functions`
  - Para uso interno em painel admin ou automações

#### Stripe Webhook — boas-vindas WhatsApp
- **`base44/functions/stripeWebhook/entry.ts`** — modificado
  - Helper interno `notificarWhatsApp(base44, payload)` com try/catch isolado
  - Evento `checkout.session.completed`: após criar/atualizar `Subscription`, busca `ServiceProvider` pelo `provider_id` da metadata ou `created_by: customerEmail`
  - Monta mensagem personalizada em pt-BR com nome do plano e link para o painel
  - Chama `notificarWhatsApp()` de forma não-bloqueante (falha silenciosa, sem HTTP 500 para o Stripe)

#### Documentação e scripts
- `PLANO_DE_ACAO.md` — checklist completo de deploy e testes
- `CHANGELOG.md` — histórico de mudanças (este arquivo)
- `scripts/deploy.sh` — script bash interativo para Linux/macOS
- `scripts/deploy.ps1` — script PowerShell para Windows
- `package.json` scripts: `sitemap`, `deploy`, `deploy:windows`, `deploy:unix`

---

## Versões anteriores

O projeto não mantinha CHANGELOG antes de 2026-06-27. Para histórico completo, consulte `git log`.
