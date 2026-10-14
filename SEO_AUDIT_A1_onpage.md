# Auditoria SEO On-Page — Parte A1
**Site:** https://www.trancosoresolve.com.br | **Data:** 14/10/2026
**Metodologia:** fetch via `curl` (HTML bruto, sem execução de JS) de todas as 49 rotas indexáveis em produção, seguido de parsing estrutural (Python) das tags `<title>`, `<meta>`, `<link rel="canonical">`, `<link rel="alternate" hreflang>`, `<h1>`/`<h2>`, JSON-LD e texto visível do `<body>`.

**Nota metodológica importante (ler antes da tabela):** este site é uma SPA sem SSR real. O HTML que o `curl` recebe (o que a maioria dos crawlers que não executam JavaScript — bem como ferramentas de auditoria, Lighthouse-sem-JS, pré-visualizações de redes sociais e crawlers de IA — veem) **não é o componente React real da página** (`ServicoLocalPage.jsx`, `DestinoTrancoso.jsx` etc.). É um bloco oculto gerado pela plataforma Base44, `<div id="seo-snapshot" data-seo-source="builder">` (1px, `clip:rect(0,0,0,0)`, para leitor de tela), que contém apenas: um `<h1>` repetindo o `<title>`, um parágrafo de introdução (a única frase realmente única por página nesse HTML estático) e uma lista de navegação genérica com links para todas as páginas do site. O conteúdo real do componente (lista de serviços, "como funciona", FAQ com perguntas reais, texto de 300+ palavras) só existe depois da hidratação React no navegador. Isso explica achados importantes abaixo (H1 "idêntico" ao title, JSON-LD incompleto, duplicidade de conteúdo ~99,8%) e foi tratado como achado técnico-chave, não como erro de leitura dos dados.

Todas as 49 páginas responderam **HTTP 200** — nenhuma falha de rede ou timeout a reportar.

---

## Tabela por página

Legenda da coluna "Nota": 1=crítico, 5=ótimo. Title/Desc mostrados em caracteres. "Canonical" mostra o host usado (todas as páginas são 100% consistentes entre si — ver Top Problema #1). "OG" = 10 tags `og:` presentes em todas as páginas (completo). "Hreflang" = `pt-BR` + `x-default` em todas (nenhuma página tem es/en — ver observação ao final da tabela).

| Rota | Title (chars) | Description (chars) | H1 único por página? | Canonical | OG completo | Nota |
|---|---|---|---|---|---|---|
| `/` | 16 | 143 | sim* | `trancosoresolve.com.br/` (sem www) | sim | 2 |
| `/trancoso` | 39 | 130 | sim* | `.../trancoso` (sem www, sem `/destinos/`, correto) | sim | 4 |
| `/arraial-dajuda` | 46 | 137 | sim* | `.../arraial-dajuda` (sem www, correto) | sim | 4 |
| `/porto-seguro` | 43 | 134 | sim* | `.../porto-seguro` (sem www, correto) | sim | 4 |
| `/caraiva` | 38 | 129 | sim* | `.../caraiva` (sem www, correto) | sim | 4 |
| `/About` | 24 | 138 | sim* | `.../About` (sem www) | sim | 3 |
| `/Contact` | 26 | 124 | sim* | `.../Contact` (sem www) | sim | 3 |
| `/Planos` | 44 | 138 | sim* | `.../Planos` (sem www) | sim | 3 |
| `/SejaPrestador` | 36 | 137 | sim* | `.../SejaPrestador` (sem www) | sim | 3 |
| `/ServicosCategoria` | 41 | 136 | sim* | `.../ServicosCategoria` (sem www) | sim | 3 |
| `/costa-do-descobrimento` | 41 | 128 | sim* | `.../costa-do-descobrimento` (sem www) | sim | 3 |
| `/participar` | 28 | 119 | sim* | `.../participar` (sem www) | sim | 3 |
| `/investidores` | 31 | 130 | sim* | `.../investidores` (sem www) | sim | 3 |
| `/ComoFunciona` | 32 | 136 | sim* | `.../ComoFunciona` (sem www) | sim | 3 |
| `/PoliticaPrivacidade` | 42 | 117 | sim* | `.../PoliticaPrivacidade` (sem www) | sim | 3 |
| `/guides/morar-em-trancoso` | 36 | 112 | sim* | `.../guides/morar-em-trancoso` (sem www) | sim | 3 |
| `/destinos/casamento-trancoso` | 41 | 128 | sim* | `.../destinos/casamento-trancoso` (sem www) | sim | 3 |
| `/destinos/reveillon-trancoso` | 40 | 104 | sim* | `.../destinos/reveillon-trancoso` (sem www) | sim | 3 |
| `/servicos/dj-trancoso` | 33 | 152 | sim* | sem www | sim | 3 |
| `/servicos/diarista-trancoso` | 39 | 155 | sim* | sem www | sim | 3 |
| `/servicos/eletricista-trancoso` | 42 | 159 | sim* | sem www | sim | 4 |
| `/servicos/piscineiro-trancoso` | 41 | 146 | sim* | sem www | sim | 3 |
| `/servicos/pedreiro-trancoso` | 39 | 140 | sim* | sem www | sim | 3 |
| `/servicos/pintor-trancoso` | 37 | 154 | sim* | sem www | sim | 3 |
| `/servicos/jardineiro-trancoso` | 41 | 148 | sim* | sem www | sim | 3 |
| `/servicos/encanador-trancoso` | 40 | 152 | sim* | sem www | sim | 3 |
| `/servicos/chef-trancoso` | 35 | 145 | sim* | sem www | sim | 3 |
| `/servicos/seguranca-trancoso` | 40 | **167** ⚠ | sim* | sem www | sim | 2 |
| `/servicos/motorista-trancoso` | 40 | 157 | sim* | sem www | sim | 3 |
| `/servicos/quadrado-trancoso` | 46 | 115 | sim* | sem www | sim | 3 |
| `/servicos/rio-verde-trancoso` | 47 | 116 | sim* | sem www | sim | 3 |
| `/servicos/pitinga-trancoso` | 45 | 114 | sim* | sem www | sim | 3 |
| `/servicos/diarista-porto-seguro` | 43 | 159 | sim* | sem www | sim | 3 |
| `/servicos/eletricista-porto-seguro` | 46 | **163** ⚠ | sim* | sem www | sim | 2 |
| `/servicos/piscineiro-porto-seguro` | 45 | 150 | sim* | sem www | sim | 3 |
| `/servicos/cozinheiro-porto-seguro` | 45 | 144 | sim* | sem www | sim | 3 |
| `/servicos/jardineiro-porto-seguro` | 45 | 152 | sim* | sem www | sim | 3 |
| `/servicos/pedreiro-porto-seguro` | 43 | 144 | sim* | sem www | sim | 3 |
| `/servicos/diarista-caraiva` | 38 | 154 | sim* | sem www | sim | 3 |
| `/servicos/eletricista-caraiva` | 41 | 158 | sim* | sem www | sim | 3 |
| `/servicos/piscineiro-caraiva` | 40 | 145 | sim* | sem www | sim | 3 |
| `/servicos/cozinheiro-caraiva` | 40 | 139 | sim* | sem www | sim | 3 |
| `/servicos/jardineiro-caraiva` | 40 | 147 | sim* | sem www | sim | 3 |
| `/servicos/pedreiro-caraiva` | 38 | 139 | sim* | sem www | sim | 3 |
| `/servicos/diarista-arraial-dajuda` | 46 | **162** ⚠ | sim* | sem www | sim | 2 |
| `/servicos/eletricista-arraial-dajuda` | 49 | **166** ⚠ | sim* | sem www | sim | 2 |
| `/servicos/piscineiro-arraial-dajuda` | 48 | 153 | sim* | sem www | sim | 3 |
| `/servicos/cozinheiro-arraial-dajuda` | 48 | 147 | sim* | sem www | sim | 3 |
| `/servicos/jardineiro-arraial-dajuda` | 48 | 155 | sim* | sem www | sim | 3 |
| `/servicos/pedreiro-arraial-dajuda` | 46 | 147 | sim* | sem www | sim | 3 |

`*` = exatamente 1 `<h1>` por página, com texto único (não repetido entre páginas), mas **igual ao `<title>` da própria página**, pois ambos vêm do mesmo bloco `#seo-snapshot` — não é o H1 real do componente React (ver nota metodológica).

**Resumo agregado de comprimentos:**
- **Title:** nenhuma das 49 páginas está na faixa ideal de 50–60 caracteres recomendada — todas são mais curtas (16 a 49 chars). Nenhuma arrisca truncamento no Google (bom), mas a Home (16 chars, "Trancoso Resolve") e várias institucionais deixam espaço de palavra-chave sem uso.
- **Description:** 24 de 49 páginas estão fora da faixa ideal 140–160 chars; a maioria fica um pouco abaixo (104–139). **4 páginas excedem 160 chars e arriscam truncamento no SERP**: `/servicos/seguranca-trancoso` (167), `/servicos/eletricista-porto-seguro` (163), `/servicos/eletricista-arraial-dajuda` (166), `/servicos/diarista-arraial-dajuda` (162).
- **Canonical:** 100% das páginas usam `https://trancosoresolve.com.br` (sem `www`), de forma consistente — mas isso contradiz a regra documentada no `CLAUDE.md` do projeto ("sempre usar com www") e o que o histórico de PRs registra como corrigido. Ver Top Problema #1.
- **OG:** todas as 49 páginas têm exatamente as mesmas 10 tags `og:`/`twitter:` preenchidas (type, site_name, url, title, description, image, image:width/height/alt, locale) — porém `og:image` é **idêntica em todas as páginas** (mesma imagem genérica de marca), nunca uma imagem específica do serviço/destino.
- **Hreflang:** presente em todas as páginas, mas sempre só `pt-BR` + `x-default` — nunca `es`/`en`, mesmo havendo traduções em `src/i18n/translations.js`. Isso é esperado e correto hoje, porque o site não tem URLs dedicadas em `/es/` ou `/en/` (o seletor de idioma troca o texto só no client, sem mudar a URL) — adicionar hreflang es/en sem URLs próprias seria incorreto. Então isto é baixa prioridade e exigiria primeiro criar rotas dedicadas por idioma, o que é uma decisão de arquitetura maior, não uma correção pontual.

---

## Conteúdo duplicado serviço × cidade

Medido como similaridade de texto (`difflib.SequenceMatcher`) sobre o texto visível completo do `<body>` (sem JS) de 5 grupos de 4 cidades cada (eletricista, diarista, piscineiro, jardineiro, pedreiro):

| Grupo | Similaridade entre pares (6 combinações por grupo) |
|---|---|
| eletricista (Trancoso / Porto Seguro / Caraíva / Arraial d'Ajuda) | 99,7% a 99,8% |
| diarista | 99,7% a 99,8% |
| piscineiro | 99,7% a 99,8% |
| jardineiro | 99,7% a 99,8% |
| pedreiro | 99,7% a 99,8% |

Como controle, páginas sem relação temática também saem quase idênticas nesse HTML estático: `/About` vs `/Contact` = 98,9%; `/trancoso` vs `/porto-seguro` = 99,8%; `/Planos` vs `/investidores` = 98,3%.

**Isso confirma e amplia a lacuna já conhecida.** A única frase que de fato muda por página, no HTML que um crawler sem JS vê, é a frase de introdução logo após o H1 — por exemplo:
- `/servicos/eletricista-trancoso`: *"Eletricista em Trancoso: instalações, reparos e manutenção elétrica com segurança. Profissionais verificados, orçamento rápido para casas, pousadas e empresas."*
- `/servicos/eletricista-porto-seguro`: mesmíssima frase, trocando só "Trancoso" por "Porto Seguro".

Todo o resto do texto (quase 9.700 caracteres por página) é a navegação genérica do site (`#seo-snapshot`), idêntica em todas as páginas. **O texto de 300+ palavras único por página que o componente `ServicoLocalPage.jsx` de fato renderiza (lista de serviços, "como funciona", `seoText`, FAQ com perguntas reais) existe no código-fonte e provavelmente aparece para o Googlebot pós-renderização — mas não está presente em nenhum HTML servido sem execução de JS.** Isso é mais grave do que "textos parecidos entre cidades": para qualquer ferramenta, rede social ou crawler de IA que não execute JavaScript, o conteúdo é **o mesmo bloco de navegação repetido 49 vezes**, não um texto "parecido".

---

## Top problemas encontrados (ordenados por impacto)

**1. Canonical/og:url/schema `@id` usam domínio sem `www` em 100% do site, contrariando a regra documentada do projeto — e o próprio redirect de produção vai no sentido contrário ao esperado.**
Testado diretamente: `https://www.trancosoresolve.com.br/` responde **301 → `https://trancosoresolve.com.br/`** (www redireciona para apex). O `CLAUDE.md` do projeto registra como regra crítica de SEO "sempre usar `https://www.trancosoresolve.com.br` (com www)" e descreve a PR #51 como tendo corrigido `og:url`/`WebSite url`/`LocalBusiness @id/url` para usar www. Hoje, nem o redirect de domínio nem nenhuma linha de código usam www: busquei `www.trancosoresolve` em todo `src/` e não há nenhuma ocorrência; `src/hooks/useSEO.js:3` tem `const BASE_URL = 'https://trancosoresolve.com.br'` (sem www), e os canonicals hardcoded em páginas de destino/serviço (ex.: `src/pages/destinos/Trancoso.jsx:37`) também usam o domínio sem www. Ou a regra documentada ficou desatualizada, ou a correção da PR #51 foi revertida/sobrescrita depois. **Isso precisa de uma decisão explícita do Tony** sobre qual domínio é o canônico definitivo — o código e o redirect de domínio estão alinhados entre si (ambos sem www), mas ambos contradizem a documentação do projeto.

**2. O `<title>` servido sem JS para a Home é fraco ("Trancoso Resolve", 16 caracteres) — bem mais fraco que o título real da página.**
`src/pages/Home.jsx:416` define `document.title = "Trancoso Resolve | Profissionais Verificados em Trancoso"` (59 chars, rico em palavra-chave) via JS no mount. Mas o HTML estático que qualquer crawler sem JS recebe mostra só `"Trancoso Resolve"`. Como a Home é provavelmente a página de maior autoridade do domínio para ranqueamento nacional, ter um título fraco na primeira camada (antes da hidratação) é o achado de maior risco da auditoria — mesmo que o Googlebot moderno geralmente execute JS, outras ferramentas, crawlers de IA e pré-visualizações sociais podem não executar.

**3. Conteúdo real do componente (H1, FAQ com perguntas reais, lista de serviços, texto `seoText`) só existe após hidratação JS — o HTML estático mostra apenas o bloco de navegação genérico `#seo-snapshot` da plataforma Base44.**
Isso explica por que todas as páginas têm só 4 blocos JSON-LD no HTML estático (`LocalBusiness`, `Organization`, `WebSite`, `FAQPage` globais do `index.html`) em vez dos 7 que uma auditoria anterior encontrou em `/servicos/eletricista-trancoso` — os 3 adicionais (`page-schema-ld`, `page-faq-ld`, `page-breadcrumb-ld`) são injetados só no client por `ServicoLocalPage.jsx` via `useEffect` (linhas 90–152). Isso não contradiz o achado anterior — ele provavelmente mediu o DOM já renderizado — mas confirma que **metade da estrutura de dados (incluindo o FAQ real, específico por serviço) depende inteiramente de execução de JS**, o que é um ponto de fragilidade para qualquer ferramenta ou crawler que não renderize.

**4. Duplicidade de conteúdo confirmada e quantificada: 99,7%–99,8% de similaridade entre variantes de cidade do mesmo serviço** (ver seção dedicada acima) — causada diretamente pelo item #3: o pouco texto que diferencia as páginas (a frase de intro) é visível sem JS, mas o texto realmente único de 300+ palavras por combinação serviço×cidade é client-side only.

**5. `og:image` idêntica em todas as 49 páginas** (mesma imagem genérica de marca, 1200×630). Compartilhamentos no WhatsApp/redes sociais de qualquer página do site mostram a mesma prévia visual, sem diferenciação por serviço ou destino.

**6. 4 meta descriptions excedem 160 caracteres e arriscam truncamento no SERP:** `/servicos/seguranca-trancoso` (167), `/servicos/eletricista-arraial-dajuda` (166), `/servicos/eletricista-porto-seguro` (163), `/servicos/diarista-arraial-dajuda` (162).

**7. Âncoras de links internos (no HTML estático) são o nome da rota "humanizado", não totalmente descritivas e um pouco inconsistentes** — ex.: "Assistentevirtual" (sem espaçamento), "Concierge Page" / "About Page" / "Investidores Page" (sufixo "Page" em inglês dentro de um site em português), "Servico Landing Page". Não é o problema clássico de "clique aqui"/"saiba mais" genérico (que não ocorre), mas há espaço para âncoras mais naturais e 100% em português. Baixo impacto porque esse bloco de navegação não é o conteúdo real da página, só o fallback de acessibilidade/pré-JS.

**8. Hreflang limitado a pt-BR/x-default** — correto para a arquitetura atual (sem URLs por idioma), mas é uma lacuna estrutural para o objetivo de ranquear para turista estrangeiro, caso isso vire prioridade futura.

---

## Recomendações de correção

### Viável em código (dentro do repo)

1. **Decidir e unificar o domínio canônico (www vs apex) e aplicar em todo o código** — depende de decisão do Tony (não vou escolher por conta própria, dado o conflito com a documentação):
   - `src/hooks/useSEO.js:3` (`BASE_URL`)
   - Canonicals hardcoded em páginas de destino/serviço (ex.: `src/pages/destinos/Trancoso.jsx`, `CasamentoTrancoso.jsx`, `RevelionTrancoso.jsx`, `MorarTrancoso.jsx`, `Investidores.jsx`, `ServicoDetalhes.jsx`, e as páginas de serviço de Arraial d'Ajuda)
   - `src/data/seoLocal.js`, `src/components/servicos/ServicoLocalPage.jsx` e `ServicoLocalPagePS.jsx`
   - Se a decisão for usar `www`, também é preciso ajustar o redirect de domínio na Vercel (fora do escopo de código — é configuração de infraestrutura).

2. **Encurtar as 4 meta descriptions que excedem 160 caracteres** (arquivos de dados de serviço correspondentes a `seguranca-trancoso`, `eletricista-porto-seguro`, `eletricista-arraial-dajuda`, `diarista-arraial-dajuda`) para ficarem dentro de 140–160 chars.

3. **Variar `og:image` por serviço/destino** (ou ao menos por categoria de serviço) em vez da imagem genérica única, para melhorar a aparência de compartilhamentos sociais.

4. **Padronizar os rótulos de navegação/âncora** (remover sufixo "Page" em inglês, corrigir espaçamento tipo "Assistentevirtual" → "Assistente Virtual") nos componentes/dados que alimentam essa lista de navegação.

### Fora do escopo do repositório (plataforma Base44)

1. **O bloco `#seo-snapshot`** (gerado pela plataforma, não pelo código React) é quem decide o que um crawler sem JS vê. Ele não reflete o conteúdo real do componente (FAQ, lista de serviços, texto `seoText`) nem o `document.title` real da Home. Isso só pode ser corrigido ajustando o processo de geração de snapshot da própria plataforma Base44 (ex.: garantir que ele capture o DOM pós-hidratação, ou que inclua os blocos JSON-LD client-side) — não há arquivo no repo que controle esse bloco.
2. **O próprio redirect de domínio (www → apex)** é configuração de DNS/Vercel, não código do repositório.

---

## Observações finais

- Nenhum arquivo de código foi alterado nesta auditoria — fase de levantamento apenas.
- As 49 páginas auditadas cobrem: Home, 4 destinos, 8 institucionais/landing (About, Contact, Planos, SejaPrestador, ServicosCategoria, costa-do-descobrimento, participar, investidores, ComoFunciona, PoliticaPrivacidade — 10 ao todo), guia Morar em Trancoso, Casamento e Réveillon, e 32 páginas de serviço×cidade (14 em Trancoso incluindo DJ, 6 em Porto Seguro, 6 em Caraíva, 6 em Arraial d'Ajuda).
- Não tentei "corrigir" o bloco `#seo-snapshot` da plataforma Base44 nem o redirect de domínio — ambos fora do escopo deste repositório, conforme instruído.
- Não toquei em código de Mercado Pago/Stripe, `base44/entities`, preços, planos ou CTA de WhatsApp.
