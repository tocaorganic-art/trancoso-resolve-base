# Auditoria de Imagens para SEO — Parte A2

> Branch: `seo/auditoria-organica-nacional` · Site auditado: `https://www.trancosoresolve.com.br`
> Metodologia: ver seção "Nota metodológica" — é essencial ler antes das tabelas abaixo.

---

## ⚠️ Achado crítico (prioridade acima de qualquer otimização individual de imagem)

**O HTML entregue pelo servidor (e também o `dist/` local já buildado) não contém NENHUMA tag `<img>` em NENHUMA rota testada.**

Confirmado via `curl` bruto (sem JS) nas rotas `/`, `/trancoso`, `/arraial-dajuda`, `/porto-seguro`, `/caraiva` em produção, e também nos arquivos `dist/index.html` e `dist/trancoso.html` gerados localmente pelo build already feito:

```
grep -o '<img[^>]*>' *.html | wc -l   →  0   (em todas as páginas, produção e dist local)
grep -o '<picture'    *.html | wc -l  →  0
```

Causa raiz, confirmada no código:

1. `scripts/prerender-head.js` só pré-renderiza as tags de `<head>` (title, meta, JSON-LD) **e** injeta uma lista estática de links de navegação em `<main>` para garantir rastreabilidade de links — mas **não** executa/serializa a árvore real de componentes React. Ou seja, não existe prerender de conteúdo visual, só de metadados.
2. Todas as imagens reais (banners, cards de prestador, fotos de serviço) são montadas **100% no client-side**, depois da hidratação do React.
3. Pior: o componente `src/components/ui/LazyImage.jsx` (usado nos cards de serviço e prestador) só insere a tag `<img>` no DOM quando um `IntersectionObserver` detecta que o elemento entrou na viewport (margem de 300px), a menos que `priority={true}`. Ou seja, mesmo depois do JS rodar, imagens abaixo da dobra **não existem no DOM** até que haja rolagem/intersecção real.

**Impacto prático:** qualquer ferramenta ou bot que não execute JavaScript (a maioria dos validadores de SEO, unfurlers de redes sociais, crawlers mais simples) não vê nenhuma imagem do site. Mesmo o Googlebot, que executa JS, pode não "ver" imagens abaixo da dobra se seu renderizador não simular rolagem — isso é um risco documentado e conhecido de lazy-load via `IntersectionObserver` sem fallback SSR/prerender. Isso significa que **a indexação no Google Imagens de qualquer foto do site depende inteiramente do comportamento de rastreamento do WRS (Web Rendering Service) do Google**, não do HTML entregue.

Isso é uma questão estrutural, não uma imagem específica — está fora do escopo desta tarefa corrigir (nenhum arquivo foi alterado), mas deveria ser a primeira prioridade de qualquer trabalho de SEO técnico subsequente, acima de qualquer otimização de peso/alt individual.

---

## Nota metodológica (leia antes das tabelas)

Como o HTML ao vivo não contém imagens (achado acima), a extração "WebFetch no HTML ao vivo → contar `<img>`" pedida originalmente **não é possível** — não há `<img>` para contar. Por isso a auditoria abaixo foi feita assim:

1. Localizado, por leitura de código-fonte (`src/pages/**`, `src/components/**`), qual componente React renderiza cada rota e quais imagens ele referencia (URLs estáticas ou dinâmicas).
2. Medido o **peso real** de cada URL de imagem via `curl -sL -o /dev/null -w "%{size_download}"` (download completo, não HEAD — HEAD se mostrou pouco confiável nos proxies de imagem do base44/Cloudflare, retornando 404 falsos em alguns casos enquanto o GET funcionava normalmente).
3. Onde não foi possível medir (ex.: imagens dependentes de dados dinâmicos de um prestador específico no banco, não hardcoded no código), isso é dito explicitamente — nenhum número foi inventado.

Essa abordagem é mais confiável que inspecionar o HTML ao vivo aqui, porque reflete o que **realmente** é carregado, só que via leitura de código + rede, não via DOM renderizado.

---

## Tabela por página

| Rota | Imagens encontradas no código | Alt genérico/fallback | Sem alt | >200KB | Sem `loading="lazy"` fora do LCP | Elemento LCP provável e peso |
|---|---|---|---|---|---|---|
| `/` (Home) | Carrossel `BannerRotativo` (3 slides, PNG+WebP) + cards de serviço/prestador via `LazyImage` (dinâmico) | 0 | 0 | **3** (os 3 PNG fallback do carrossel) | 0 (slide 0 é `eager`/`fetchPriority=high` corretamente) | Slide 1 do carrossel — PNG fallback **1069 KB** / WebP real **79 KB** |
| `/trancoso` | 1 background CSS decorativo (`aria-hidden`) + cards de prestador dinâmicos | 0 | 0 (correto — decorativa, não precisa de alt) | 0 | n/a (CSS, não lazy-able) | Background Unsplash `w=1080&q=60` — **118 KB** |
| `/arraial-dajuda` | 1 background CSS decorativo + cards de prestador dinâmicos | 0 | 0 | **1** | n/a | Background Unsplash `w=1600&q=80` — **217 KB** (configurado mais pesado que os irmãos sem motivo aparente) |
| `/porto-seguro` | 1 background CSS decorativo + cards de prestador dinâmicos | 0 | 0 | **1** | n/a | Background Unsplash `w=1080&q=60` — **439 KB** (foto de alta entropia; maior peso do lote mesmo com os mesmos parâmetros dos irmãos) |
| `/caraiva` | 1 background CSS decorativo + cards de prestador dinâmicos | 0 | 0 | **1** | n/a | Background Unsplash `w=1080&q=60` — **211 KB** |
| `/ServicosCategoria` | 0 imagens de herói; só cards de prestador dinâmicos via `ProviderGrid`/`ProviderCard` | 0 | 0 | não medível (depende do prestador) | — | Nenhum elemento de imagem fixo; LCP provável é texto/filtro |
| `/servicos/eletricista-trancoso` | **0 imagens** (página 100% texto + ícones Lucide) | — | — | — | — | Sem imagem de conteúdo nesta página |
| `/servicos/diarista-trancoso` | **0 imagens** (mesmo componente `ServicoLocalPage.jsx`) | — | — | — | — | Sem imagem de conteúdo nesta página |
| `/About` | **0 imagens** (só padrão CSS decorativo de grade) | — | — | — | — | — |
| `/ServicoLanding` | 1 hero dinâmico por categoria (`?service=`) — 5 variantes em WebP (base44), 4 variantes fallback Unsplash JPEG + lista `ProviderMiniCard` dinâmica | 0 | 0 | **1 medida** (146 KB, variante Unsplash) — demais variantes WebP entre 95–132 KB, abaixo do limite | 0 | Hero da categoria — ex. 132 KB (WebP) |
| `/Planos` | **0 imagens** | — | — | — | — | — |
| `/investidores` | **0 imagens** (`ogImage: undefined` — nem para compartilhamento social há imagem configurada) | — | — | — | — | — |
| `/ComoFunciona` | **0 imagens** (só padrão CSS decorativo) | — | — | — | — | — |
| `/destinos/casamento-trancoso` | **0 imagens** | — | — | — | — | — |
| `/destinos/reveillon-trancoso` | **0 imagens** | — | — | — | — | — |
| `/guides/morar-em-trancoso` | **0 imagens** | — | — | — | — | — |

**Totais:** 16 páginas auditadas. Imagens estáticas localizadas e medidas: 9 (carrossel Home) + 4 (backgrounds de destino) + 2 (amostra ServicoLanding) = **15 medidas diretamente**, mais um número indeterminado de imagens dinâmicas por prestador (não hardcoded, dependem do banco de dados). **0 com alt genérico/fallback** e **0 sem alt** entre as imagens que de fato renderizam (ver seção sobre o fallback genérico abaixo). **6 imagens acima de 200KB** identificadas e confirmadas por medição real.

---

## Lista detalhada de imagens problemáticas (peso real medido)

| # | Peso | Formato | URL / origem | Problema | Usada em |
|---|---|---|---|---|---|
| 1 | **1.382.920 bytes (1351 KB)** | PNG | `.../11af5df4d_banner_v8_3_desk.png` | Fallback PNG do slide 3 do carrossel da Home; WebP irmão (`edca8f68d_banner_v8_3_desk.webp`) pesa só 119.694 bytes — 11,5x menor | `src/components/BannerRotativo.jsx`, slide "clientes" |
| 2 | **1.214.409 bytes (1186 KB)** | PNG | `.../18b1c0145_banner_v8_2_desk.png` | Fallback PNG do slide 2; WebP irmão pesa 95.986 bytes | `src/components/BannerRotativo.jsx`, slide "empresas" |
| 3 | **1.094.647 bytes (1069 KB)** | PNG | `.../501480410_banner_v8_1_desk.png` | Fallback PNG do **slide 1 (o primeiro, candidato a LCP)**; WebP irmão pesa 78.870 bytes | `src/components/BannerRotativo.jsx`, slide "prestadores" |
| 4 | **449.843 bytes (439 KB)** | JPEG | `images.unsplash.com/photo-1504893524553-...?w=1080&q=60` | Background decorativo com opacidade 20% atrás do texto — mesmo parâmetros (`w=1080&q=60`) dos irmãos de Trancoso/Caraíva, mas a foto em si é muito mais pesada (alta entropia visual) | `src/pages/destinos/PortoSeguro.jsx` (`HERO_IMAGE`) |
| 5 | **217.817 bytes (213 KB)** | JPEG | `images.unsplash.com/photo-1507525428034-...?w=1600&q=80` | Mesma função decorativa que os outros 3 destinos, mas configurado com `w=1600&q=80` em vez de `w=1080&q=60` — inconsistência sem motivo aparente, peso desnecessário | `src/pages/destinos/ArraialDajuda.jsx` (`HERO_IMAGE`) |
| 6 | **211.561 bytes (207 KB)** | JPEG | `images.unsplash.com/photo-1441974231531-...?w=1080&q=60` | Acima de 200KB, mesmo papel decorativo | `src/pages/destinos/Caraiva.jsx` (`HERO_IMAGE`) |

Imagens medidas que ficaram **dentro** do limite (para referência, não precisam de ação):
- WebP do carrossel (3 desktop + 2 mobile): 78.870 a 119.694 bytes — todas ok.
- Trancoso `HERO_IMAGE` (118.369 bytes) — ok.
- ServicoLanding heroImages WebP (base44): 101.640 e 132.290 bytes — ok.
- ServicoLanding heroImage Unsplash (amostra): 146.113 bytes — ok, mas sem margem.
- `mockProviderImages` (fallback de foto de prestador): 20.414–38.729 bytes — ok.

**Não foi possível medir:** fotos reais de prestadores (`provider.photo_url`, `provider.cover_photo_url`) porque são dados dinâmicos do banco (base44), não URLs fixas no código-fonte. O PNG de 2.507KB relatado em auditoria anterior em `/ServicoLanding` **não foi encontrado em nenhuma URL hardcoded no código atual** — ou já foi substituído, ou era uma foto de prestador específica (dado dinâmico), não reproduzível por leitura estática de código. Recomenda-se confirmar diretamente no banco/CDN do base44 se esse arquivo específico ainda existe.

---

## Top 10 imagens para otimizar primeiro (por impacto: peso × visibilidade)

1. **Slide 1 do carrossel da Home — PNG fallback 1069 KB** (`BannerRotativo.jsx`). É o candidato a LCP da página mais visitada do site, com `fetchPriority="high"`. Mesmo que o `<picture><source webp>` cubra a maioria dos navegadores, qualquer client sem suporte a WebP baixa >1MB na primeira dobra.
2. **Slide 3 do carrossel — PNG 1351 KB** — mesmo problema, segunda posição do carrossel (ainda visível rapidamente, troca a cada 6s).
3. **Slide 2 do carrossel — PNG 1186 KB** — mesmo problema.
4. **Background de `/porto-seguro` — 439 KB** — maior imagem decorativa do site, numa página de alto valor de SEO local (uma das 4 páginas de destino).
5. **Background de `/arraial-dajuda` — 213 KB**, configurado com dimensão desnecessariamente maior (`w=1600` vs `w=1080` dos irmãos) para o mesmo uso.
6. **Background de `/caraiva` — 207 KB**.
7. **ServicoLanding — variantes Unsplash do hero (4 categorias)** — medimos 146 KB numa amostra; vale conferir as outras 3 variantes Unsplash (`photo-1562259949-...`, `photo-1587654780291-...`, `photo-1414235077428-...`) que não foram medidas individualmente nesta rodada.
8. **`getWebPUrl()` desativado globalmente** (`src/utils/images.js`) — isso significa que **todo** o `<picture><source webp>` do `LazyImage` nunca ativa (sempre retorna `null`/`hasWebp:false`). Qualquer imagem carregada via `LazyImage` depende 100% do formato original da URL e da negociação de conteúdo própria do Unsplash — não há conversão/otimização de formato feita pela aplicação. Corrigir isso teria efeito multiplicado em todos os cards de serviço/prestador do site.
9. **`categoryImageMap` em `Home.jsx`** — fallback genérico de categoria usa URLs Unsplash sem `&auto=format`, então não se beneficiam nem da negociação automática de formato do Unsplash que as outras URLs do projeto já usam.
10. **Páginas 100% sem imagem** (`/servicos/eletricista-trancoso`, `/servicos/diarista-trancoso`, `/About`, `/Planos`, `/investidores`, `/ComoFunciona`, `/destinos/casamento-trancoso`, `/destinos/reveillon-trancoso`, `/guides/morar-em-trancoso`) — não é peso a reduzir, é oportunidade perdida: são páginas de alto intento de busca local sem nenhuma chance de tráfego via Google Imagens.

---

## Correção do achado prévio sobre "alt genérico"

O briefing desta tarefa partiu da premissa de que o commit `914db2c6` adicionou um alt padrão `"Imagem Trancoso Resolve"` como fallback amplamente usado. Essa string existe, mas **só em um único arquivo: `src/components/common/OptimizedImage.jsx`**. Ao rastrear os imports, confirmei que:

- `OptimizedImage.jsx` **não é importado por nenhuma página ou componente ativo** — é código morto.
- `src/lib/imageOptimization.js` (utilitário relacionado) também não é importado em lugar nenhum.
- Os componentes de imagem **realmente usados** em produção (`LazyImage`, `ProviderCard`, o `ServiceCard` inline de `Home.jsx`, `BannerRotativo`) **sempre** constroem `alt` dinâmico e descritivo a partir dos dados da entidade (nome do prestador, ocupação, título do serviço, categoria).

**Conclusão: 0 imagens no caminho de renderização ativo dependem do fallback genérico.** O número "quantas imagens dependem do fallback" pedido no briefing é, na prática, zero — mas isso só pôde ser confirmado rastreando os imports, não apenas buscando a string.

### Outro código morto encontrado (relevante para confiabilidade de qualquer auditoria estática futura)

Durante o rastreamento de imports também ficou confirmado que estes arquivos **não são usados em nenhuma rota**:
- `src/components/home/HeroBanner.jsx` (3 imagens Unsplash 1600px)
- `src/components/PromotionalBanner.jsx` (4 imagens Unsplash 1200px, componente usa `LazyImage` corretamente)
- `src/components/home/ServiceCard.jsx`
- `src/components/services/ServiceCard.jsx`
- `src/components/common/OptimizedImage.jsx` + `src/lib/imageOptimization.js`

Isso é relevante porque o achado anterior de "imagem Unsplash de 421KB carregada globalmente em várias páginas" provavelmente vinha de um destes componentes (`HeroBanner`/`PromotionalBanner`, que usam imagens Unsplash em `w=1600`/`w=1200`) — e hoje eles não rodam em nenhuma página. Ou seja, esse problema específico parece ter sido neutralizado (os componentes saíram do fluxo de renderização), mas **não há confirmação de que isso foi uma correção deliberada** — pode ter sido um efeito colateral de refatoração. Nenhuma alteração foi feita; isso é só um apontamento, não uma correção.

---

## Recomendações de correção no código (para fase de implementação, fora do escopo desta auditoria)

| Arquivo | O que ajustar |
|---|---|
| `src/components/BannerRotativo.jsx` (linhas 131–138, 159–165) | Recomprimir os 3 PNGs de fallback (`501480410_*`, `18b1c0145_*`, `11af5df4d_*`) para algo próximo dos WebP irmãos (~80–120KB), ou remover o `<img src>` PNG e usar só WebP com fallback JPEG mais leve. |
| `src/pages/destinos/PortoSeguro.jsx` (linha 11) | Trocar a foto Unsplash atual (alta entropia, 439KB mesmo em `w=1080&q=60`) por outra mais leve, ou reduzir `q=60` para `q=40–45` já que é um background com 20% de opacidade — qualidade visual perdida é imperceptível. |
| `src/pages/destinos/ArraialDajuda.jsx` (linha 11) | Alinhar `w=1600&q=80` para `w=1080&q=60`, igual aos 3 irmãos (`Trancoso.jsx`, `PortoSeguro.jsx`, `Caraiva.jsx`), já que cumprem a mesma função decorativa. |
| `src/utils/images.js` (`getWebPUrl`, linhas 1–8) | Função desativada propositalmente por causar 404/403. Reavaliar usando um domínio de imagem que realmente sirva variantes WebP (ex.: parâmetro `&fm=webp` do próprio Unsplash, que é suportado, em vez de troca ingênua de extensão) para reativar a otimização de formato no `LazyImage` sem quebrar nada. |
| `src/pages/Home.jsx` (`categoryImageMap`, linhas 47+) | Adicionar `&auto=format` (ou `&fm=webp`) às URLs Unsplash do mapa de fallback por categoria, para alinhar com o padrão já usado em `HERO_IMAGE` das páginas de destino. |
| `src/components/servicos/ServicoLocalPage.jsx` | Página 100% texto/ícone — avaliar (decisão de produto, não técnica) se vale adicionar 1 foto real de prestador/categoria para abrir oportunidade de Google Imagens nessas páginas de alto intento local. |
| `scripts/prerender-head.js` | Fora do escopo de "imagens", mas é o causador raiz do achado crítico: só pré-renderiza `<head>` + lista de links, não a árvore de componentes. Qualquer ganho de SEO de imagem individual fica limitado por isso. |
| `src/components/ui/LazyImage.jsx` (linha 26–40) | O gate via `IntersectionObserver` sem fallback SSR significa que imagens abaixo da dobra podem nunca entrar no DOM para crawlers que não rolam a página. Considerar aumentar `rootMargin` bem além de 300px para páginas curtas, ou — melhor — resolver via prerender real em vez de ajustar o lazy-load. |

Arquivos de código morto identificados para possível limpeza futura (não removidos, fora do escopo): `src/components/home/HeroBanner.jsx`, `src/components/PromotionalBanner.jsx`, `src/components/home/ServiceCard.jsx`, `src/components/services/ServiceCard.jsx`, `src/components/common/OptimizedImage.jsx`, `src/lib/imageOptimization.js`.

---

**Nenhum arquivo de código foi alterado nesta auditoria** — apenas leitura, busca e medição de rede. Fora de escopo (não mencionado como alvo de correção): Mercado Pago/Stripe, webhooks, entidades do base44, preços/planos/ofertas, CTA do WhatsApp.
