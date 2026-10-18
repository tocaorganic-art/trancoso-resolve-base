# Trancoso Resolve

Marketplace de serviços locais em **Trancoso, Bahia**. Conecta moradores, empresários e donos de imóvel a prestadores de serviços locais — elétrica, limpeza, jardinagem, reformas e mais.

> "Encontre quem resolve, pertinho de você."

---

## Stack

- **Frontend:** React 18 + Vite 6.1 + Tailwind 3.4 + shadcn/ui (new-york)
- **Backend:** Base44 (entities + Deno edge functions)
- **Pagamentos:** Asaas (assinaturas + webhooks)
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
| `WHATSAPP_PROVIDER` | `zapi` (padrão) ou `waba` |
| `ZAPI_INSTANCE_ID` | ID da instância Z-API |
| `ZAPI_TOKEN` | Token Z-API |
| `WABA_TOKEN` | Token WhatsApp Business Cloud (se usar WABA) |
| `WABA_PHONE_ID` | Phone Number ID (se usar WABA) |
| `VITE_GOOGLE_MAPS_API_KEY` | Chave pública do Google Maps com restrição por domínio, APIs e quota |

> Os secrets de pagamento (Asaas) ficam apenas no ambiente das functions do Base44 — nunca no frontend/Vercel.

#### Backend (Base44)

1. Acesse o app `68eb21726a9614db4a82ba99` no painel Base44
2. **Entities → New Entity** → colar `base44/entities/LogWhatsApp.jsonc`
3. **Functions → enviarMensagemWhatsApp** → colar `base44/functions/enviarMensagemWhatsApp/entry.ts`
4. Configurar as variáveis de ambiente em cada function, incluindo
   `AUTOMATION_WEBHOOK_SECRET` para as chamadas internas protegidas

> ⚠️ A publicação do Base44 deve ser manual. Não usar "Push to GitHub" no
> Base44 sem revisar a direção do sincronismo.

#### Webhook Asaas

1. No painel do Asaas (Integrações → Webhooks), cadastrar a URL `https://trancosoresolve.com.br/api/functions/asaasWebhook`
2. Definir o mesmo token em `ASAAS_WEBHOOK_TOKEN` (o Asaas envia no header `asaas-access-token`)
3. Eventos e proteções: ver `base44/functions/asaasWebhook/entry.ts`

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
                              │  Webhooks Asaas   │
                              │  Z-API / WABA     │
                              └───────────────────┘
```

---

## Pagamentos (Asaas)

O gateway oficial é o **Asaas**. O webhook `asaasWebhook` valida token,
garante idempotência e busca o estado real da cobrança no Asaas.
Eventos e configuração: `base44/functions/asaasWebhook/entry.ts`.

---

## Documentação adicional

- [`CHANGELOG.md`](./CHANGELOG.md) — histórico de versões
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
└── functions/      # Deno edge functions (asaasWebhook, enviarMensagemWhatsApp…)

scripts/
├── deploy.sh       # Deploy Linux/macOS
├── deploy.ps1      # Deploy Windows
└── generate-sitemap.js
```
