# Bug — Tarefas em segundo plano travadas consumindo tokens

> Registro criado em **2026-06-14** para envio ao suporte da Anthropic e pedido
> de estorno de tokens. Guardado no repositório para não se perder ao limpar a
> sessão (o ambiente de execução é temporário).

## Resumo

Quatro agentes em segundo plano (`Migrate ... pages to brand`) ficaram presos em
estado **"Em execução" por ~122 horas cada**, sem nunca concluir, acumulando uso
contínuo de tokens e de ferramentas. Não respeitaram nenhum timeout e não
entregaram resultado.

## Tarefas afetadas

| # | Tarefa | Tempo | Tokens | Usos de ferramenta |
|---|--------|-------|--------|--------------------|
| 1 | Migrate auth/landing pages to brand    | 122h17min | 130.4k | 123 |
| 2 | Migrate account/service pages to brand | 122h16min | 143.3k | 133 |
| 3 | Migrate legal/misc pages to brand      | 122h16min | 124.8k | 156 |
| 4 | Migrate admin/dashboard pages to brand | 122h16min | 127.4k | 134 |

**Total aproximado: ~525.9k tokens consumidos sem entrega.**

## Comportamento esperado

Agentes em segundo plano deveriam concluir ou expirar por timeout em tempo
razoável — não permanecer ativos por mais de 5 dias gastando tokens.

## Comportamento observado

As 4 tarefas permaneceram "Em execução" indefinidamente (~122h), sem progresso
visível e sem encerramento automático, gerando consumo contínuo de tokens.

## Impacto

- Consumo de ~525k tokens sem resultado útil.
- Impossível interromper de forma limpa pela interface (vale confirmar se o botão
  de parar ⏹ do painel funciona — se não funcionar, reforça o pedido de estorno).

## Como encerrar as tarefas (passo a passo)

1. **Pelo painel "Tarefas em segundo plano":** clique no botão de parar (⏹, o
   quadradinho) à direita de cada uma das 4 tarefas.
2. **Se o ⏹ não responder:** abra "Ver transcrição" de cada tarefa e encerre/feche
   a sessão por lá.
3. **Se nenhuma das duas funcionar:** o travamento impede o encerramento manual —
   o suporte da Anthropic precisa matá-las no backend. Acrescente ao chamado:
   *"As tarefas não puderam ser encerradas nem pelo botão de parar do painel."*

## Relatório para o suporte (copiar e enviar)

```
Assunto: Tarefas em segundo plano travadas por ~122h consumindo tokens (Claude Code na web)

Resumo:
Quatro agentes em segundo plano ("Migrate ... pages to brand") ficaram presos
em estado "Em execução" por aproximadamente 122 horas cada, sem nunca concluir,
acumulando uso contínuo de tokens e de ferramentas. Eles não respeitaram nenhum
timeout e não entregaram resultado.

Tarefas afetadas (tempo / tokens / usos de ferramenta):
1. Migrate auth/landing pages to brand    — 122h17min — 130.4k tokens — 123 usos
2. Migrate account/service pages to brand — 122h16min — 143.3k tokens — 133 usos
3. Migrate legal/misc pages to brand      — 122h16min — 124.8k tokens — 156 usos
4. Migrate admin/dashboard pages to brand — 122h16min — 127.4k tokens — 134 usos

Total aproximado: ~525.9k tokens consumidos sem entrega.

Comportamento esperado:
Agentes em segundo plano deveriam concluir ou expirar por timeout em tempo
razoável, e não permanecer ativos por mais de 5 dias gastando tokens.

Comportamento observado:
As 4 tarefas permaneceram "Em execução" indefinidamente (~122h), sem progresso
visível e sem encerramento automático, gerando consumo contínuo de tokens.

Impacto:
Consumo de ~525k tokens sem resultado útil; impossível interromper de forma
limpa pela interface.

Pedido:
1. Encerramento forçado das 4 tarefas travadas.
2. Estorno dos tokens consumidos por essas execuções travadas.

Ambiente:
- Produto: Claude Code na web (claude.ai/code)
- Repositório: tocaorganic-art/trancoso-resolve
- Conta: tocaorganic@gmail.com
```

## Onde abrir o chamado

- Suporte da Anthropic: https://support.anthropic.com
- Inclua, se possível, o print do painel "Tarefas em segundo plano" como anexo.
