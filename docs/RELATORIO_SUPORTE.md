# Relatório para Suporte Base44 — Trancoso Resolve

## App
**Trancoso Resolve** — plataforma de conexão entre clientes e prestadores de serviços verificados em Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva (BA).

---

## Resumo das atividades realizadas

### 1. Agente "Recomendador" (IA)
- **Arquivo criado:** `base44/agents/recomendador.jsonc`
- **Objetivo:** sugerir o prestador de serviço mais adequado ao usuário, com base no histórico pessoal dele (pedidos anteriores, favoritos e avaliações).
- **Permissões aprovadas (somente leitura):**
  - `ServiceRequest` — histórico de pedidos do usuário
  - `Favorite` — favoritos do usuário
  - `ServiceReview` — avaliações dadas pelo usuário
  - `ServiceProvider` — prestadores verificados disponíveis
  - `ServiceListing` — detalhes dos serviços
- **Memória ativada** (escopo: ambos) para refinar recomendações ao longo da conversa.
- **Comportamento:** prioriza prestadores com `verified=true` e `availability='Disponível'`; nunca inventa dados; justifica o match com o histórico; respeita o RLS.

### 2. Página de conversa do Recomendador
- **Componente:** `src/components/recomendador/RecomendadorChat.jsx`
- **Página:** `src/pages/Recomendador.jsx`
- **Rota:** `/Recomendador` (registrada em `src/App.jsx`, protegida por `ProtectedRoute`).
- **Verificado na prévia:** a página carrega, envia mensagem, o agente invoca as ferramentas de leitura do histórico e responde no chat.

### 3. Botão de WhatsApp para a agente Toca
- **Componente:** `src/components/assistente/WhatsAppConnectButton.jsx`
- **Integrado em:** `src/pages/Assistentevirtual.jsx` (via `TocaTrIAPremium`).

---

## Estado atual do código

| Item | Status |
|------|--------|
| Compilação do frontend | ✅ Sem erros (verificado em prévia e build local) |
| Funções de backend | ✅ Compilam sem erros TypeScript |
| Correções TS aplicadas | `mercadoPagoWebhook`, `searchServicesMultilingual`, `verificarDocumento` (anotação `any` em retornos dinâmicos do InvokeLLM) |
| Páginas verificadas | 97 |
| Componentes verificados | 243 |

---

## Problema persistente — Publicação falha ("Build failed")

### Sintoma
Ao tentar publicar pelo painel da Base44, o build falha **sem mensagem de erro detalhada**.

### Investigações e correções já tentadas (sem sucesso na publicação)
- ❌ Removidas dependências de teste pesadas (Playwright, Jest, Testing Library).
- ❌ Removida pasta órfã `base44/functions/sentry-init` (diretório vazio).
- ❌ Removido Service Worker com cache PWA persistente (`trancoso-resolve-v1`) que causava falhas de chunk após deploy.
- ❌ Revertidas configurações experimentais no `vite.config.js` (`manualChunks`, `logLevel: info`).
- ❌ Removido import `ArrowRight` não utilizado em `HeroBanner.jsx`.
- ❌ Corrigidas chaves duplicadas no objeto `pageTitles` em `Layout.jsx`.

### Conclusão
Nenhuma dessas alterações resolveu a falha de publicação. O código **compila normalmente** no preview e em build local, o que indica que **a causa raiz não está no código do app**.

### Suspeita
Problema de infraestrutura no pipeline de publicação da Base44 (build server, resolução de dependências, limite de tempo/memória no deploy, ou cache corrompido do serviço de publicação).

---

## Secrets configurados (no painel Base44)
- `MP_WEBHOOK_SECRET`
- `MP_PUBLIC_KEY`
- `MP_ACCESS_TOKEN`
- `claude-full`
- `claude-trancosoresolve`
- `META_CONVERSIONS_API_TOKEN`
- `INFOSIMPLES_API_KEY`
- `APY_KEY_MANUS`
- `OPENAI_API_KEY`

---

## Pedido ao suporte
Solicito verificação dos **logs do pipeline de publicação** (build/deploy server) deste app, pois o código compila sem erros no preview e em build local, mas a publicação falha sem retorno de erro utilizável. Em especial:
1. Logs completos do último build de publicação.
2. Verificação de limites de memória/tempo do build server.
3. Possível cache corrompido do serviço de deploy.
4. Status do worker de publicação para este app.

---

_Relatório gerado em 23/07/2026._