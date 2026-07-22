# Trancoso Resolve

> **Idioma das respostas:** responda **sempre em português (pt-BR)**, de forma
> calorosa e direta, tratando a pessoa por **você**.

Marketplace de serviços locais em **Trancoso, Bahia**. Conecta moradores,
empresários e donos de imóvel a prestadores de serviços locais — elétrica,
limpeza, jardinagem, reformas e mais. Produtos digitais: **app web** e **app mobile**.

> A promessa da marca é um trocadilho: "Resolve" *resolve* o problema **e** é o nome do
> produto. Use a palavra ativamente — "A gente resolve.", "Resolva hoje."

---

## 🚀 Comandos de desenvolvimento

```bash
npm install        # instalar dependências
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # build de produção
npm run lint       # eslint (0 erros esperados)
npm run lint:fix   # eslint --fix
npm run typecheck  # tsc -p ./jsconfig.json
npm run preview    # preview de produção local
npm run sitemap    # regenera public/sitemap.xml (scripts/generate-sitemap.js)
```

**Stack:** React 18 + Vite 6.1 + Tailwind 3.4 + shadcn/ui (new-york) + Base44 SDK + Lucide icons.
**Tipo:** SPA (Single Page Application), sem TypeScript estrito (JSX + `jsconfig.json`).

---

## 📦 Estrutura do projeto

```
src/
├── App.jsx                 # Router principal (React Router v6)
├── Layout.jsx              # Layout shell (nav, footer, sidebars)
├── main.jsx                # Entry point
├── index.css               # Tema global + design tokens aditivos
│
├── components/             # UI e componentes de negócio
│   ├── ui/                 # shadcn/ui (51+ componentes)
│   ├── admin/              # Painel admin (usuários, métricas, financeiro)
│   ├── auth/               # Autenticação (login, cadastro, senha)
│   ├── providers/          # Componentes de prestadores
│   ├── services/           # Listagem e detalhe de serviços
│   ├── booking/            # Fluxo de agendamento
│   ├── reviews/            # Avaliações e comentários
│   ├── employees/          # Gestão de equipes
│   ├── financial/          # Controle financeiro
│   ├── team/               # Colaboração em equipe
│   ├── search/             # Busca e filtros
│   ├── monitoring/         # Monitoramento em tempo real
│   ├── plans/              # Planos de assinatura
│   ├── verification/       # Verificação de profissionais
│   ├── feedback/           # Feedback e tickets
│   ├── seo/                # SchemaMarkup.jsx — injeção JSON-LD
│   └── optimization/       # Otimizações de performance
│
├── pages/                  # Páginas (rotas)
│   ├── Home.jsx
│   ├── Dashboard.jsx       # Dashboard principal
│   ├── Admin*.jsx          # Páginas admin (20+)
│   ├── destinos/           # Hub de destinos (Trancoso, Porto Seguro, Caraíva)
│   └── servicos/           # Detalhe de categorias de serviço
│
├── styles/
│   ├── index.css           # Tema Tailwind + vars CSS
│   └── brand/              # Design system da marca
│       ├── index.css       # Aditivo (tokens sem reset)
│       ├── styles.css      # Completo (inclui reset)
│       ├── tokens/         # Cores, tipografia, espaçamento, raio, sombra
│       ├── fonts/          # Nunito variable (self-hosted)
│       └── assets/         # Logo SVGs (mark, mono)
│
├── api/                    # Integração com serviços
│   ├── base44Client.js     # Base44 SDK wrapper
│   ├── entities.js         # Mapeamento de entidades
│   └── integrations.js     # APIs externas (Stripe, etc)
│
├── hooks/                  # React hooks customizados
│   ├── use-mobile.jsx
│   ├── useDestinationSeo.js  # SEO para páginas de destino
│   ├── useSEO.js             # SEO genérico para qualquer página
│   └── usePullToRefresh.js
│
├── lib/                    # Utilitários e helpers
│   ├── AuthContext.jsx     # Context de autenticação
│   ├── NavigationTracker.jsx
│   ├── VisualEditAgent.jsx
│   ├── accessibility.js    # WCAG e a11y
│   ├── analytics.js        # Vercel Analytics + Speed Insights
│   ├── performance.js      # Web Vitals
│   ├── query-client.js     # TanStack Query config
│   ├── utils.js            # Helpers gerais
│   └── ...
│
├── utils/                  # Lógica de negócio e formatação
├── data/                   # Dados estáticos (categorias, etc)
├── contexts/               # React Contexts
├── assets/                 # SVGs, imagens, ícones
├── i18n/                   # Internacionalização
│   └── translations.js     # PT / ES / EN / FR
└── pages/                  # Páginas/rotas

public/
├── brand/                  # Assets públicos de marca
│   ├── logo-mark.svg
│   ├── logo-mark-mono.svg
│   ├── logo-lockup.svg
│   └── logo-lockup-dark.svg
├── favicon.svg             # Ícone da marca (squircle laranja)
├── sitemap.xml             # ~58 URLs — regenerar com `npm run sitemap`
├── robots.txt
└── ...

scripts/
└── generate-sitemap.js     # Gera public/sitemap.xml
```

---

## 🎨 Design System da marca

### Identidade visual (nova, quente e terrosa)

A fonte da verdade dos tokens vive em **`src/styles/brand/`**. Importados de forma **aditiva**
no topo de `src/index.css` para expor os tokens sem sobrescrever o tema Tailwind.

#### Arquivos importantes
- `src/styles/brand/tokens/` — `fonts.css`, `colors.css`, `typography.css`,
  `spacing.css`, `radius.css`, `base.css`
- `src/styles/brand/index.css` — entry aditivo (tokens + fontes, sem reset)
- `src/styles/brand/styles.css` — entry completo e fiel do DS
- `src/styles/brand/fonts/` — Nunito variável (300–1000), self-hosted
- `public/brand/` — assets: `logo-mark.svg`, `logo-lockup.svg`, etc

### Paleta de cores

| Papel | Token | Hex |
|---|---|---|
| Primária — laranja queimado | `--orange-500` / `--brand-primary` | `#E8571A` |
| Secundária — terracota | `--orange-700` / `--terracotta` | `#C1440E` |
| Acento — verde-oliva | `--olive-500` / `--brand-secondary` | `#6B7C3A` |
| Fundo claro — areia | `--sand` | `#F2DEC4` |
| Fundo escuro — café escuro | near-black quente | `#1A1208` |
| Neutros (quentes, tintos de barro) | `--neutral-*` | Ex: `#241D16` |
| Semânticas | sucesso `#3E8E5A`, alerta `#E59A12`, erro `#D7382B`, info teal `#2D7D8A` |

**Regras:**
- Neutrals são **sempre quentes** (tingidos de barro), nunca cinza puro.
- Sombras são **quentes** (`rgba(56,47,38,…)`), nunca azul-acinzentadas.
- CTA primário leva brilho laranja (`--shadow-brand`).

### Como consumir no código

**Sempre referencie os aliases semânticos** (`--brand-primary`, `--surface-card`, `--text-body`…),
não os valores crus.

**Em Tailwind** (extensão aditiva em `tailwind.config.js`):
```jsx
<button className="bg-brand-primary text-white rounded-pill shadow-brand font-nunito font-bold">
  Encontrar profissional
</button>
```

**Utilities disponíveis:**
- Cores: `bg-orange-500`, `bg-olive-500`, `bg-sand`, `text-terracotta`, `bg-brand-primary`
- Raios: `rounded-pill`, `rounded-brand-lg`, `rounded-brand-md`, etc
- Sombras: `shadow-brand`, `shadow-warm-md`, etc
- Fonts: `font-nunito`, `font-display`

### Tipografia

- **Família única: Nunito** (variável 300–1000, self-hosted, sem fonte secundária)
  Terminais arredondados ecoam os cantos arredondados do design.
- **RESOLVE** — peso 900, uppercase, destaque máximo (único lockup all-caps)
- **Trancoso** — peso 700, tracking largo
- **Display/headings:** 900/800, tracking apertado (`-0.02em`)
- **Body:** 400, leading 1.65
- **Labels/botões:** 700
- **Eyebrows:** 700 uppercase, tracking `0.12em`

### Estilo & voz

- **Cantos arredondados em tudo.** Botões e chips: pílula (`--radius-pill`).
  Cards: `lg (20px)`. Raios de `xs 6px` até `2xl 36px`.
- **Voz:** descontraída e profissional — caloroso, de vizinho, confiante.
  Nunca corporativo. Sentence case (exceto "RESOLVE").
- **Ícones:** Lucide, stroke 2px, cantos arredondados. Sem emoji na UI.
- **Favicon:** squircle laranja com a igreja São João Batista simplificada.
- **Sabor local:** sempre mencionar Trancoso, o Quadrado, a Bahia, "pertinho de você".

---

## ⚙️ Arquitetura e padrões

### Roteamento (React Router v6)

O arquivo `App.jsx` define todas as rotas da aplicação usando `<Routes>` e `<Route>`.
Não há prefetch ou lazy loading configurado, mas o Vite faz code-splitting automático por rota.

**Exemplo:**
```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/destinos/:destination" element={<DestinationPage />} />
  <Route path="/admin/*" element={<AdminLayout />} />
</Routes>
```

### Autenticação

- Context armazenado em `lib/AuthContext.jsx`
- Estado persistido em `localStorage`
- Sem integração de OAuth/SSO (auth local)
- Proteção de rotas: verificar `user` no Context antes de renderizar

### State management

- **React Context** para user, theme, language (global light state)
- **TanStack Query** (`lib/query-client.js`) para cache de dados servidor
  - Consulte `@tanstack/react-query` nos imports
  - Configure `staleTime`, `cacheTime` conforme necessário
- **React Hook Form** para formulários
- **Zustand** ou Redux não utilizados

### Componentes UI

shadcn/ui com tema **new-york**, 51+ componentes em `src/components/ui/`:
- Button, Dialog, Form, Select, Combobox, etc
- Todos customizados com Tailwind e tokens da marca
- Importação: `import { Button } from '@/components/ui/button'`

**Regra:** componentes `ui/` são "headless" (sem lógica de negócio).
Lógica vive em `components/` (e.g., `components/admin/`, `components/providers/`).

### API e Base44 SDK

- **Base44 client:** `api/base44Client.js` — wrapper do SDK
- **Entities:** `api/entities.js` — mapeamento de tipos (User, Service, Provider, etc)
- **Integrations:** `api/integrations.js` — Stripe, webhooks, etc

**Padrão:** use a instância do client para CRUD e queries.
```javascript
import base44Client from '@/api/base44Client';
const users = await base44Client.query('User', { /* filters */ });
```

### Hooks customizados

- `use-mobile.jsx` — detecta viewport mobile
- `useDestinationSeo.js` — SEO completo para páginas de destino (title, og:*, twitter:*, canonical, schema JSON-LD)
- `useSEO.js` — SEO genérico para qualquer página (mesmo que useDestinationSeo mas sem schema)
- `usePullToRefresh.js` — pull-to-refresh em mobile

**Padrão:** crie novos hooks em `src/hooks/` com nomenclatura `useNomeDoHook.js`.

### Performance

- **Code-splitting:** Vite automaticamente separa por rota.
- **Image optimization:** `LazyImage.jsx` component com intersection observer.
- **Bundle chunks (manual):** `vite.config.js` agrupa vendor, ui, analytics, maps.
- **Lighthouse:** configurado em `lighthouserc.json` e `lighthouse-config.js`.
- **Analytics:** Vercel Analytics + Speed Insights (`lib/analytics.js`).

---

## 🏗️ Padrões de desenvolvimento

### Convenções de nomenclatura

- **Componentes:** PascalCase (`Button.jsx`, `AdminUserManagement.jsx`)
- **Hooks:** camelCase, prefixo `use` (`useDestinationSeo.js`)
- **Utilitários:** camelCase (`utils.js`, `accessibility.js`)
- **Páginas:** PascalCase, nomes descritivos (`Home.jsx`, `Dashboard.jsx`)
- **Classes CSS:** kebab-case (Tailwind)

### Estrutura de componentes

Componentes devem seguir este padrão:

```jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(null);

  const handleClick = () => {
    // logic
  };

  return (
    <div className="...">
      {/* markup */}
    </div>
  );
}
```

**Regras:**
- Props first, hooks second, handlers third, render last
- Sem TypeScript estrito; confie em nomes descritivos
- Prefira composition a abstracting prematuro
- Sem multi-line comments; uma linha max ou nada

### Importações

Use **path aliases** (definidos em `jsconfig.json`):
```javascript
import { Button } from '@/components/ui/button';       // ✅
import base44Client from '@/api/base44Client';         // ✅
import { getUser } from '@/lib/AuthContext';           // ✅
import Component from '../../../components/Button';    // ❌
```

### Estilo

- **Tailwind primeiro.** Use `className="..."` com utilities.
- **CSS modules** apenas para styles komplekso ou escopos.
- **Design tokens:** use `--brand-primary`, `--sand`, etc. em `style={}` se necessário.
- **Dark mode:** use classes `dark:` (e.g., `dark:bg-neutral-900`).

Exemplo:
```jsx
<button className="bg-brand-primary hover:bg-brand-primary-hover text-white rounded-pill px-6 py-2 font-bold shadow-brand dark:bg-neutral-800">
  Clique aqui
</button>
```

---

## 🌍 Internacionalização (i18n)

- Seletor de idioma no nav desktop e menu mobile
- Idiomas suportados: **PT / ES / EN / FR**
- Strings traduzidas em `src/i18n/translations.js`
- Cobertura atual: nav, footer, hero, categorias
- **TODO:** traduzir conteúdo das páginas internas

```javascript
// Consumo no componente
import translations from '@/i18n/translations';
const t = translations[currentLanguage];
<h1>{t.hero.title}</h1>
```

---

## 🧪 Testes e qualidade

### Linting

```bash
npm run lint       # ESLint (0 erros esperados)
npm run lint:fix   # ESLint auto-fix
npm run typecheck  # TypeScript check (JSX)
```

**Regras ativas:**
- `unused-imports/no-unused-imports` — erro
- `react-hooks/rules-of-hooks` — erro
- `react/prop-types` — off (sem PropTypes)
- `react/react-in-jsx-scope` — off (React 17+)

**CI/CD:** GitHub Actions em `.github/workflows/ci.yml` roda lint + build em todo PR.

### Testes automatizados

Atualmente **não há suíte de testes**. Dependências instaladas:
- `@testing-library/react`, `@testing-library/jest-dom`, `jest`, `jest-axe`

**TODO:** configurar e adicionar testes E2E / unit.

### Acessibilidade

- `lib/accessibility.js` — helpers para a11y
- `jest-axe` — disponível para auditorias automatizadas
- **Verificar:** contraste (laranja sobre areia), foco visível, labels semânticas

---

## 📊 Deployment e infraestrutura

### Hosting

- **Vercel** — deploy automático de `main`, preview em PRs
- `vercel.json` — configuração: rewrites para SPA, rewrite `/sitemap.xml`

### Build

```bash
npm run build
# Saída: dist/
```

**Chunks:** Vite agrupa automaticamente vendor, ui, analytics, maps (vide `vite.config.js`).

### Variáveis de ambiente

Nenhuma configurada explicitamente no `.env`. Verificar Vercel dashboard para secrets.

---

## 🐛 Problemas conhecidos e backlog

### Prioridade alta

1. **Sync GitHub ↔ Base44** — o app no Base44 (ID `68eb21726a9614db4a82ba99`)
   ainda usa `git_remote_source: s3`. Conectar GitHub nas Configurações do Base44,
   selecionar branch `main` e fazer pull.
   ⚠️ **NUNCA** push do Base44 → GitHub (sobrescreve migração de marca).

2. **QA visual das páginas** — rodar `npm run dev`, conferir claro/escuro
   em todas as rotas: Dashboard, Financeiro, Home, Chat, admin/*, destinos/*.

### Prioridade média

3. **~60 páginas não auditadas** — a maioria usa componentes compartilhados
   (já laranja), mas vale conferir individualmente.

4. **Traduções i18n incompletas** — cobrem nav, footer, hero, categorias;
   falta conteúdo interno das páginas.

5. **Bug: tarefas travadas em segundo plano** (documentado em `docs/bug-tarefas-segundo-plano.md`)

### Prioridade baixa

6. **App mobile** — citado como produto digital; ainda não iniciado.
7. **Testes automatizados** — sem suíte atualmente.
8. **Microcopy da marca** — aplicar voz consistente ("A gente resolve", sentence case).
9. **Acessibilidade** — auditar contraste, foco, labels semânticas.

---

## 🔍 SEO — estado atual (24/06/2026)

### O que já está no `main` (deployado na Vercel)

**PR #48** (commit `54701436`):
- `index.html` — schemas LocalBusiness (com `telephone`, `email`, `aggregateRating`, `sameAs` corretos), Organization, WebSite, FAQPage
- `public/robots.txt` — Googlebot/Bingbot otimizado
- `public/sitemap.xml` — 54 URLs (inclui `/destinos/casamento-trancoso`, `/destinos/reveillon-trancoso`, `/guides/morar-em-trancoso`, `/servicos/dj-trancoso`)
- `src/components/servicos/ServicoLocalPage.jsx` — FAQ schema + breadcrumb schema por página
- Novas páginas: `/servicos/dj-trancoso`, `/destinos/casamento-trancoso`, `/destinos/reveillon-trancoso`, `/guides/morar-em-trancoso`, 6 páginas de Arraial d'Ajuda

**PR #51** (commit `c0a411b`):
- `index.html` — `og:url`, `WebSite url`, `LocalBusiness @id/url` corrigidos para usar `www`; `<link rel="sitemap">` corrigido de `/api/functions/sitemap` → `/sitemap.xml`
- `public/sitemap.xml` — ~58 URLs (adicionados `/cadastro`, `/TermosDeServico`, `/PoliticaPrivacidade`, `/PoliticaDevolucoes`)
- `src/hooks/useDestinationSeo.js` — agora atualiza `og:url`, `twitter:title`, `twitter:description` e restaura tudo no unmount
- `src/hooks/useSEO.js` — **NOVO** hook genérico de SEO com cleanup completo para qualquer página
- `src/components/seo/SchemaMarkup.jsx` — **NOVO** componente para injeção de JSON-LD dinâmico por página
- `scripts/generate-sitemap.js` — **NOVO** script para regenerar sitemap (`npm run sitemap`)
- Páginas de destino — canonical corrigido: `/destinos/trancoso` → `/trancoso` (rota canônica real do router); idem para arraial-dajuda, porto-seguro, caraiva

### Regras críticas de SEO

- **URL canônica:** sempre usar `https://www.trancosoresolve.com.br` (com `www`)
- **Canonical das páginas de destino:** `/trancoso`, `/arraial-dajuda`, `/porto-seguro`, `/caraiva` (sem prefixo `/destinos/`)
- **Sitemap:** regenerar com `npm run sitemap` após adicionar novas páginas
- **Novos hooks disponíveis:** `useSEO` (genérico), `useDestinationSeo` (destinos), `SchemaMarkup` (JSON-LD por componente)

### Pendências SEO

- [ ] Criar imagem `public/og-image.jpg` (1200×630 px) para Open Graph
- [ ] Submeter `sitemap.xml` no Google Search Console
- [ ] Verificar/criar Google Business Profile para Trancoso Resolve
- [ ] Conectar Google Analytics ao Search Console

---

## 🔑 Fatos fixos da marca (MEMÓRIA)

> Cole aqui (e mantenha) os fatos que nunca mudam. Referência rápida para qualquer
> agente que tocar no projeto.

### 🎯 Público-alvo

- **Moradores** de Trancoso que precisam resolver serviços do dia a dia
- **Empresários e donos de imóvel locais** (pousadas, villas, comércio)
- **Turistas de alto padrão** hospedados na região
- **Idioma do produto:** português do Brasil (pt-BR)
- **Tom:** você (familiar, caloroso, de vizinho)

### 📝 Microcopy de referência

- **Hero:** "Encontre quem resolve, pertinho de você."
- **CTA:** "Encontrar profissional", "Pedir orçamento", "Sou profissional"
- **Confiança:** "Resposta em até 2 horas", "Avaliações reais", "Profissional verificado"
- **Vazio:** "Nada por aqui ainda. Que tal pedir seu primeiro orçamento?"

---

## 📚 Arquivos de referência

- **STATUS-DO-PROJETO.md** — snapshot do código, o que foi feito e o que falta
- **BROWSER_COMPATIBILITY.md** — suporte de browsers
- **TESTING_GUIDE.md** — guia de testes (manual por enquanto)
- **OPTIMIZATION_SUMMARY.md** — resumo de otimizações de performance

---

## 🎓 Dicas para novos assistentes

1. **Leia primeiro:** este arquivo (CLAUDE.md) + STATUS-DO-PROJETO.md
2. **Rode localmente:** `npm install && npm run dev`
3. **Inspecione:** componentes em `src/components/ui/`, páginas em `src/pages/`
4. **Confira:**
   - Design tokens em `src/styles/brand/tokens/colors.css`
   - Tailwind config em `tailwind.config.js`
   - Routes em `src/App.jsx`
   - Context em `src/lib/AuthContext.jsx`
5. **Quando tocar em:**
   - **UI:** use componentes shadcn/ui + Tailwind + tokens da marca
   - **Páginas:** crie em `src/pages/`, adicione rota em `App.jsx`
   - **Hooks:** crie em `src/hooks/` com prefixo `use`
   - **Serviços:** use `api/base44Client.js`
   - **Lógica:** prefira composição, evite abstrações prematuras
   - **Imagens:** use `LazyImage.jsx` component
   - **Internacionalização:** adicione string em `src/i18n/translations.js`
   - **SEO numa página nova:** use `useSEO` para páginas genéricas, `useDestinationSeo` para destinos, `SchemaMarkup` para JSON-LD adicional
6. **Commit messages:** em português, imperativo ("fix: corrige", "feat: adiciona")
7. **PRs:** deixe uma descrição em pt-BR explicando o "why", não apenas o "what"
8. **Branch protection em `main`:** push direto é bloqueado — sempre crie branch + PR + merge via API GitHub

---

---

## 🔄 Regra de merge e deploy (workflow automático)

> **Regra salva em 27/06/2026 — aplicar sempre que o usuário pedir para mergear/fazer deploy.**

### Quando um PR está pronto para mergear, execute esta sequência:

1. **Verificar pré-condições** (via `mcp__github__pull_request_read`):
   - CI verde: checks `Lint & Build` + `Vercel – Preview` com status `success`
   - `mergeable_state: clean` (sem conflitos)
   - Nenhum review pendente / changes requested bloqueando

2. **Se ainda draft:** marcar como ready for review (`mcp__github__update_pull_request` com `draft: false`)

3. **Mergear via squash** (`mcp__github__merge_pull_request` com `merge_method: squash`)
   - Título do commit: mesmo título do PR
   - Body: vazio ou resumo automático do GitHub

4. **Confirmar deploy Vercel:** aguardar alguns segundos e verificar se o workflow
   `Vercel – Production Deployment` foi disparado (ou confirmar na Vercel Dashboard)

5. **Repetir para todos os PRs abertos**, na ordem: mais antigo → mais novo

### Observações importantes

- **NUNCA** usar `merge_method: merge` (gera commit extra) — sempre squash
- **NUNCA** push direto em `main` — branch protection está ativa
- **NUNCA** push do Base44 → GitHub (sobrescreve migração de marca)
- Se um PR tiver CI falhando, investigar e corrigir antes de mergear
- Commit messages em português, imperativo ("fix: corrige", "feat: adiciona")
- Após mergear, o deploy Vercel dispara automaticamente via integração Git

---

**Última atualização:** 27/06/2026
