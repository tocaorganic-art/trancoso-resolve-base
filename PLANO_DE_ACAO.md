# Plano de Ação — WhatsApp + Stripe Webhook

> Guia completo de deploy, configuração e testes para a integração
> WhatsApp (Z-API / WABA) + Stripe Webhook no Trancoso Resolve.

---

## 1. Desenvolvimento local

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Lint e typecheck
npm run lint
npm run typecheck
```

---

## 2. Teste com Stripe CLI

```bash
# Instalar Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Encaminhar eventos ao servidor local (Base44 dev ou localhost)
stripe listen --forward-to http://localhost:5173/api/functions/stripeWebhook

# Simular checkout completo
stripe trigger checkout.session.completed

# Simular renovação de assinatura
stripe trigger invoice.paid

# Simular cancelamento
stripe trigger customer.subscription.deleted
```

---

## 3. Push de functions no Base44

Acesse o painel Base44 do app `68eb21726a9614db4a82ba99`:

1. **Functions** → `enviarMensagemWhatsApp` → colar conteúdo de `base44/functions/enviarMensagemWhatsApp/entry.ts`
2. **Functions** → `stripeWebhook` → colar conteúdo atualizado de `base44/functions/stripeWebhook/entry.ts`
3. Salvar e fazer deploy de cada function

> ⚠️ NUNCA usar "Push to GitHub" no Base44 — sobrescreve a migração de marca.

---

## 4. Criar entidade LogWhatsApp

No painel Base44 → **Entities** → **New Entity**:

- Colar o JSON de `base44/entities/LogWhatsApp.jsonc`
- Salvar

Campos obrigatórios: `tipo`, `telefone`
RLS: leitura e escrita para role `admin` apenas

---

## 5. Configuração de secrets (Vercel + Base44)

### Variáveis de ambiente necessárias

| Variável | Descrição |
|---|---|
| `WHATSAPP_PROVIDER` | `zapi` ou `waba` (padrão: `zapi`) |
| `ZAPI_INSTANCE_ID` | ID da instância Z-API |
| `ZAPI_TOKEN` | Token de autenticação Z-API |
| `WABA_TOKEN` | Token da WhatsApp Business Cloud API (se usar WABA) |
| `WABA_PHONE_ID` | Phone Number ID (se usar WABA) |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (já deve existir) |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe (já deve existir) |

### Onde configurar

**Vercel:** Dashboard → Settings → Environment Variables

**Base44:** Functions → Settings → Environment Variables (para cada function)

---

## 6. Cadastro do webhook no Stripe Dashboard

1. Acesse [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **Add endpoint**
3. URL: `https://trancosoresolve.com.br/api/functions/stripeWebhook`
4. Eventos a escutar:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `payment_intent.amount_capturable_updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`
   - `account.updated`
5. Copiar o **Signing secret** e adicionar como `STRIPE_WEBHOOK_SECRET`

---

## 7. Teste completo do fluxo

### Fluxo: cadastro → fila → pagamento → ativação + WhatsApp

```
1. Criar conta de prestador em /cadastro
2. Prestador aparece em /admin/verificacao (FilaVerificacaoCard)
3. Admin clica "Gerar link de checkout" → link Stripe é gerado
4. Prestador acessa link e completa pagamento
5. Stripe dispara checkout.session.completed para o webhook
6. stripeWebhook:
   a. Cria/atualiza Subscription no Base44
   b. Busca ServiceProvider pelo email
   c. Envia mensagem WhatsApp de boas-vindas (se phone disponível)
   d. Log salvo em LogWhatsApp
7. Prestador recebe WhatsApp: "Olá, [Nome]! Seu plano [X] está ativo..."
8. Verificar log em Base44 → Entities → LogWhatsApp
```

### Verificação rápida de logs

```bash
# Logs da function no Base44 (via painel)
Base44 → Functions → enviarMensagemWhatsApp → Logs

# Logs do Stripe Webhook
Stripe Dashboard → Developers → Webhooks → [endpoint] → Recent deliveries
```

---

## 8. Lista de arquivos alterados

### Novos arquivos

| Arquivo | Descrição |
|---|---|
| `base44/entities/LogWhatsApp.jsonc` | Entidade de auditoria WhatsApp |
| `base44/functions/enviarMensagemWhatsApp/entry.ts` | Function Deno de envio |
| `src/api/whatsapp.js` | Stub client frontend |
| `scripts/deploy.sh` | Script de deploy Linux/macOS |
| `scripts/deploy.ps1` | Script de deploy Windows |
| `PLANO_DE_ACAO.md` | Este arquivo |
| `CHANGELOG.md` | Histórico de versões |

### Arquivos atualizados

| Arquivo | O que mudou |
|---|---|
| `base44/functions/stripeWebhook/entry.ts` | Adicionado envio WhatsApp pós-checkout |
| `package.json` | Scripts: `sitemap`, `deploy`, `deploy:windows`, `deploy:unix` |

---

## 9. Próximos passos

- [ ] Configurar `WHATSAPP_PROVIDER` + credenciais Z-API ou WABA no painel Base44
- [ ] Criar entidade `LogWhatsApp` no painel Base44
- [ ] Fazer deploy das functions `enviarMensagemWhatsApp` e `stripeWebhook` no Base44
- [ ] Cadastrar webhook no Stripe Dashboard com o endpoint correto
- [ ] Testar fluxo completo com `stripe trigger checkout.session.completed`
- [ ] Verificar log em `LogWhatsApp` após teste
- [ ] (Opcional) Criar job diário Toca TrIA para notificar novos prestadores aprovados
- [ ] (Opcional) Atualizar `FilaVerificacaoCard` para gerar link de checkout real via API
