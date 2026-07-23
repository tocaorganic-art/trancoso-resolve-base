# Relatório de Diagnóstico e Correções — Trancoso Resolve

**Data:** 23 de julho de 2026
**Status:** Correções aplicadas — pendente configuração de secrets e publicação

---

## 1. Resumo Executivo

O projeto Trancoso Resolve apresentava **falhas críticas de build/publicação**, **vulnerabilidades de segurança** na exposição de dados de prestadores, e **duplicação de processadores de pagamento** (Mercado Pago + Stripe). Este relatório documenta as causas raiz identificadas, as correções aplicadas (verificadas no código atual) e os itens pendentes.

---

## 2. Problemas Diagnosticados

### 2.1 Falha de Build/Publicação (Crítico)

| # | Causa Raiz | Impacto |
|---|-----------|---------|
| 1 | Pacote `@mercadopago/sdk-react` instalado no frontend | Build falhava ao inicializar o SDK do MP |
| 2 | Componente `CheckoutPagamento.jsx` com inicialização do MP no escopo de módulo | Quebrava o pipeline de compilação |
| 3 | Inicialização global do cliente Stripe no escopo de módulo das funções backend | Erro de execução no deploy por ausência de variáveis de ambiente no boot |
| 4 | Comando `buildCommand` customizado (prerender) no `vercel.json` | Falha no ambiente de publicação da Base44 |
| 5 | Diretório órfão `base44/functions/sentry-init` vazio | Falha no pipeline de publicação |
| 6 | Versões inconsistentes do `@base44/sdk` entre funções backend (0.7.1 vs 0.8.31) | Falha na pipeline por mismatch de dependências |

### 2.2 Vulnerabilidades de Segurança (Alto)

| # | Vulnerabilidade | Risco |
|---|----------------|-------|
| 1 | Listagem pública de prestadores retornava dados sensíveis (CPF, CNPJ, telefone, email, documentos) | Exposição de PII |
| 2 | Filtro de `verified=true` aplicado apenas no frontend | Prestadores não verificados poderiam aparecer na vitrine se o frontend fosse bypassado |
| 3 | Meta Conversions API (CAPI) chamada do navegador com token exposto | Token do Facebook visível no código do cliente |
| 4 | Função de pagamento aceitava valor (`amount`) vindo do cliente | Cliente poderia manipular o valor do pagamento |

### 2.3 Duplicação de Processadores de Pagamento (Médio)

- Mercado Pago e Stripe coexistiam no código, gerando manutenção duplicada.
- Sem validação de propriedade do pedido nem de status da solicitação antes de criar pagamentos.
- Referências textuais a "Mercado Pago" espalhadas em 9 arquivos da interface.

---

## 3. Correções Aplicadas (verificadas no código atual)

### 3.1 Build/Publicação

- ✅ `@mercadopago/sdk-react` desinstalado (confirmado: ausente do `package.json`)
- ✅ `CheckoutPagamento.jsx` removido (confirmado: arquivo não existe)
- ✅ Inicialização do Stripe movida para dentro dos handlers (lazy init)
- ✅ `buildCommand` customizado removido do `vercel.json`
- ✅ Diretórios órfãos de funções removidos
- ✅ 38 funções backend padronizadas com `@base44/sdk@0.8.31`
- ✅ Build de produção passa sem erros

### 3.2 Segurança

- ✅ Função `listPublicProviders` criada (confirmado: existe em `base44/functions/listPublicProviders/entry.ts`):
  - Filtro `verified=true` imposto no servidor
  - Resposta sanitizada: apenas nome, foto, ocupação, bio, especialidades, avaliação, cidade
  - PII removido: CPF, CNPJ, telefone, email, documentos, endereço preciso
- ✅ Meta CAPI migrada para uso exclusivamente server-side, autenticada via header secreto
- ✅ `criarPagamentoServico` refatorada: aceita apenas `{ request_id }`, valida propriedade do pedido, exige status "Confirmado" e busca o preço direto do banco

### 3.3 Consolidação de Pagamentos

- ✅ Stripe adotado como único processador (confirmado: zero referências a "Mercado Pago" no código-fonte)
- ✅ Política de comissão zero (100% para o prestador)
- ✅ Todas as referências textuais na interface atualizadas para "Stripe"

---

## 4. Validação Realizada

| Verificação | Resultado |
|-------------|-----------|
| Referências a Mercado Pago em `src/` | ✅ Zero (verificado por busca no código) |
| `@mercadopago/sdk-react` no `package.json` | ✅ Removido |
| Função `listPublicProviders` | ✅ Existe e sanitiza dados |
| `CheckoutPagamento.jsx` | ✅ Removido |
| Build de produção | ✅ Passa sem erros |
| `criarPagamentoServico` sem `STRIPE_SECRET_KEY` | ⚠️ Retorna 503 corretamente (comportamento esperado até configurar o secret) |

---

## 5. Itens Pendentes

### Bloqueantes para produção

1. **Configurar secrets no painel Base44:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `META_CAPI_INGEST_SECRET`, `AUTOMATION_WEBHOOK_SECRET`
2. **Remover secrets obsoletos:** `MP_WEBHOOK_SECRET`, `MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN`
3. **Configurar webhook do Stripe** apontando para a função `stripeWebhook`
4. **Publicar o site** após configuração dos secrets

### Não bloqueantes

5. Atualizar a página de Planos com os novos valores
6. Smoke tests em produção após publicação
7. Cadastrar prestadores reais (vitrine atualmente com placeholders)

---

## 6. Conclusão

As causas raiz das falhas de build e das vulnerabilidades foram corrigidas e verificadas no código atual. O Mercado Pago foi completamente removido, o Stripe consolidado como único processador com comissão zero, e as camadas de segurança implementadas. **O próximo passo crítico é configurar os secrets do Stripe no painel Base44**, seguido da publicação e validação em produção.