# Prestador Fundador — Documentação de Implementação

**Versão:** 2.0 | **Data:** 2026-07-25 | **Status:** Produção (aguardando deploy manual)

---

## 1. Regras Comerciais Imutáveis

| Regra | Detalhe |
|-------|---------|
| Limite absoluto | 100 concessões originais |
| Vaga revogada | NÃO libera para outro prestador |
| Cancelamento | Perde o selo definitivamente |
| Retorno | NÃO recupera o selo |
| Uma vaga por prestador | Um email jamais recebe dois grants |
| Preço | R$ 19,90/mês (não alterar automaticamente ao esgotar) |
| Trial Gratuito | 30 dias sem cartão — NÃO acumula com trial Profissional |
| Trial Profissional | 7 dias — apenas para quem NUNCA usou trial antes |

---

## 2. Arquitetura

### Entidades
- **FounderGrant** (RLS admin-only): `taken = allGrants.length` (active + revoked)
- **WebhookEvent** (RLS admin-only): idempotência de eventos MP
- **Subscription**: campos novos: `trial_consumed_at`, `trial_type`, `trial_version`

### Funções Server-Side

| Função | Responsabilidade |
|--------|------------------|
| `getFounderStats` | DTO público fail-closed — conta active + revoked |
| `mercadoPagoWebhook` | Idempotência via WebhookEvent, HMAC-SHA256, conta todos os grants |
| `cancelarAssinatura` | Ownership validada, idempotência, log [RECONCILIAR-URGENTE] em falha |
| `criarTrialPrestador` | Verifica trial_consumed_at, marca na criação, migra legados |
| `createSubscriptionCheckout` | Fail-closed: sem free_trial se trial já consumido |
| `getProviderFounderStatus` | DTO público para perfil — sem PII |

### Frontend
- **FounderBadge**: integrado em PrestadorPerfil.jsx via `getProviderFounderStatus`
- **FounderCounter**: estado inicial `unavailable: true` (nunca inventa vagas)
- **Layout.jsx**: `/PrestadorFundador` e `/AssinaturaConfirmada` no SEO + publicPages

---

## 3. Testes — 23 passando

```
npm test  # node --test test/founder-stats.contract.test.js
```

| Grupo | Testes |
|-------|--------|
| Contagem de vagas (active + revoked) | 7 |
| Regra: revogados consomem vaga | 3 |
| Prevenção de acúmulo de trial | 5 |
| Privacidade / campos públicos | 3 |
| Simulação de concorrência | 5 |

---

## 4. Alertas Operacionais

| Marcador nos logs | Significado | Ação |
|-------------------|-------------|------|
| `[RECONCILIAR-URGENTE]` | FounderGrant não revogado após cancelamento | Revogar manualmente no painel Admin |
| `pending_reconciliation` | Webhook: grant não criado após pagamento | Criar FounderGrant manualmente no Admin |
| `trial_ja_consumido` | Trial bloqueado (correto) | Ignorar |

---

## 5. Rollback de Emergência

| Componente | Rollback |
|-----------|---------|
| `getFounderStats` | Contar só ativos (aceita >100 fundadores temporariamente — risco comercial) |
| `WebhookEvent` | Limpar dados via Admin > FounderGrant se causar problemas |
| `trial_consumed_at` | Limpar campo via Admin > Subscription para usuário afetado |

---

## 6. Checklist Pós-Deploy

- [ ] Verificar no painel Base44 que `WebhookEvent` aparece como entidade
- [ ] Confirmar que `FounderGrant` sem leitura pública (testar sem auth)
- [ ] Testar `getFounderStats` via curl
- [ ] Verificar FounderBadge no perfil de um Prestador Fundador ativo
- [ ] Monitorar logs por 24h para `[RECONCILIAR-URGENTE]`
- [ ] Testar que trial não acumula com usuário de staging

---

*Gerado em 2026-07-25 pelo processo /resolveimediato.*
