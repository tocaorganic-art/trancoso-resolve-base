# Prestador Fundador — Documentação de Implementação

**Versão:** 1.0  
**Data:** 2026-07-26  
**Repositório:** `tocaorganic-art/trancoso-resolve-base`  
**App ID Base44:** `68eb21726a9614db4a82ba99`

---

## 1. Visão Geral

O programa **Prestador Fundador** concede um selo permanente aos primeiros 100 prestadores verificados que assinarem o plano Profissional (R$ 19,90/mês). O selo é uma distinção vitalícia e irrevogável à posição — cancelamentos não liberam vagas para outros prestadores.

### Regras Comerciais Imutáveis

| Regra | Valor |
|-------|-------|
| Limite máximo de concessões | 100 |
| Preço mensal | R$ 19,90 |
| Trial Profissional | 7 dias grátis |
| Teste Gratuito (alternativo) | 30 dias sem cartão |
| Cancelamento | Perde o selo definitivamente |
| Retorno após cancelamento | Não recupera o selo |
| Posição revogada | Permanece consumida (não volta ao pool) |
| Lojistas | Não participam da promoção |

---

## 2. Arquitetura

### 2.1 Entidades Base44

#### `FounderSlot`
100 registros pré-criados (posições 1–100). É o mecanismo central de alocação atômica.

```
Campos:
  position            Int      (1–100, único)
  status              Enum     available | reserved | granted | revoked | pending_reconciliation
  provider_id         String?  (FK ServiceProvider)
  subscription_id     String?  (FK Subscription)
  checkout_id         String?  
  idempotency_key     String?  (formato: providerId:preapprovalId)
  reserved_at         DateTime?
  granted_at          DateTime?
  revoked_at          DateTime?
  promotion_version   String?  (ex: "v1")
```

**RLS:** Nenhum acesso de leitura ou escrita pelo cliente — apenas service role nas functions.

#### `FounderGrant`
Registro de auditoria das concessões. Um grant por prestador.

```
Campos:
  provider_id         String   (FK ServiceProvider)
  subscription_id     String
  slot_id             String   (FK FounderSlot)
  position            Int      (1–100)
  status              Enum     active | revoked
  granted_at          DateTime
  revoked_at          DateTime?
  revocation_reason   String?
```

**RLS:** `provider_id = auth.uid()` para leitura do próprio grant. Sem escrita pelo cliente.

**Campo público retornado ao prestador (via `getProviderFounderStatus`):**
```json
{
  "is_founder": true,
  "position": 42,
  "badge_earned_at": "2026-07-01"
}
```

Nunca retornar: `subscription_id`, `slot_id`, `revocation_reason`, dados de outros prestadores.

#### `WebhookEvent`
Idempotência do webhook Mercado Pago.

```
Campos:
  provider            String   (ex: "mercado_pago")
  external_event_id   String   (id do evento MP)
  external_resource_id String  (id do recurso MP)
  event_type          String   (ex: "subscription.authorized")
  payload_hash        String   (SHA-256 do payload sem PII)
  status              Enum     received | processing | processed | failed | skipped
  attempts            Int
  received_at         DateTime
  processed_at        DateTime?
  last_error          String?  (sem stack trace, sem secrets)
  next_retry_at       DateTime?
```

**RLS:** Totalmente privada — nenhum acesso pelo cliente.

---

### 2.2 Functions Base44

#### `getFounderStats` — Pública

Retorna contagem de vagas para o frontend. Fail-closed: nunca inventa vagas em caso de erro.

```typescript
// Resposta de sucesso
{
  "granted": 42,      // total de concessões originais (ativos + revogados)
  "active": 40,       // grants com status === 'active'
  "remaining": 58,    // max(0, 100 - granted)
  "limit": 100,
  "open": true,       // remaining > 0
  "available": true   // alias de open
}

// Resposta de erro (fail-closed)
{
  "granted": 0,
  "active": 0,
  "remaining": 0,
  "limit": 100,
  "open": false,
  "available": false,
  "error": "stats_unavailable"
}
```

#### `getProviderFounderStatus` — Autenticada (prestador)

Verifica se o prestador autenticado tem o Selo Fundador.

```typescript
// Parâmetros
{ provider_id: string }

// Resposta — tem selo
{ is_founder: true, position: 42, badge_earned_at: "2026-07-01" }

// Resposta — não tem selo
{ is_founder: false }

// Resposta — erro (fail-closed)
{ is_founder: false }
```

#### `mercadoPagoWebhook` — Pública (assinatura HMAC validada)

Fluxo completo:
1. Validar assinatura HMAC-SHA256 (`MP_WEBHOOK_SECRET`)
2. Verificar idempotência via `WebhookEvent` (external_event_id único)
3. Buscar recurso diretamente no MP (nunca confiar no payload)
4. Processar por status: `authorized` → alocar slot + criar grant
5. Em falha de alocação: persistir `pending_reconciliation` + log `[RECONCILIAR-URGENTE]`
6. CAPI: disparar `FounderBadgeGranted` e `Subscribe` após sucesso

**Alocação atômica via FounderSlot:**
```
1. Verificar idempotency_key (providerId:preapprovalId) — se já existe, retornar grant existente
2. Verificar se provider já tem grant — se sim, retornar grant existente
3. Buscar slots com status = 'available' OU (status = 'reserved' E reserved_at < agora - 10min)
4. Ordenar por position ASC, pegar o primeiro
5. Atualizar slot: status='reserved', reserved_at=now, idempotency_key
6. Criar FounderGrant
7. Atualizar slot: status='granted', granted_at=now
8. Em erro no passo 7: slot fica como 'pending_reconciliation'
```

#### `cancelarAssinatura` — Autenticada (owner)

1. Verificar ownership: `subscription.provider_id === auth.uid()`
2. Cancelar no Mercado Pago
3. Atualizar `Subscription.status = 'cancelled'`
4. Buscar e revogar `FounderGrant` do prestador
5. Atualizar `FounderSlot.status = 'revoked'`
6. Em falha de revogação: `FounderSlot.status = 'pending_reconciliation'` + log `[RECONCILIAR-URGENTE]`
7. CAPI: disparar `CancelSubscription`

#### `sendCapiEvent` — Admin only (HTTP)

Endpoint para disparar eventos CAPI manualmente se necessário.
Exporta também `sendCapiEventInternal()` para uso interno nas functions.

Requer `FB_ACCESS_TOKEN` no Deno.env. Sem esse secret, é no-op (analytics é opcional, nunca bloqueia o fluxo principal).

#### `initFounderSlots` — Admin only

**⚠️ AÇÃO MANUAL OBRIGATÓRIA APÓS DEPLOY:**

```
1. Acessar o painel admin do Base44
2. Chamar a function initFounderSlots como service role
3. Ela criará 100 FounderSlot records (posições 1–100) com status 'available'
4. Para grants legados (criados antes do FounderSlot): a function criará slots com
   status 'granted' para cada grant existente, preservando as posições
5. Confirmar: query FounderSlot → deve ter exatamente 100 registros
```

Nunca chamar `initFounderSlots` mais de uma vez em produção.

---

### 2.3 Frontend

#### `src/lib/pixel.js`
Helper Meta Pixel com deduplicação por `event_id`. Nunca envia PII.

Exports principais:
- `pixelTrack(event, params)` — evento genérico
- `pixelLandingPageView()` — ViewContent na landing /PrestadorFundador
- `pixelClickFounderCTA(placement)` — Lead ao clicar no CTA (hero ou cta_final)
- `pixelSubscribe(params)` — Subscribe após assinatura confirmada
- `pixelFounderBadgeGranted(position)` — evento de concessão do selo
- `pixelCancelSubscription()` — CancelSubscription

Pixel ID: `1469130194903035`

#### `src/components/analytics/PageViewTracker.jsx`
Dispara `PageView` em toda mudança de rota + eventos específicos por página:
- `/PrestadorFundador` → `pixelLandingPageView()`
- `/Planos` → `ViewContent` (Planos e Preços)
- `/SejaPrestador` → `ViewContent` (Seja um Prestador)

GA4 ID: `G-3KF75243B4`

#### `src/components/prestador-fundador/FounderBadge.jsx`
Badge visual com gradiente âmbar/laranja e ícone Crown.

```jsx
<FounderBadge position={42} size="sm" />   // Cards de busca
<FounderBadge position={42} size="md" />   // Perfil público
```

Integrado em:
- `src/pages/PrestadorPerfil.jsx` — perfil público do prestador
- `src/components/providers/ProviderCard.jsx` — cards de busca/listagem

Ambos usam React Query (`useQuery`) para buscar status via `getProviderFounderStatus`, com `staleTime: 5min` e `enabled: !!provider?.id`.

#### `src/Layout.jsx`
Atualiza por rota:
- `document.title`
- `meta[property="og:title"]`
- `meta[property="og:description"]`
- `meta[property="og:url"]` — URL canônica dinâmica
- `meta[property="og:image"]`
- `link[rel="canonical"]` — canônico dinâmico
- `meta[name="twitter:title"]`
- `meta[name="twitter:description"]`

---

## 3. Configuração de Secrets

| Secret | Onde configurar | Obrigatório |
|--------|-----------------|-------------|
| `MP_WEBHOOK_SECRET` | Base44 Secrets | ✅ Sim |
| `MP_ACCESS_TOKEN` | Base44 Secrets | ✅ Sim |
| `FB_ACCESS_TOKEN` | Base44 Secrets | ⚠️ CAPI (opcional) |
| `FB_TEST_EVENT_CODE` | Base44 Secrets | 🧪 Só para testes |

---

## 4. Suíte de Testes

**Arquivo:** `test/founder-stats.contract.test.js`  
**Runner:** `node --test test/`  
**Total:** 36 testes, 0 falhas

### Grupos

**Contagem de vagas (1–10):**
- Zero grants, um grant, 99 ativos, 100 ativos
- Revogados contam como vagas consumidas
- `remaining` nunca negativo

**Trial e prevenção de acúmulo (11–15):**
- Primeiro usuário recebe trial
- `trial_consumed_at` bloqueia novo trial
- Teste Gratuito 30d bloqueia trial Profissional 7d
- Fail-closed: erro ao verificar = bloqueia

**Privacidade do DTO (16–18):**
- Resposta de sucesso não expõe dados sensíveis
- Resposta de erro não expõe stack trace
- Indisponibilidade nunca declara vagas abertas

**Concorrência e idempotência (19–23):**
- 99 grants → alocação OK
- 100 grants → bloqueio
- 90 ativos + 10 revogados = 100 taken
- Mesmo email não recebe dois grants
- Email revogado não recupera selo

**FounderSlot — alocação atômica (24–36):**
- Slot disponível encontrado corretamente
- Sem candidatos quando todos granted/revoked/pending
- Reserva válida (< 10min) não é candidato
- Reserva expirada (> 10min) volta ao pool
- Idempotência por chave duplicada
- Chave inexistente → nova alocação
- Slot revogado nunca vira candidato
- 100 slots granted → sem candidatos
- 99 granted + 1 available → 1 candidato na posição 100
- Formato correto de `idempotency_key`
- Dois checkouts → mesmo slot (não duplica)
- 10 webhooks → zero grants novos
- `pending_reconciliation` não retorna ao pool

---

## 5. Procedimento de Rollback

### Rollback de Deploy Vercel

```bash
# Listar deployments
npx vercel ls --prod

# Promover deployment anterior para produção
npx vercel rollback [deployment-url]
```

### Rollback de Mudanças de Código

```bash
# Reverter último commit (mantém mudanças no working tree)
git revert HEAD --no-commit
git commit -m "revert: rollback campanha fundador"
git push origin main

# OU: reverter para commit específico
git revert <commit-sha>
```

### Rollback de Entidades Base44

Mudanças de schema são aditivas (novos campos, novas entidades). Para reverter:
1. Acessar painel Base44 → Entities
2. Remover campos adicionados (se não houver dados)
3. Para entidades novas com dados: marcar como `archived` via admin

### Rollback de FounderSlots com Dados

⚠️ **Nunca deletar FounderSlot records em produção.**

Se `initFounderSlots` gerou slots incorretos:
1. Atualizar status dos slots incorretos para `pending_reconciliation`
2. Executar `[RECONCILIAR-URGENTE]` manualmente via admin
3. Corrigir via patch cirúrgico em cada registro

---

## 6. Smoke Test Pós-Deploy

Execute estes checks manualmente após cada deploy em produção:

### Checklist

```
[ ] 1. https://trancosoresolve.com.br carrega sem erro 500
[ ] 2. /PrestadorFundador renderiza — título correto no <title>
[ ] 3. og:url e canonical apontam para a URL correta da página
[ ] 4. FounderCounter exibe número consistente (não "0/0")
[ ] 5. CTA "Quero ser Fundador" → redireciona para /Planos
[ ] 6. /Planos → aba "Prestadores" visível, preço R$ 19,90 correto
[ ] 7. /Planos → aba "Lojistas" visível, Essencial R$89 / Pro R$197 / Elite R$497
[ ] 8. Perfil de prestador verificado: FounderBadge visível se is_founder
[ ] 9. Card de prestador em busca: FounderBadge visível se is_founder
[ ] 10. Meta Pixel: network tab mostra /tr?id=1469130194903035 na landing
[ ] 11. GA4: network tab mostra /collect?... com G-3KF75243B4
[ ] 12. Webhook test via Mercado Pago sandbox → getFounderStats retorna vagas corretas
[ ] 13. Função getFounderStats retorna JSON com "open", "remaining", "limit"
[ ] 14. FounderGrant.read → retorna 403 para usuário não autenticado
[ ] 15. WebhookEvent → não acessível pelo frontend
```

### Verificação CAPI (se FB_ACCESS_TOKEN configurado)

```
[ ] 16. Events Manager do Meta → testar com FB_TEST_EVENT_CODE
[ ] 17. Evento FounderBadgeGranted aparece após assinatura sandbox
[ ] 18. Evento Subscribe aparece após preapproval → authorized
[ ] 19. Evento CancelSubscription aparece após cancelamento
```

---

## 7. Guia de Resolução de `[RECONCILIAR-URGENTE]`

Quando um log `[RECONCILIAR-URGENTE]` aparece, um FounderSlot ficou em `pending_reconciliation`. Isso significa que o grant foi criado mas o slot não foi atualizado para `granted`.

### Passos de Reconciliação Manual

```
1. Identificar o slot afetado (provider_id no log)
2. Verificar se FounderGrant existe para o provider_id
   - Se sim: atualizar FounderSlot.status = 'granted', granted_at = FounderGrant.granted_at
   - Se não: atualizar FounderSlot.status = 'available' (reserva falhou)
3. Se FounderGrant existe mas slot não está correto:
   - Verificar se subscription está ativa no Mercado Pago
   - Se ativa: corrigir slot
   - Se inativa: status = 'pending_reconciliation' aguarda próximo ciclo
4. Confirmar: query FounderSlot WHERE provider_id = X → status correto
5. Confirmar: query FounderGrant WHERE provider_id = X → status active
```

### Prevenção de Duplicidade na Reconciliação

Sempre verificar antes de reconciliar:
- Existe outro FounderSlot com `status = 'granted'` para o mesmo `provider_id`? Se sim, está correto.
- O `idempotency_key` já existe em outro slot? Se sim, usar o slot existente.

---

## 8. Configuração CAPI

A Meta Conversions API é **opcional** — o fluxo principal nunca é bloqueado por falha de CAPI.

### Setup

1. Configurar `FB_ACCESS_TOKEN` em Base44 Secrets
2. Para testes: configurar `FB_TEST_EVENT_CODE` (obtido no Events Manager)
3. Pixel ID já está hardcoded como `1469130194903035`

### Eventos Enviados

| Evento | Function | Quando |
|--------|----------|--------|
| `FounderBadgeGranted` | mercadoPagoWebhook | Grant criado com sucesso |
| `Subscribe` | mercadoPagoWebhook | Assinatura → status 'authorized' |
| `CancelSubscription` | cancelarAssinatura | Cancelamento confirmado |

### Deduplicação

Cada evento tem um `event_id` único (UUID v4) compartilhado entre o Pixel (cliente) e o CAPI (servidor). O Meta usa esse ID para deduplicar.

---

## 9. Histórico de Mudanças

| Fase | Arquivo(s) | Mudança |
|------|-----------|---------|
| FASE 1 | `base44/entities/FounderGrant.jsonc` | RLS privada — sem leitura pública |
| FASE 2 | `base44/entities/FounderSlot.jsonc` | Nova entidade — alocação atômica 100 slots |
| FASE 2 | `base44/functions/getFounderStats/entry.ts` | Reescrito — fail-closed, conta revogados |
| FASE 2 | `base44/functions/initFounderSlots/entry.ts` | Nova function — seed dos 100 slots |
| FASE 2 | `base44/functions/allocateFounderSlot/entry.ts` | Nova function — alocação atômica |
| FASE 3 | `base44/entities/WebhookEvent.jsonc` | Nova entidade — idempotência |
| FASE 3 | `base44/functions/mercadoPagoWebhook/entry.ts` | Idempotência, reconciliação, HMAC |
| FASE 4 | `base44/functions/cancelarAssinatura/entry.ts` | Revogação idempotente, reconciliação |
| FASE 5 | `base44/functions/criarTrialPrestador/entry.ts` | trial_consumed_at, prevenção de acúmulo |
| FASE 6 | `src/components/providers/ProviderCard.jsx` | FounderBadge integrado via React Query |
| FASE 7 | `src/pages/PrestadorFundador.jsx` | CTA rastreado, setTimeout removido |
| FASE 8 | `src/Layout.jsx` | og:url, canonical, twitter:title/description dinâmicos |
| FASE 9 | `src/lib/pixel.js` | Nova lib — Pixel sem PII, deduplicação event_id |
| FASE 9 | `src/components/analytics/PageViewTracker.jsx` | GA4 ID corrigido, Pixel integrado |
| FASE 9 | `base44/functions/mercadoPagoWebhook/entry.ts` | CAPI Subscribe + FounderBadgeGranted |
| FASE 9 | `base44/functions/cancelarAssinatura/entry.ts` | CAPI CancelSubscription |
| FASE 9 | `base44/functions/sendCapiEvent/entry.ts` | Nova function — endpoint CAPI admin |
| FASE 10 | `test/founder-stats.contract.test.js` | +13 testes FounderSlot (total: 36) |
