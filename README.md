# Trancoso Resolve

Marketplace de serviços locais em **Trancoso, Bahia**. Conecta moradores, empresários e donos de imóvel a prestadores de serviços locais — elétrica, limpeza, jardinagem, reformas e mais.

> "Encontre quem resolve, pertinho de você."

---

## Stack

- **Frontend:** React 18 + Vite 6.1 + Tailwind 3.4 + shadcn/ui (new-york)
- **Backend:** Base44 (entities + Deno edge functions)
- **Pagamentos:** Stripe (assinaturas + webhooks)
- **Notificações:** WhatsApp via Z-API ou WABA
- **Hosting:** Vercel (frontend) + Base44 (functions/entities)

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção
npm run lint       # ESLint
npm run typecheck  # tsc
npm run sitemap    # regenera public/sitemap.xml
```

---

## Deploy

### Opção 1 — Validar o build local

```bash
# Apenas instala dependências e valida o build; não publica
npm run deploy

# Equivalentes por sistema operacional
npm run deploy:windows   # PowerShell, somente build
npm run deploy:unix      # bash, somente build

# Publicações separadas — executar manualmente, após revisão
npm run deploy:vercel              # apenas frontend → Vercel
npm run deploy:base44              # entities + functions → Base44
npm run deploy:base44:fn           # apenas functions
npm run deploy:base44:entities     # apenas entities
```

O script padrão faz somente `npm ci` + `npm run build`. Vercel e Base44
possuem alvos separados para impedir publicação acidental.

### Opção 2 — Deploy manual

#### Frontend (Vercel)

O deploy ocorre automaticamente a cada push para `main` via integração GitHub. Para forçar um deploy manual:

```bash
npx vercel deploy --prod --yes
```

Variáveis de ambiente necessárias no painel Vercel (Settings → Environment Variables):

| Variável | Descrição |
|---|---|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `WHATSAPP_PROVIDER` | `zapi` (padrão) ou `waba` |
| `ZAPI_INSTANCE_ID` | ID da instância Z-API |
| `ZAPI_TOKEN` | Token Z-API |
| `WABA_TOKEN` | Token WhatsApp Business Cloud (se usar WABA) |
| `WABA_PHONE_ID` | Phone Number ID (se usar WABA) |
| `VITE_GOOGLE_MAPS_API_KEY` | Chave pública do Google Maps com restrição por domínio, APIs e quota |

#### Backend (Base44)

1. Acesse o app `68eb21726a9614db4a82ba99` no painel Base44
2. **Entities → New Entity** → colar `base44/entities/LogWhatsApp.jsonc`
3. **Functions → enviarMensagemWhatsApp** → colar `base44/functions/enviarMensagemWhatsApp/entry.ts`
4. **Functions → stripeWebhook** → colar `base44/functions/stripeWebhook/entry.ts`
5. Configurar as variáveis de ambiente em cada function, incluindo
   `AUTOMATION_WEBHOOK_SECRET` para as chamadas internas protegidas

> ⚠️ A publicação do Base44 deve ser manual. Não usar "Push to GitHub" no
> Base44 sem revisar a direção do sincronismo.

#### Webhook Stripe

1. [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → Add endpoint
2. URL: `https://trancosoresolve.com.br/api/functions/stripeWebhook`
3. Eventos:
   - `checkout.session.completed`
   - `invoice.paid` / `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `payment_intent.amount_capturable_updated` / `payment_intent.succeeded` / `payment_intent.payment_failed` / `payment_intent.canceled`
   - `charge.dispute.created`
   - `account.updated`
4. Copiar **Signing secret** → adicionar como `STRIPE_WEBHOOK_SECRET`

---

## Modelo híbrido

```
┌─────────────────────┐     ┌────────────────────────────┐
│  Frontend (Vercel)  │────▶│  Backend (Base44)          │
│  React + Vite       │     │  Deno edge functions       │
│  trancosoresolve.   │     │  Entities (DB + RLS)       │
│  com.br             │     │  /api/functions/*          │
└─────────────────────┘     └────────────────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │  Stripe Webhooks  │
                              │  Z-API / WABA     │
                              └───────────────────┘
```

---

## Teste com Stripe CLI

```bash
# Instalar
brew install stripe/stripe-cli/stripe   # macOS
# Windows: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Encaminhar eventos para o servidor local
stripe listen --forward-to http://localhost:5173/api/functions/stripeWebhook

# Simular eventos
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted
```

---

## Documentação adicional

- [`CHANGELOG.md`](./CHANGELOG.md) — histórico de versões
- [`PLANO_DE_ACAO.md`](./PLANO_DE_ACAO.md) — checklist completo de deploy e testes
- [`CLAUDE.md`](./CLAUDE.md) — guia para agentes de IA (stack, padrões, design system)
- [`STATUS-DO-PROJETO.md`](./STATUS-DO-PROJETO.md) — estado atual do projeto

---

## Estrutura principal

```
src/
├── pages/          # Rotas (Home, Dashboard, Admin*, destinos/*, servicos/*)
├── components/     # UI e negócio (shadcn/ui + componentes customizados)
├── api/            # Base44 client, entities, integrations, whatsapp
├── hooks/          # useSEO, useDestinationSeo, useMobile…
└── lib/            # AuthContext, analytics, performance…

base44/
├── entities/       # Schemas JSONC (LogWhatsApp, ServiceProvider…)
└── functions/      # Deno edge functions (stripeWebhook, enviarMensagemWhatsApp…)

scripts/
├── deploy.sh       # Deploy Linux/macOS
├── deploy.ps1      # Deploy Windows
└── generate-sitemap.js
```
