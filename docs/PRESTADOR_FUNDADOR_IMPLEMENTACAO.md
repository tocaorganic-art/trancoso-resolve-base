# Prestador Fundador — Documentação de Implementação

**Versão:** 2.0  
**Data:** 2026-07-25  
**Status:** Produção (aguardando deploy manual)

---

## 1. Regras Comerciais Imutáveis

| Regra | Detalhe |
|-------|---------|
| Limite absoluto | 100 concessões originais |
| Vaga revogada | NÃO libera para outro prestador |
| Cancelamento | Perde o selo definitivamente |
| Retorno | Não recupera o selo |
| Uma vaga por prestador | Um email jamais recebe dois grants |
| Preço | R$ 19,90/mês (não alterar automaticamente) |
| Trial Gratuito | 30 dias sem cartão — não acumula com trial Profissional |
| Trial Profissional | 7 dias — apenas para quem nunca usou trial |

---

## 2. Arquitetura

### Entidades
- **FounderGrant**: RLS admin-only. `taken = allGrants.length` (active + revoked).
- **WebhookEvent**: Idempotência de eventos MP. RLS admin-only.
- **Subscription**: Adicionados `trial_consumed_at`, `trial_type`, `trial_version`.

### Funções Server-Side
- **getFounderStats**: DTO público fail-closed. Conta active + revoked.
- **mercadoPagoWebhook**: Idempotência via WebhookEvent, HMAC-SHA256, sem contar só ativos.
- **cancelarAssinatura**: Ownership validada, idempotência, log [RECONCILIAR-URGENTE] em falha.
- **criarTrialPrestador**: Verifica trial_consumed_at, marca na criação, migra legados.
- **createSubscriptionCheckout**: Fail-closed: sem trial se trial_consumed_at existir.
- **getProviderFounderStatus**: DTO público para o perfil (sem PII).

### Frontend
- **FounderBadge**: Integrado em PrestadorPerfil.jsx via getProviderFounderStatus.
- **FounderCounter**: Estado inicial unavailable: true (nunca inventa vagas).
- **Layout.jsx**: /PrestadorFundador e /AssinaturaConfirmada no SEO e publicPages.

---

## 3. Testes

**23 testes passando** em `test/founder-stats.contract.test.js`:
- Contagem (7): active + revoked contam para taken
- Regra de revogação (3): vagas revogadas não liberam
- Trial (5): prevenção de acúmulo free_30d + profissional_7d
- Privacidade (3): sem campos PII no DTO público
- Concorrência (5): idempotência e bloqueio ao esgotar

---

## 4. Alertas Operacionais

| Marcador | Significado | Ação |
|----------|-------------|------|
| `[RECONCILIAR-URGENTE]` | FounderGrant não revogado após cancelamento | Revogar manualmente no painel |
| `pending_reconciliation` | Webhook: grant não criado | Criar FounderGrant manualmente |

---

## 5. Rollback

- **getFounderStats**: Em emergência, contar só ativos aceita >100 fundadores temporariamente.
- **WebhookEvent**: Limpar dados via admin se causar problemas.
- **trial_consumed_at**: Limpar campo via admin para usuário específico afetado.

---

*Gerado em 2026-07-25.*
