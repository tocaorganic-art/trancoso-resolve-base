# Trancoso Resolve — Status do Projeto

> Gerado em 10/06/2026. Snapshot do código equivalente ao `main` após o merge do PR #5.

---

## ✅ O que foi feito

### 1. Nova identidade visual (migração de marca completa)
- **Design system da marca** em `src/styles/brand/` — tokens de cor, tipografia,
  espaçamento, raio/sombra/motion, fonte Nunito variável self-hosted.
- **Paleta nova quente/terrosa**: laranja queimado `#E8571A` (primária), terracota
  `#C1440E`, verde-oliva `#6B7C3A`, areia `#F2DEC4`, café escuro `#1A1208`.
  Verde de sucesso `#3E8E5A`, alerta `#E59A12`, erro `#D7382B`, info teal `#2D7D8A`.
- **Logo novo**: mark squircle laranja com a igreja São João Batista simplificada
  (`public/brand/` + `src/styles/brand/assets/`), favicon novo, lockups claro/escuro.
- **Migração de ~220 arquivos**: todos os azuis/cyans/slates/purples/verdes-tailwind
  antigos substituídos por tokens da marca e tokens semânticos shadcn
  (`bg-brand-primary`, `text-foreground`, `bg-card`, `border-border`, `#3E8E5A`…).
- **Brand board + manual da marca** (kit da marca) incluídos no repositório.

### 2. Dark mode
- Toggle Sol/Lua no nav desktop e menu mobile.
- `AppContext` gerencia tema com persistência em `localStorage`.
- `index.css` com modo claro (fundo areia + laranja) e modo escuro (café escuro + laranja).

### 3. Internacionalização (i18n)
- Seletor de idioma **PT / ES / EN / FR** no nav e menu mobile.
- `src/i18n/translations.js` — strings traduzidas para nav, footer, hero e categorias.
- Persistência da escolha em `localStorage`.

### 4. Qualidade e infraestrutura
- **Lint zerado**: 270 erros → 0 erros (restam só warnings de variáveis não usadas).
- **CI no GitHub Actions** (`.github/workflows/ci.yml`): lint + build obrigatórios em PRs.
- **Code-splitting por rota** (performance) + correções de build e SEO.
- Emojis da UI substituídos por ícones Lucide (padrão da marca).

### 5. Git / GitHub
- PR #5 (migração de marca) **merged no `main`** em 10/06/2026.
- Branch de trabalho: `claude/new-session-yx9wk` (conteúdo idêntico ao `main`).

---

## ⏳ O que falta fazer

### Prioridade alta
1. **Sync GitHub → Base44** — o app no Base44 (ID `68eb21726a9614db4a82ba99`) ainda
   usa `git_remote_source: s3`. Conectar GitHub nas Configurações do Base44,
   selecionar branch `main` e fazer **pull do GitHub para o Base44**
   (⚠️ nunca push do Base44 → GitHub, senão sobrescreve a migração).
2. **Verificação visual (QA) das páginas migradas** — rodar `npm run dev` e conferir
   claro/escuro em todas as rotas, principalmente Dashboard, Financeiro, Home,
   Chat, admin/* e destinos/*.

### Prioridade média
3. **Páginas ainda não auditadas individualmente** (~60 páginas nunca tocadas na
   migração, a maioria já usa componentes compartilhados que foram migrados, mas
   vale conferir): páginas de auth, páginas legais (termos/privacidade),
   `servicos/*` (usam o `ServicoLocalPage` compartilhado, já laranja),
   `destinos/Trancoso.jsx` e `destinos/PortoSeguro.jsx`, algumas admin.
4. **Traduções i18n incompletas** — hoje cobrem nav, footer, hero e categorias;
   o restante do conteúdo das páginas ainda é só pt-BR.
5. **Limpar warnings de lint** (44 warnings de variáveis/imports não usados) e
   depois manter o gate estrito.

### Prioridade baixa / melhorias
6. **App mobile** — citado como produto digital da marca; ainda não iniciado.
7. **Testes automatizados** — o projeto não tem suíte de testes.
8. **Revisão de microcopy** — aplicar a voz da marca ("A gente resolve.",
   sentence case, "você") de forma consistente em todas as páginas.
9. **Acessibilidade** — contraste das combinações novas (laranja sobre areia),
   foco visível, labels.

---

## Comandos úteis

```bash
npm install        # instalar dependências
npm run dev        # Vite dev server
npm run build      # build de produção
npm run lint       # eslint (0 erros hoje)
npm run typecheck  # tsc -p ./jsconfig.json
```

Stack: React 18 + Vite + Tailwind + shadcn/ui (new-york) + Base44 SDK · Ícones Lucide · Fonte Nunito.
