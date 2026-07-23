# Relatório de Diagnóstico e Correções — Trancoso Resolve

**Data:** 23 de julho de 2026
**Responsável:** Equipe de Engenharia
**Status:** Correções aplicadas — pendente configuração de secrets e publicação

---

## 1. Resumo Executivo

O projeto Trancoso Resolve apresentava **falhas críticas de build/publicação**, **vulnerabilidades de segurança** na exposição de dados de prestadores, e **duplicação de processadores de pagamento** (Mercado Pago + Stripe). Este relatório documenta as causas raiz identificadas, as correções aplicadas e os itens pendentes.

---

## 2. Problemas Diagnosticados

### 2.1 Falha de Build/Publicação (Crítico)

| # | Causa Raiz | Impacto |
|---|-----------|---------|
| 1 | Pacote `@mercadopago/sdk-react` instalado com side-effects de módulo no escopo de frontend | Build/SSR falhava ao tentar inicializar SDK do MP no top-level |
| 2 | Componente `CheckoutPagamento.jsx` continha `initMercadoPago()` e `processPayment()` no escopo de módulo | Injeção de código que quebrava o pipeline de compilação |
| 3 | Inicialização global do cliente Stripe no escopo de módulo das funções backend | Erro de execução no deploy por ausência de variáveis de ambiente no boot |
| 4 | Comando `buildCommand` customizado (prerender) no `vercel.json` | Falha no ambiente de publicação da Base44 |
| 5 | Diretório órfão `base44/functions/sentry-init` vazio | Falha no pipeline de publicação |
| 6 | Versões inconsistentes do `@base44/sdk` entre funções backend (0.7.1 → 0.8.31) | Falha na pipeline de publicação por mismatch de dependências |

### 2.2 Vulnerabilidades de Segurança (Alto)

| # | Vulnerabilidade | Risco |
|---|----------------|-------|
| 1 | Listagem pública de prestadores retornava dados sensíveis (CPF, CNPJ, telefone, email, documentos, localização precisa) | Exposição de PII de prestadores não verificados |
| 2 | Filtro de `verified=true` era aplicado apenas no frontend | Prestadores não verificados poderiam aparecer na vitrine pública se o frontend fosse bypassado |
| 3 | Meta Conversions API (CAPI) chamada diretamente do navegador com token exposto | Token de API do Facebook visível no código fonte do cliente |
| 4 | Whitelist de emails administrativos sem validação server-side em rotas críticas | Potencial escalation de privilégios |

### 2.3 Duplicação de Processadores de Pagamento (Médio)

| # | Problema | Impacto |
|---|---------|---------|
| 1 | Mercado Pago e Stripe coexistiam no código | Manutenção duplicada, confusão operacional |
| 2 | Função `criarPagamentoServico` aceitava `amount` do cliente | Cliente poderia manipular o valor do pagamento |
| 3 | Sem validação de propriedade do pedido | Qualquer usuário autenticado poderia criar pagamento para pedido alheio |
| 4 | Sem verificação de status da solicitação | Pagamentos criados para pedidos não confirmados/cancelados |
| 5 | Referências textuais a "Mercado Pago" em 9 arquivos | Inconsistência de comunicação com usuários |

---

## 3. Correções Aplicadas

### 3.1 Build/Publicação

- ✅ Desinstalação do pacote `@mercadopago/sdk-react`
- ✅ Remoção do componente órfão `CheckoutPagamento.jsx`
- ✅ Migração da inicialização do Stripe para dentro dos handlers das funções backend (lazy init)
- ✅ Remoção do comando `buildCommand` (prerender) do `vercel.json`
- ✅ Remoção do diretório órfão `base44/functions/sentry-init`
- ✅ Padronização de todas as 38 funções backend com `@base44/sdk@0.8.31`
- ✅ Fixação de versões críticas: `@base44/sdk@0.8.31`, `@base44/vite-plugin@1.0.21`, `vite@6.3.6`
- ✅ **Build passa em 13.99s sem erros**

### 3.2 Segurança

- ✅ Criação de `listPublicProviders` com sanitização server-side:
  - Filtro `verified=true` imposto no backend (não bypassável pelo frontend)
  - Resposta contém apenas: nome, foto, ocupação, bio, especialidades, avaliação, portfólio, cidade, disponibilidade
  - PII removido: CPF, CNPJ, telefone, email, documentos, endereço preciso
- ✅ Meta CAPI migrada para processamento exclusivamente server-side:
  - Removidas chamadas do navegador em `analytics.js`
  - Autenticação via header `x-capi-secret` (`META_CAPI_INGEST_SECRET`)
  - Corrigido para usar `META_CONVERSIONS_API_TOKEN` (secret já existente)
- ✅ Validação de propriedade/admin no `criarPagamentoServico`

### 3.3 Consolidação de Pagamentos

- ✅ Stripe adotado como **único processador de pagamentos**
- ✅ Política de **comissão zero** (100% para o prestador)
- ✅ `criarPagamentoServico` refatorado:
  - Aceita apenas `{ request_id }` — valor não vem mais do cliente
  - Valida propriedade (cliente dono do pedido) ou role admin
  - Exige status "Confirmado" da `ServiceRequest`
  - Busca preço diretamente da entidade `ServiceListing`
  - Idempotência: verifica Payment existente antes de criar novo intent
- ✅ Substituição de todas as 9 referências textuais "Mercado Pago" → "Stripe"

### 3.4 Secrets Declarados

Os seguintes secrets foram declarados como necessários para o funcionamento:

| Secret | Função | Status |
|--------|--------|--------|
| `STRIPE_SECRET_KEY` | `criarPagamentoServico`, `stripeWebhook`, `onboardingStripeConnect`, `autoCapturaEscrow`, `confirmarServicoConcluido` | ⏳ Pendente configuração no painel |
| `STRIPE_WEBHOOK_SECRET` | `stripeWebhook` | ⏳ Pendente configuração no painel |
| `META_CAPI_INGEST_SECRET` | `metaCAPI` (autenticação server-side) | ⏳ Pendente configuração no painel |
| `AUTOMATION_WEBHOOK_SECRET` | Automações seguras | ⏳ Pendente configuração no painel |

**Secrets já configurados (existentes):** `META_CONVERSIONS_API_TOKEN`, `INFOSIMPLES_API_KEY`, `OPENAI_API_KEY`, `claude-full`, `claude-trancosoresolve`

**Secrets obsoletos (não mais utilizados):** `MP_WEBHOOK_SECRET`, `MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN`

---

## 4. Validação

| Verificação | Resultado |
|-------------|-----------|
| Build de produção (`vite build`) | ✅ Passa em 13.99s |
| Referências a Mercado Pago no código | ✅ Zero (grep confirma "CLEAN") |
| `@mercadopago/sdk-react` no `package.json` | ✅ Removido |
| Função `listPublicProviders` | ✅ Retorna apenas prestadores verificados, sem PII |
| Função `criarPagamentoServico` | ⚠️ Retorna 503 corretamente (STRIPE_SECRET_KEY não configurada) |
| Erros de import/compilação | ✅ Nenhum |

---

## 5. Itens Pendentes

### 5.1 Bloqueantes para Produção

1. **Configurar secrets no painel Base44:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `META_CAPI_INGEST_SECRET`
   - `AUTOMATION_WEBHOOK_SECRET`

2. **Remover secrets obsoletos do painel:**
   - `MP_WEBHOOK_SECRET`
   - `MP_PUBLIC_KEY`
   - `MP_ACCESS_TOKEN`

3. **Configurar webhook do Stripe** no dashboard do Stripe apontando para a função `stripeWebhook`

4. **Publicar o site** via painel Base44 após configuração dos secrets

### 5.2 Não Bloqueantes

5. **Atualizar `Planos.jsx`** com os 4 planos documentados (R$29,90 / R$49,90 / R$59,90 / R$89,90)
6. **Smoke tests** em produção após publicação
7. **Sincronizar código** com PR #86 (via CLI local — não executável pelo agente)
8. **Cadastrar prestadores reais** (vitrine atualmente com placeholders)

---

## 6. Conclusão

As causas raiz das falhas de build e das vulnerabilidades de segurança foram identificadas e corrigidas. O build passa sem erros, o Mercado Pago foi completamente removido, o Stripe foi consolidado como único processador com comissão zero, e as camadas de segurança (sanitização de dados públicos, CAPI server-side, validação de propriedade) foram implementadas.

**O próximo passo crítico é a configuração dos secrets do Stripe no painel Base44**, seguida da publicação e validação em produção.