# Auditoria Técnica — Parte A3

> O agente `seo-tecnico` original esgotou a cota de sessão antes de gerar este arquivo
> (ficou registrado só um alerta sobre checar `/investidores`/noindex). Este relatório foi
> concluído pela sessão coordenadora, com as mesmas regras: medição ao vivo via `curl`,
> nenhum número inventado, nenhum arquivo fora do escopo tocado. Data: 14/10/2026.

## 1. Sitemap vs. rotas reais

- **Produção (ao vivo):** 53 URLs em `https://trancosoresolve.com.br/sitemap.xml`.
- **Repo local (antes da correção abaixo):** 54 URLs — 1 a mais que produção:
  `/CadastroTipo` (presente no repo, ainda não publicado em produção — não é erro, é
  defasagem normal de deploy).
- **Achado corrigido nesta sessão:** `/investidores` estava no sitemap (prioridade 0.3)
  **apesar de a própria página definir `noIndex: true`** (`src/pages/Investidores.jsx:34`).
  Sitemap e intenção de indexação estavam contraditórios. Corrigido em
  `scripts/generate-sitemap.js` (comentário explicando o motivo) e `public/sitemap.xml`
  regenerado via `npm run sitemap` — agora 53 URLs, sem `/investidores`.
- Todas as 53 URLs do sitemap ao vivo foram testadas via `curl` uma a uma: **100% retornam
  HTTP 200**, nenhum link quebrado ou redirecionado no sitemap.

## 2. robots.txt

Lido ao vivo em produção — `Allow: /` geral, `Disallow:` cobrindo corretamente todas as
rotas administrativas/privadas (`/admin/`, `/Admin*`, `/Financeiro`, `/Dashboard`,
`/MeusServicos`, `/Chat`, `/api/`, etc.), `Crawl-delay: 1`, e referência correta ao
`Sitemap: https://trancosoresolve.com.br/sitemap.xml`. Nenhuma divergência encontrada
entre o que é bloqueado e as rotas administrativas reais do `src/App.jsx`/`pages.config.js`.

## 3. `/investidores` — noindex real vs. declarado

- **Intenção no código:** `noIndex: true` (via `useSEO`/`useDestinationSeo`).
- **O que o HTML estático (sem JS) realmente entrega:** nenhuma tag
  `<meta name="robots">` própria da página — herda o `index, follow` padrão de
  `index.html`. A diretiva `noindex` só é aplicada depois da hidratação React, via
  `useEffect` do hook de SEO.
- **Risco:** qualquer ferramenta/crawler que não execute JavaScript (a maioria dos
  validadores de SEO, pré-visualizações sociais, crawlers de IA simples) vê
  `/investidores` como indexável — o oposto da intenção. O Googlebot moderno costuma
  executar JS e pode aplicar o noindex corretamente, mas depende do comportamento do WRS,
  não é garantido. Isso é o mesmo problema estrutural já documentado em A1/A2 (SEO
  client-side-only), aplicado aqui a uma página que especificamente deveria estar fora do
  índice — portanto tem prioridade mais alta que os outros casos.
- **Corrigido nesta sessão:** removida do sitemap (item 1 acima), eliminando o sinal mais
  forte e mais fácil de corrigir de "esta página deveria ser indexada". A correção completa
  (meta `robots` já presente no HTML estático, antes da hidratação) depende do mesmo ponto
  estrutural fora do escopo do repositório: o bloco `#seo-snapshot` da plataforma Base44.

## 4. JSON-LD — validade de sintaxe

Testado via parsing real (`JSON.parse`) dos blocos `<script type="application/ld+json">`
no HTML estático de 5 rotas-amostra (`/`, `/trancoso`, `/servicos/eletricista-trancoso`,
`/investidores`, `/About`): **4 blocos por página, 100% válidos como JSON** (`LocalBusiness`,
`Organization`, `WebSite`, `FAQPage` — os mesmos 4 globais de `index.html` em todas as
rotas). Nenhum erro de sintaxe encontrado. Confirma o achado de A1: os blocos adicionais
específicos de página (`page-schema-ld`, `page-faq-ld`, `page-breadcrumb-ld`, incluindo
`BreadcrumbList`) só existem depois da hidratação — não há como validar sua sintaxe lendo
HTML estático, e por isso **não aparecem no HTML servido sem JS em nenhuma rota testada**.

## 5. HTML semântico

Nas mesmas 5 rotas-amostra, no HTML estático: exatamente **1 `<main>`** e **1 `<nav>`**
por página (correto, sem duplicação). **0 `<footer>`** encontrado em qualquer rota — o
rodapé real do site é renderizado só pelo componente React (`Layout.jsx`), não aparece no
bloco `#seo-snapshot`. Não há breadcrumb visível (texto) no HTML estático pelo mesmo motivo
do item 4.

## 6. Links internos — checagem de 404/redirect

Todas as 53 URLs do sitemap ao vivo testadas via `curl -o /dev/null -w "%{http_code}"`:
**100% HTTP 200**, nenhuma quebrada, nenhuma redirecionando. Não foi feita uma varredura de
todos os links internos *dentro* de cada página (fora do tempo disponível desta sessão) —
apenas das URLs que o site declara publicamente via sitemap.

---

## Resumo do que foi corrigido nesta auditoria (Parte A3)

- `scripts/generate-sitemap.js`: removida a entrada `/investidores` (contradição com
  `noIndex: true` da própria página) + comentário explicando o motivo.
- `public/sitemap.xml`: regenerado via `npm run sitemap` (53 URLs, sem `/investidores`).

## Pendente / fora do escopo do repositório

- Meta `robots` e JSON-LD por página (incluindo `BreadcrumbList`) só existem pós-hidratação
  — depende do bloco `#seo-snapshot` gerado pela plataforma Base44, não há arquivo no repo
  que o controle.
- Varredura completa de links internos dentro do conteúdo de cada página (não feita por
  limite de tempo desta sessão).

Nenhuma alteração foi feita em Mercado Pago/Stripe, `base44/entities`, preços/planos ou
CTA de WhatsApp.
