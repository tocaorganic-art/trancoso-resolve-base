# Relatório final da auditoria, 12/11/2026

Repositório `tocaorganic-art/trancoso-resolve-base`, branch `main`. Todos os merges em squash, branches apagadas. Publish é do Tony.

## Números finais

| Frente | Antes | Depois |
|---|---|---|
| Acessibilidade (axe, 11 rotas, desktop e mobile) | 55 violações graves | 0 |
| Contraste isolado | 20 | 0 |
| LCP da página de serviço (Lighthouse mobile, simulado) | 6,7 s | 4,8 s |
| Peso da página de serviço | 0,87 MB | 0,48 MB |
| Score de performance da página de serviço | 70 | 77 |
| Palavras por página (média, 53 rotas) | 483 | 544 |
| Rotas abaixo de 300 palavras | 8 | 0 |
| Vulnerabilidades de dependências em produção (`npm audit --omit=dev`) | 3 | 0 |
| Testes automatizados | 59 | 61 |

## PRs desta rodada (12/11)
| PR | O que fez |
|---|---|
| #182 | Nomes acessíveis, rótulos e foco: link de política, selects, sliders, banner rotativo, área rolável |
| #183 | SEO da `/ajuda`: `useSEO`, schema `FAQPage` com 19 perguntas, entrada no sitemap |
| #185 | `verificarVencimentos` e `notificarAntecedentesAprovados` passam a aceitar o admin do Base44; removido workflow órfão que chamava função inexistente |
| #176 | framer-motion 14, rebaseado na main e verificado no navegador |
| #187 | Cor de marca para o terracota #C1440E (decisão do Tony): branco sobre a cor passa de 3,6:1 para 5,1:1 |
| #188 | Zera as violações de contraste: botões, selos, links, placeholders, chips de gráfico, tour de onboarding |
| #189 | Performance: `gtag.js` fora do caminho crítico e Nunito em WOFF2 com subconjunto latino |
| #190 | Conteúdo nas rotas finas e `/CadastroTipo` fora do sitemap |

## Como o contraste foi resolvido
A maior parte vinha do branco sobre o laranja #E8571A. Com o terracota do Brand Kit (#C1440E) o par passa. O resto era caso a caso: laranja 600 sobre fundo escuro virou 400, laranja 600 sobre branco virou 700, cinzas de apoio subiram um degrau, placeholders de select em cartão claro ganharam regra própria fora do `@layer`, e hex fixos (`#F26A21`, `#A0785A`, `#888`, `#999`) foram trocados por tokens.

## Como a performance foi resolvida
1. `gtag.js` (193 KB) saiu do caminho crítico. O `dataLayer` e o Consent Mode continuam na mesma posição; o arquivo do Google baixa 1,2 s depois do `load` ou na primeira interação.
2. Nunito variável em TTF (275 KB) virou WOFF2 com subconjunto latino (43,5 KB), com `preload` e o TTF como alternativa.

O alvo do projeto é LCP abaixo de 2,5 s no 4G. Ainda não chegamos lá: falta medir em produção e atacar o JavaScript não usado, que o Lighthouse aponta como 1,2 s de economia possível.

## O que ficou registrado como próximo
1. Remedir Lighthouse em produção depois do Publish e confirmar se o LCP caiu de 6,7 s.
2. Reduzir JavaScript não usado. O Lighthouse estima 1,2 s. O candidato natural é dividir os componentes do painel administrativo, que hoje entram no pacote principal.
3. Rotas entre 270 e 296 palavras (`/porto-seguro`, `/ajuda`, `/caraiva`, `/arraial-dajuda`, `/Contact`, `/participar`, `/trancoso`). Já estão perto do alvo e nenhuma está abaixo de 270.

## Bloqueios que dependem do Tony
- **Escopo `workflow` no GitHub**: sem ele não entram a revisão automática do Claude nos PRs nem os PRs #168 e #170 do Dependabot, que alteram arquivos de `.github/workflows`.
- **framer-motion 14** já foi mergeado e verificado. As animações devem ser conferidas visualmente pelo Tony em produção.

## Riscos para conferir depois do Publish
- Histórico do workflow "Verificar Vencimentos": não deve mais aparecer 401.
- `revisaoDiariaPrestadores` pode ser chamada com `{ "dry_run": true }` para conferir a saída sem efeito.
- Chargeback de teste no sandbox do Asaas para ver o e-mail de alerta chegar. Teste de pagamento real continua com supervisão humana.
