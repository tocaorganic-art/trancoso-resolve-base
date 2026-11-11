# Grafo do trancoso-resolve-base

Gerado em 11/11/2026 pela varredura estática do repositório oficial, com a main em `d73b18db4`.
Arquivos: `graph.html` (interativo, abre no navegador sem servidor), `graph.json` (dados brutos) e este relatório.

## Números verificados

| Tipo de nó | Quantidade |
|---|---|
| Entidades (`base44/entities/*.jsonc`) | 53 |
| Funções com `entry.ts` | 68 |
| Páginas (`src/pages/*.jsx`) | 61 |
| Componentes (`src/components/**`) | 194 |
| Arquivos do shell do app (`App.jsx`, layouts, contexts, hooks) | 42 |
| Testes (`tests/*.test.js`) | 8 |
| Docs | 18 |
| **Total de nós** | **445** |
| **Conexões** | **660** |

## Como o grafo foi construído

Arestas saem de imports reais, não de suposição:

- `importa`: componente, página ou shell importando outro arquivo, por alias `@/components`, caminho relativo `./` e `../`, e `import()` dinâmico.
- `chama`: `base44.functions.invoke('nome')` em páginas, componentes e shell.
- `usa entidade`: `base44.entities.Nome.*` em páginas, componentes e funções.
- `chama funcao`: uma função de backend invocando outra.
- `testa`: teste importando o módulo alvo.

## Hubs (o que mais recebe conexão)

| Nó | Conexões de entrada |
|---|---|
| `button` | 52 |
| `card` | 37 |
| `ServiceProvider` (entidade) | 36 |
| `ServiceRequest` (entidade) | 17 |
| `Subscription` (entidade) | 16 |
| `input` | 16 |

`ServiceProvider` ser o terceiro hub do projeto confirma o que a auditoria sempre disse: é a entidade com maior superfície de risco, então qualquer mudança de RLS ou de campos ali tem alcance grande.

## Componentes sem nenhum import (27)

Lista de candidatos a código morto, com uma ressalva importante: import por caminho montado em tempo de execução não é detectado por varredura estática. Antes de apagar qualquer um, confirmar com busca manual.

MfaMethodSetup, AutomacaoLeadsTab, CalendarioEditorialTab, ConteudosPrioritarios, MetricasTab, VisaoGeralTab, TrIAChatArea, TrIAMessageBubble, TrIASidebar, TrIAStreamingMessage, WhatsAppConnectButton, UserJourneyViz, PageViewTracker.test, investors.test, LeadPrestadorForm.test, entre outros.

Os arquivos `.test.jsx` dentro de `src/components` aparecem porque são coletados pelo vitest, não por import.

## Funções maiores

| Função | Linhas |
|---|---|
| `mercadoPagoWebhook` | 730 |
| `asaasWebhook` | 604 |
| `createSubscriptionCheckout` | 569 |
| `analisarDocumento` | 402 |
| `verificarAntecedentes` | 307 |

Sinalização, sem alteração: `mercadoPagoWebhook` continua na árvore com 730 linhas, o maior arquivo de função do projeto, mesmo com Asaas sendo o gateway oficial. Pela regra vigente, código de Mercado Pago não é editado nem removido sem ordem explícita do Tony.

## Integridade de referências

Nenhuma função referencia entidade inexistente. As 68 funções apontam apenas para schemas que existem em `base44/entities`.

## Como abrir

Baixe `graph.html` e abra com dois cliques, ou no PowerShell:

```powershell
start "caminho\graph.html"
```

No grafo: clique num nó para ver o que ele importa e o que importa ele; use a busca para centralizar um nó; arraste para mover o mapa e use a roda do mouse para zoom. Os filtros no topo ligam e desligam cada tipo.

## Sobre o grafo anterior

O relatório que o Claude Code entregou antes deste citava a main em `c24d7251`, que está várias rodadas atrás de `d73b18db4`, e mencionava uma busca por "Community N" com 97 ocorrências. Essa expressão não existe neste repositório: a contagem aqui é zero. A execução também mostrava zero chamadas de ferramenta e contexto a 158% do limite, o que indica análise feita sem leitura real dos arquivos. Por isso este grafo foi refeito a partir do clone da main.
