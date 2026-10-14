# Auditoria de Performance / Core Web Vitals — Parte A4

> Levantamento ao vivo em `https://trancosoresolve.com.br` (produção), 14/10/2026.
> Esta fase é somente de levantamento — nenhum arquivo foi alterado.

## 0. Nota metodológica importante

- **Lighthouse / `@lhci/cli` não estão instalados neste projeto** (não aparecem em
  `package.json`, nem em `node_modules/.bin/`), apesar de existirem `lighthouserc.json`
  e `lighthouse-config.js` configurados no repo para uso futuro. Não rodei `npm install`
  para não alterar dependências — conforme instruído.
- Por isso, **os valores de LCP abaixo são estimados a partir da cadeia de carregamento
  (HTML → JS/CSS → imagem), não medidos por um Lighthouse real**. Onde não há dados
  suficientes para nem isso, está marcado explicitamente como "não confirmado".
- Todas as medições de HTML foram feitas com `curl` usando um User-Agent mobile
  (Chrome/Android) contra o domínio final após redirecionamento.

### Achado colateral fora do escopo original (sinalizando, não corrigindo)

Ao medir `https://www.trancosoresolve.com.br/`, descobri que:
- **`www` redireciona (301) para o domínio sem `www`** (`trancosoresolve.com.br`), o
  oposto da regra registrada no `CLAUDE.md` ("URL canônica sempre com `www`"). O
  `index.html` do repo já usa `canonical` **sem `www`** (linha 33) — ou seja, o código
  já foi ajustado para sem-`www`, mas a regra de memória ficou desatualizada. Vale o
  Tony confirmar qual é a intenção atual.
- Os headers de resposta do domínio de produção (`rndr-id`, `via: 1.1 Caddy`,
  `x-render-origin-server: uvicorn`) indicam que o tráfego **não está passando pelo
  Vercel** no momento da medição — nem o `Content-Security-Policy` nem os
  `Cache-Control` definidos em `vercel.json` aparecem na resposta real. Isso sugere que
  o domínio customizado está apontado diretamente para a infraestrutura do Base44/Render,
  não para o Vercel. Não investiguei DNS/infra a fundo (fora do escopo desta tarefa),
  mas é um ponto que merece confirmação do Tony, já que todo o trabalho de SEO/PRs
  mergeados em `main` pode não estar refletido ao vivo se o domínio não aponta para o
  Vercel.

---

## 1. Tabela por página

Todas as rotas compartilham o mesmo bundle JS/CSS (é uma SPA) — por isso o "peso de
JS/CSS crítico" é idêntico em todas: **5 arquivos JS = ~887 KB sem compressão / ~280 KB
transferidos (brotli)** + **1 CSS = 185 KB sem compressão / ~28 KB transferido**. Esse
bloco precisa baixar, parsear e executar antes do React montar qualquer conteúdo real
(o HTML inicial é só um shell `<div id="root">` vazio + um bloco `#seo-snapshot`
invisível para crawlers).

| Rota | Tempo resposta HTML | Tamanho HTML | LCP estimado/medido | Elemento LCP (provável) | Peso do elemento LCP | Render-blocking |
|---|---|---|---|---|---|---|
| `/` (Home) | 0,72–0,94s (TTFB variável) | 49.152 bytes | **Não medido** (sem Lighthouse). Estruturalmente arriscado: hero só aparece após baixar+executar ~280KB JS gzip | `<picture>` do carrossel `BannerRotativo` (slide 1), imagem webp | 79–82 KB (webp, via `base44.app` com 1 redirect 302 → `media.base44.com`) | CSS `index-5HkdX7Jn.css` (28KB gzip, bloqueante — normal/necessário) |
| `/trancoso` | 0,37–0,48s | 49.673 bytes | Não medido | Imagem de fundo decorativa (Unsplash, opacity 20%) atrás do heading — ambíguo com o próprio `<h1>` | 118 KB (Unsplash, sem preconnect/preload) | Mesmo CSS/JS acima |
| `/ServicosCategoria` | 0,39–0,87s | 49.496 bytes | Não medido | **Não confirmado** — sem `<img>`/`backgroundImage` no componente de página; provavelmente herdado de layout/grid carregado após fetch de dados | — | Mesmo CSS/JS acima |
| `/investidores` | 0,46–0,79s | 49.664 bytes | Não medido | **Não confirmado** — nenhuma imagem no componente de página | — | Mesmo CSS/JS acima |
| `/About` | 0,37–0,49s | 49.625 bytes | Não medido | Provavelmente o `<h1>`/heading — página usa só um padrão de grid CSS decorativo (`linear-gradient`), sem imagem pesada | — | Mesmo CSS/JS acima |
| `/ComoFunciona` | 0,51–0,69s | 49.436 bytes | Não medido | Mesmo padrão de `/About` — provável heading, sem imagem pesada confirmada | — | Mesmo CSS/JS acima |
| `/ServicoLanding` | 0,50–0,78s | 49.766 bytes | Não medido | `<img src={config.heroImage}>` com `loading="eager"` mas **sem `fetchPriority`, sem `width`/`height`** | Depende de `config.heroImage` (fonte Unsplash em parte dos configs) — tamanho não confirmado | Mesmo CSS/JS acima |
| `/servicos/eletricista-trancoso` | 0,35–0,56s | 50.039 bytes | Não medido | **Não confirmado** — sem imagem direta no componente de página | — | Mesmo CSS/JS acima |
| `/Planos` | 0,40–0,54s | 49.494 bytes | Não medido | **Não confirmado** — sem imagem direta no componente de página | — | Mesmo CSS/JS acima |

## 2. A lentidão da home mobile (~9,5s) — ainda procede?

**Não consigo confirmar nem descartar o número exato de ~9.459ms** desta sessão, porque
não há Lighthouse disponível para medir TTI/LCP reais sob throttling simulado. Mas os
fatores estruturais que causariam uma métrica alta **continuam presentes e sem correção**:

- O carrossel da home (`BannerRotativo`) só aparece depois que os ~280KB de JS (gzip)
  + 28KB de CSS baixam, parseiam e executam — isso é inerente à arquitetura SPA atual,
  não há SSR/pré-renderização do conteúdo visual.
- A imagem do primeiro slide é `fetchPriority="high"` e `loading="eager"` (correto),
  mas passa por um **redirect 302** (`base44.app` → `media.base44.com`) antes do
  download real começar — isso soma uma RTT extra ao caminho crítico do LCP.
- Nenhuma correção relacionada a isso apareceu nos commits recentes (`914db2c6`,
  `6a25436b`, `7c1eec40`) — o foco desses commits foi SEO de páginas de serviço/imagens
  e segurança, não performance do carrossel da home.

Conclusão: **o risco de LCP alto na home mobile permanece plausível e não foi
mitigado**, mas não posso reportar um número específico sem Lighthouse.

## 3. Recomendações de correção no código

Apenas itens de código, sem troca de biblioteca nem refatoração ampla:

1. **Preload apontando para URL com redirect** (`index.html`, linhas 64–65 e 78, e
   equivalentes gerados pelo SEO builder em todas as rotas): os `<link rel="preload">`
   do hero apontam para `https://base44.app/api/apps/.../files/mp/public/...webp`, que
   responde com **302 → `media.base44.com`** antes de entregar o arquivo. Trocar o
   `href` do preload (e idealmente do `<picture><source>` em `BannerRotativo.jsx`,
   linhas 13–14, 25–26, 37–38) para a URL final já resolvida em `media.base44.com`
   elimina uma RTT extra no caminho crítico do LCP da home.

2. **Falta `preconnect` para `images.unsplash.com`**: usado como imagem de
   fundo/hero em `src/pages/Home.jsx`, `src/pages/ServicoLanding.jsx`, e nas 4 páginas
   de destino (`Trancoso.jsx`, `ArraialDajuda.jsx`, `Caraiva.jsx`, `PortoSeguro.jsx`).
   `index.html` já tem `preconnect` para `media.base44.com`, `base44.app`,
   `files.manuscdn.com`, `ui-avatars.com`, `googletagmanager.com`, `facebook.net` e
   `unpkg.com`, mas não para `images.unsplash.com` — adicionar um
   `<link rel="preconnect" href="https://images.unsplash.com" crossorigin />` reduziria
   o tempo de handshake/DNS antes de buscar essas imagens de hero.

3. **`ServicoLanding.jsx` (linha 399–404)**: o `<img>` do hero tem `loading="eager"`
   mas não tem `fetchPriority="high"` nem `width`/`height` explícitos — adicionar os
   dois evita concorrência de prioridade com outros recursos e reduz risco de CLS
   nessa página.

4. **CSS do carrossel da home (`index-5HkdX7Jn.css`, 28KB gzip)** é render-blocking
   por padrão (comportamento correto/esperado para evitar FOUC) — não há ação
   recomendada aqui, é citado só para registro.

5. Os scripts (`index-CtVGQ83m.js` e os 4 chunks `vendor-*.js`) já usam
   `type="module"` (comportamento `defer` implícito) e `modulepreload`, e o GTM já
   carrega com `async` — **nenhuma ação necessária nesses pontos**, já seguem boas
   práticas.

---

**Arquivo gerado em:** `C:\Users\User\Documents\projetos\trancoso-resolve-base\SEO_AUDIT_A4_performance.md`
