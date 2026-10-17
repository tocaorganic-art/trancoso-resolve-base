# Relatório de Auditoria — Fluxos, SEO e Legibilidade

> Gerado em 16/10/2026. Auditoria completa do `trancoso-resolve-base`: saúde de
> engenharia, cards/imagens, fluxos E2E, SEO técnico nas páginas públicas,
> auditoria do que o `base44-builder[bot]` fez, e estratégia orgânica
> nacional. Metodologia de cada seção está marcada explicitamente —
> **exaustiva** (cobre 100% do universo relevante) ou **amostrada** (cobre
> uma fração representativa, com a amostra listada).

---

## 1. Bugs corrigidos nesta sessão

Todos mergeados via squash na `main`, PR aberto → CI verde → merge, nessa
ordem:

| PR | SHA do squash | O que corrigia |
|---|---|---|
| [#105](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/105) | `137217c8` | `vercel.json`: o rewrite catch-all mandava **todas** as rotas pra `/index.html`, ignorando os 47 arquivos HTML pré-renderizados por `scripts/prerender-head.js` (title/description/canonical/JSON-LD por rota). Adicionados 47 rewrites explícitos antes do fallback SPA. (Nota: hoje nenhum projeto Vercel vivo usa este arquivo — ver seção 6 — mas o bug era real e o código agora está correto para quando for usado.) |
| [#106](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/106) | `ae7df48f` | Nome do assistente de IA inconsistente: "TryA" e "TrIA" misturados na mesma página `/planos` ao vivo. Unificado para "TrIA" (grafia correta) em 23 ocorrências / 13 arquivos, incluindo o system prompt da IA e `assistantPersona.json`. |
| [#107](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/107) | `5b23d97b` | Bug de SEO introduzido pelo commit do Builder `914db2c6`: título de página de serviço descartava a marca "\| Trancoso Resolve" inteira quando passava de 60 caracteres, em vez de truncar a parte descritiva. Confirmado ao vivo em `/guides/morar-em-trancoso` (título sem marca). Corrigido e validado contra os 35 títulos reais do app. |
| [#108](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/108) | `5d337138` | Dois bugs de cards/imagens: (1) removidos `src/components/services/ServiceCard.jsx` e `src/components/home/ServiceCard.jsx` — código morto (zero imports) que usava uma única imagem de fallback hardcoded, exatamente o padrão de "imagem duplicada entre cards" que causaria o bug se reativado; (2) corrigido `buildImageAssignments()` em `src/pages/Home.jsx` — o round-robin de imagens por categoria já existia, mas categorias correlatas (limpeza/diarista/faxina, cozinheiro/chef/gastronomia) compartilham as mesmas fotos nas mesmas posições do pool, então dois serviços de categorias diferentes no mesmo lote podiam mostrar a mesma imagem. Agora rastreia URLs já usadas no lote inteiro. |

Todos os PRs: build limpo, lint sem erros novos, 11/11 testes `node --test`
passando, CI do GitHub Actions verde antes do merge.

### Outros problemas de engenharia verificados (sem bug novo)

- `npm run build` (inclui `node scripts/prerender-head.js`): limpo, 47 rotas pré-renderizadas.
- `npm run lint`: **0 erros**, 46 warnings pré-existentes (variáveis não usadas, nenhuma nova introduzida nesta sessão — não mexido, é débito técnico de baixa prioridade).
- `npm test` (`node --test`): 11/11 passando.
- `npx tsc --noEmit --skipLibCheck -p ./jsconfig.json`: **0 erros**. A dívida de ~2.000 erros mencionada em sessões anteriores não existe mais — parece já ter sido resolvida numa auditoria anterior, ou o escopo do `jsconfig.json` (`checkJs:false`, `include` restrito a `src/components/**/*.js`, `src/pages/**/*.jsx`, `src/Layout.jsx`) já era limitado o suficiente para não pegar esses erros.
- Varredura de segredos hardcoded (chaves AWS/Google/Stripe, JWT, private keys, `.env` rastreado): **nada encontrado**.

---

## 2. Cópia de fallback na Vercel — achado crítico, ação pendente do Tony

Investigação completa (metodologia: headers HTTP + Vercel MCP + GitHub API):

- O domínio oficial `trancosoresolve.com.br` **não usa Vercel**: é servido via
  Cloudflare → Render/uvicorn, infraestrutura do Base44. Confirmado pelos
  headers (`rndr-id`, `x-render-origin-server: uvicorn`, `via: 1.1 Caddy`,
  nenhum `x-vercel-id`).
- Existe um projeto Vercel chamado **`trancoso-resolve`**
  (`prj_g8pBVgiu6I1hCI4xuDvQ3WLdZcxq`), acessível publicamente em
  `trancoso-resolve.vercel.app` (HTTP 200, **sem** parede de autenticação,
  `robots.txt` libera Googlebot/Bingbot — **indexável**).
- Esse projeto está conectado ao repositório **espelho antigo**
  `tocaorganic-art/trancoso-resolve` (descrição no GitHub: "Base44 App:
  Trancoso Resolve"), gerenciado pelo Base44, parado no commit
  `34e212721bd906e075b0d92efe89c60a5cf7c555` de **23/08/2026** — bate com a
  data em que os créditos do Base44 acabaram.
- O conteúdo dessa cópia mostra **oferta errada e desatualizada**: "30 dias
  grátis" (não 2 meses), R$19,90/R$89/R$197/R$497 por mês (não R$59,90),
  "100 prestadores" atrelado ao preço errado. Confirmado lendo o código-fonte
  do repo espelho naquele commit (`src/pages/Planos.jsx`).
- **Risco real:** como está público e indexável, o Google pode indexar essa
  cópia com oferta errada, competindo com o domínio oficial.

**O que tentei e o bloqueio:** as ferramentas MCP da Vercel disponíveis
(`create_git_project`, `update_project`) **não permitem trocar o
repositório git de um projeto já existente** — `create_git_project`
documenta explicitamente que não reconecta um projeto existente a outro
repo. A troca só é possível pelo dashboard da Vercel (Settings → Git →
Disconnect → Connect novamente, apontando pro
`tocaorganic-art/trancoso-resolve-base`, branch `main`). Já passei o passo
a passo pro Tony no chat; ele está fazendo isso manualmente.

**Assim que o link for trocado**, falta: (1) disparar redeploy de produção a
partir do HEAD atual da main, (2) confirmar oferta correta ao vivo na cópia,
(3) checar se os endpoints `/functions/` respondem lá (não devem — o
backend roda só no Base44; a cópia vira só vitrine estática, sem checkout
funcional, isso precisa ficar claro pro Tony), (4) adicionar `noindex` na
cópia pra não competir no Google, (5) sugerir um webhook/CI pra manter a
cópia sincronizada automaticamente a cada merge na main, pro Tony aprovar.
**Nenhuma dessas ações foi feita ainda** — aguardando o Tony confirmar que
trocou o repo no dashboard.

---

## 3. Fluxos E2E testados (amostrado — sessão logada como admin)

**Metodologia:** testado como usuário real via navegador (`claude-in-chrome`),
usando uma sessão já autenticada como admin fornecida pelo Tony. Cobertura:
cadastro (`/register`), seleção de tipo de conta (`/CadastroTipo`), Dashboard
do prestador, criação de novo serviço (`/MeusServicos` → modal "Novo
Serviço"), Fila de Verificação (admin), Dashboard de Pagamentos (admin),
Gestão de Usuários (admin). **Não testado nesta sessão** (ficou pra próxima
rodada, por tempo): checkout/assinatura Asaas até o fim, fluxo completo de
verificação de documento/antecedentes, fluxo lojista (criar anúncio,
DashboardLojista), AdminAntecedentes, AdminMetricas, CampanhaRegional.

### Achados

1. **15+ usuários com tipo "indefinido"** na Gestão de Usuários (de 50
   cadastrados). O fluxo de cadastro não força o usuário a passar por
   `/CadastroTipo` antes de navegar livremente pelo app — quem cadastra via
   Google OAuth ou e-mail e fecha a aba antes de escolher "Cliente/Prestador/
   Lojista" fica permanentemente com tipo indefinido. **Sugestão:** gate de
   rota que redireciona qualquer usuário com tipo indefinido para
   `/CadastroTipo` antes de liberar o resto do app. Não implementado ainda —
   é mudança de fluxo de navegação, prefiro validar com o Tony antes.

2. **Dashboard do prestador mostra "Receita Total: R$ 50.100,00" mas "0
   clientes no total" e "0 solicitações pendentes".** Investiguei o código
   (`src/pages/Dashboard.jsx`): `totalReceita` vem da entidade `Transaction`
   (histórico completo), enquanto os outros contadores vêm de
   `ServiceRequest` filtrado por status atual — são fontes de dados
   diferentes, não é bug de código. A inconsistência visual provavelmente
   vem de dado de teste/seed na conta `suporte@trancosoresolve.com.br`
   (criada ontem, 15/10/2026). **Não é uma correção de código** — é uma
   limpeza de dado de teste em produção, sinalizando pro Tony decidir.

3. **`AdminPagamentos` mostra um modelo de split "Comissão Plataforma
   (20%)"** com transações de exemplo (`R$ 29,90 → R$ 23,92 prestador / R$
   5,98 plataforma`), o que **contradiz diretamente** a promessa pública
   atual "Sem comissão sobre os serviços... você fica com 100% do valor"
   (texto literal em `/planos`). O valor R$29,90 nessas transações de
   exemplo bate com o modelo de preço **antigo** (pré-pivô pra assinatura
   sem comissão) — mesmo padrão encontrado no código morto do
   `PromotionalBanner.jsx` (item 5 abaixo). Minha leitura: é tela/dado
   legado de um modelo de negócio anterior, não uma comissão realmente
   cobrada hoje — mas **não decidi mexer sozinho** porque toca modelo de
   negócio/pagamento. Recomendo o Tony confirmar se esse split de 20% ainda
   existe de verdade no backend (`base44/functions/`) ou se é só UI órfã.

4. Formulário de cadastro (`/register`) e seleção de tipo
   (`/CadastroTipo`) renderizam bem, contraste bom à vista (tema escuro,
   texto branco sobre fundo marrom escuro, CTA laranja). Modal "Novo
   Serviço" também — campos claros, foco visível (borda laranja).

5. Fila de Verificação e Dashboard de Pagamentos carregam corretamente
   (demoraram alguns segundos — sem feedback de progresso além do spinner,
   não é bug, é só uma oportunidade de UX menor).

---

## 4. SEO técnico — auditoria exaustiva (parser HTML real, 84 URLs públicas)

**Metodologia:** script Node (`fetch` + parser por atributo, não grep cru)
rodado contra as 84 URLs reais listadas no pedido original, direto no site
ao vivo. Extrai `title`, `meta description`, `canonical`, `robots`,
`og:title`, `og:image`, contagem de `<h1>`, validade de cada bloco
JSON-LD, e contagem de `alt="Imagem Trancoso Resolve"` (fallback genérico).
**Isso cobre 100% das URLs da lista**, diferente da auditoria visual (seção
5), que é amostrada.

### Resumo agregado

- 57 páginas indexáveis (`robots: index, follow`), 32 corretamente
  `noindex, nofollow` (admin, dashboards, login/cadastro, páginas internas).
  **Nenhuma página privada vazando pra indexação, nenhuma página pública
  bloqueada por engano.**
- **0 títulos duplicados, 0 descriptions duplicadas** entre as 84 páginas.
- **0 títulos acima de 60 caracteres.**
- Todas as páginas têm exatamente **1 `<h1>`**.
- JSON-LD: 6-7 blocos válidos por página, **0 blocos inválidos** em
  qualquer página.
- **0 ocorrências** de `alt="Imagem Trancoso Resolve"` (fallback genérico)
  no HTML estático — ressalva: isso cobre só o HTML servido antes da
  hidratação; imagens trocadas via JS depois não entram aqui.

### Bugs confirmados (não corrigíveis neste repo — ver seção 6)

- **7 páginas com meta description/og:title truncados no apóstrofo de
  "Arraial d'Ajuda"**: `/arraial-dajuda`, `/servicos/diarista-arraial-dajuda`,
  `/servicos/eletricista-arraial-dajuda`, `/servicos/piscineiro-arraial-dajuda`,
  `/servicos/cozinheiro-arraial-dajuda`, `/servicos/jardineiro-arraial-dajuda`,
  `/servicos/pedreiro-arraial-dajuda`. Exemplo real:
  description = `"Diarista em Arraial d"` (21 caracteres, cortada no meio do
  nome do destino). O texto completo e correto **existe no código-fonte
  React** (confirmei em `CozinheiroArraialDajuda.jsx` e outros) — a
  truncagem acontece no sistema de snapshot de SEO do Base44 (provável bug
  de atributo HTML delimitado por aspas simples que fecha prematuramente no
  apóstrofo). `<title>` não é afetado (é texto de tag, não atributo); `og:title`
  é afetado (é atributo, mesmo padrão do bug).
- **Conteúdo duplicado entre rotas maiúsculas e minúsculas**:
  `/SejaPrestador` vs `/seja-prestador`, `/Planos` vs `/planos`, `/About` vs
  `/sobre`, `/Contact` vs `/contato`, `/ComoFunciona` vs `/como-funciona`,
  `/TermosDeServico` vs `/termos-de-servico`, `/PoliticaPrivacidade` vs
  `/politica-privacidade`, `/PoliticaDevolucoes` vs `/politica-devolucoes`.
  Ambas as versões retornam 200, mesmo título/descrição, e **cada uma
  autocanonicaliza pra si mesma** (`/SejaPrestador` → canonical
  `/SejaPrestador`; `/seja-prestador` → canonical `/seja-prestador`) em vez
  de uma apontar pra outra. Confirmei que isso **não vem do código deste
  repo**: os hooks `useSEO`/`useDestinationSeo` recebem canonical explícito
  por prop, não derivado da URL da requisição — é o sistema de snapshot do
  Base44 gerando por cima, independente do componente React real.
- **`sitemap.xml` desatualizado**: lista as 10 URLs maiúsculas antigas
  (`/`, `/ServicosCategoria`, `/SejaPrestador`, `/ComoFunciona`, `/Planos`,
  `/About`, `/Contact`, `/TermosDeServico`, `/PoliticaPrivacidade`,
  `/PoliticaDevolucoes`) só nas 52 URLs do arquivo, mas **14 páginas
  minúsculas indexáveis não estão no sitemap**: `/como-funciona`,
  `/seja-prestador`, `/planos`, `/sobre`, `/contato`, `/ajuda`, `/seguranca`,
  `/politica-privacidade`, `/politica-devolucoes`, `/termos-de-servico`,
  `/termos-de-uso`, `/servicos`, `/gerador-de-imagem`, `/configuracoes`.
  `scripts/generate-sitemap.js` existe neste repo mas não necessariamente é
  o que gera o `sitemap.xml` realmente servido (mesma situação do
  `prerender-head.js` — o domínio oficial não usa o build deste repo
  diretamente).

### Oportunidades (não são bugs, baixa prioridade)

- 22 títulos abaixo de 40 caracteres (ex.: `/` = "Trancoso Resolve", 16
  caracteres, sem palavra-chave; vários `/servicos/*` com título curto tipo
  "Chef em Trancoso \| Trancoso Resolve"). Título ideal é 50-60 caracteres —
  esses funcionam, mas desperdiçam espaço de SERP. A home (`/`) é a maior
  oportunidade perdida: comparado ao título de `/trancoso` ("Serviços em
  Trancoso, BA \| Profissionais Verificados \| Trancoso Resolve"), `/` é
  genérico.
- 2 descriptions acima de 160 caracteres (`/servicos/seguranca-trancoso`
  167, `/servicos/eletricista-porto-seguro` 163) — corte quase imperceptível
  no Google, não prioritário.

---

## 5. Legibilidade visual — amostrada por template

**Metodologia:** não é viável, nem o pedido original considerou razoável,
testar as 84 URLs × 2 temas × 2 viewports exaustivamente com navegador (320
estados). Em vez disso, amostrei **por template/componente compartilhado**:
páginas de serviço×cidade reusam `ServicoLocalPage`, destinos reusam o
mesmo template de destino, etc. — testar 1 instância de cada template dá
sinal real sobre bugs de legibilidade sem repetir trabalho 30x no mesmo
componente.

### Cobertos nesta sessão

- `/planos` (logado, tema padrão): oferta renderiza certo, contraste bom.
- `/register`, `/CadastroTipo`: contraste bom, CTA laranja legível.
- `/Dashboard`, `/AdminUserManagement`, `/FilaVerificacao`,
  `/AdminPagamentos`, `/MeusServicos` (+ modal "Novo Serviço"): todos com
  contraste adequado no tema escuro padrão.

### Não cobertos nesta sessão (pendente de próxima rodada)

Modo claro em qualquer página (só testei no tema que a sessão logada já
estava), viewport 390px, marca d'água (`body::before` em `src/index.css`,
linha ~218) sobre texto em ambos os temas, hero/banners com overlay, estados
de hover/foco/desabilitado. **Não afirmo cobertura aqui — isso fica como
pendência explícita, não como "auditado e aprovado".**

### Achado de código (sem verificação visual ainda)

`src/components/providers/ProviderCard.jsx` usa cores 100% hardcoded
(`bg-[#1a1a2e]`, `text-[#9ca3af]`, `text-[#d1d5db]` etc.), zero tokens
semânticos do design system, zero variantes `dark:`. O card é sempre escuro
independente do tema ativo do site. Pode ser intencional (cartão de
prestador com visual fixo tipo "cartão de visita") ou pode ser um
esquecimento de migração pros tokens semânticos — **não decidi sozinho
porque não verifiquei visualmente no modo claro ainda**. Fica como item de
prioridade média pra próxima rodada.

---

## 6. Itens que só o Base44 resolve

- **Truncamento de apóstrofo** em meta description/og:title das páginas de
  Arraial d'Ajuda (seção 4) — bug no sistema de snapshot de SEO do Base44,
  não no código React.
- **Canonical duplicado** entre rotas maiúsculas/minúsculas legadas (seção
  4) — mesmo sistema de snapshot, gerando canonical a partir da URL
  requisitada em vez de normalizar pra uma única versão.
- **`sitemap.xml` real servido em produção** não bate com
  `scripts/generate-sitemap.js` deste repo nem reflete as rotas minúsculas
  atuais — precisa ser regenerado/corrigido no lado do Base44 (ou
  confirmado se é esse mesmo arquivo que está sendo servido).
- **Religar/sincronizar a cópia Vercel de fallback** (seção 2) — ação de
  dashboard, exclusiva do Tony.
- **Publish do conteúdo atual pro domínio oficial** — já feito pelo Tony
  durante esta sessão (confirmei preço R$59,90 + 2 meses grátis + 100 vagas
  corretos ao vivo em `/planos` depois do publish).

---

## 7. Auditoria do que o `base44-builder[bot]` fez

550 commits do bot no histórico — inviável revisar um por um. Foquei no
commit citado pelo Tony e nos commits recentes (últimos 30 dias) que tocam
`src/`:

- **`914db2c6`** ("Otimizar SEO das páginas de serviço e imagens"): a maior
  parte está correta (clamp de description, `aria-hidden` no ícone
  decorativo, novo `<h2>` melhorando hierarquia). **1 bug real encontrado e
  corrigido** (PR #107 — título perdia a marca).
- **`4a36042d`** ("Refactor legacy integrations and update assistant
  components", hoje): deleta `src/api/integrations.js` inteiro e migra os
  componentes que o usavam pra `base44.functions.invoke('iaCreditada', ...)`.
  Confirmei por grep que **nenhum arquivo ainda importa** o arquivo
  deletado — refactor limpo, build passa. Sem ação necessária. Efeito
  colateral notado: `src/components/assistant/PublicAssistant.jsx` e
  `VirtualAssistant.jsx` (pasta em inglês, diferente da pasta
  `src/components/assistente/` com os componentes TrIA reais) continuam
  **sem nenhum import em lugar nenhum do app** — código morto também,
  internamente usam o nome "Toca" (não "TrIA") no prompt, mas como não
  renderizam pra ninguém, baixa prioridade. Candidatos a limpeza futura
  junto com o `PromotionalBanner.jsx` morto.
- **`src/components/PromotionalBanner.jsx`**: código morto (zero imports),
  mas contém oferta **errada** hardcoded ("R$ 29,90" "Mês Inaugural", "R$
  49,90/mês") e duplica a mesma imagem Unsplash entre 2 dos 4 banners. Como
  está morto, não há exposição ao vivo — mas é uma armadilha se alguém
  reativar sem perceber. **Não decidi sozinho** (mexe em texto de
  oferta/preço, mesmo em código morto) — pergunta pro Tony: deleta o arquivo
  ou corrige os valores?
- **Referências a Mercado Pago/Stripe** (sinalizado, nada tocado): 14
  arquivos — `base44/entities/{LogPagamento,Payment,Plan,
  ProviderMercadoPagoAccount,ProviderStripeAccount,Subscription,
  WebhookEvent}.jsonc`, `base44/functions/{asaasWebhook,cancelarAssinatura,
  mercadoPagoWebhook,stripeWebhook,verificarVencimentos}/entry.ts`,
  `src/pages/AdminPagamentos.jsx` (campo de busca `stripe_payment_intent_id`).
  Existe um `base44/functions/stripeWebhook/entry.ts` **além** do
  `mercadoPagoWebhook` que o Tony já sabia — achado novo, registrado aqui,
  não tocado. (As menções a "stripe" em `InvestorHero.jsx` e
  `data/investors/content.js` são falso-positivo — "stripe" ali é o
  elemento visual de design "faixa de credenciais", não o gateway de
  pagamento.)

---

## 8. Estratégia orgânica nacional (plano, não implementado)

Baseado nos achados acima: a maior lacuna real não é técnica (o SEO técnico
está muito bem cuidado — 0 duplicatas, 0 JSON-LD inválido, noindex correto),
é de **alcance pra quem busca de fora de Trancoso**.

- **Hubs de conteúdo sugeridos** (títulos prontos): "Guia completo de
  manutenção de casa de praia à distância em Trancoso", "Checklist de
  mudança: o que resolver antes de morar em Trancoso" (expandir o já
  existente `/guides/morar-em-trancoso`), "Serviços essenciais para quem tem
  pousada ou villa em Trancoso" — este último conecta direto com o público
  de donos de imóvel que o produto já mira.
- **Links internos serviço×cidade×destino**: as páginas de serviço já
  existem (30 páginas), mas não encontrei links cruzados automáticos entre
  elas e as páginas de destino (`/trancoso`, `/arraial-dajuda` etc.) nem
  entre serviços da mesma cidade. Adicionar uma seção "outros serviços em
  {cidade}" em `ServicoLocalPage.jsx` resolveria páginas órfãs.
- **Conteúdo único de 300+ palavras por página serviço×cidade**: a maioria
  das descriptions (140-160 chars) está ótima, mas não confirmei se o corpo
  da página (`seoText` em `ServicoLocalPage.jsx`) bate 300+ palavras em
  todas as 30 páginas — fica como item de verificação pra próxima rodada.

---

## 9. Dívida técnica (não corrigida, catalogada)

- 46 warnings de lint (variáveis não usadas) espalhados em ~25 arquivos —
  pré-existentes, nenhum novo introduzido.
- Dois componentes `ServiceCard` órfãos já removidos (PR #108); ainda
  restam `PublicAssistant.jsx`, `VirtualAssistant.jsx` e
  `PromotionalBanner.jsx` como código morto candidato a limpeza.
- `AdminPagamentos` com linguagem de split de comissão (20%) desalinhada da
  oferta atual (sem comissão) — precisa decisão do Tony, não é só código.
- `sitemap.xml`/`scripts/generate-sitemap.js` deste repo podem não ser a
  fonte real do que é servido em produção — mesma situação do
  `prerender-head.js`, vale confirmar com o Base44.

---

## 10. Validação final

- `npm run build`: limpo, 47 rotas pré-renderizadas.
- `npm test`: 11/11.
- `npx eslint .`: 0 erros.
- `gh pr list --state open` (no momento deste relatório): nenhum PR
  pendente de merge desta auditoria.
- PRs mergeados (squash), em ordem: #105 (`137217c8`), #106 (`ae7df48f`),
  #107 (`5b23d97b`), #108 (`5d337138`).
- Pendências que dependem do Tony: religar/sincronizar cópia Vercel (seção
  2), decidir sobre `PromotionalBanner.jsx` morto (seção 7), confirmar
  split de 20% em `AdminPagamentos` (seção 3), e os itens que só o Base44
  resolve (seção 6).

---

## 11. Rodada 2 (17/10/2026)

> Continuação da rodada 1, completando os itens pendentes de
> `docs/RELATORIO-MELHORIAS-FLUXOS.md`. Preparação: `git checkout main &&
> git pull` (HEAD `f021afb4`), `npm ci`, `npm run build` — build verde, 68
> funções `base44/functions/`, arquivos críticos confirmados presentes
> (`facebook-pixel.ts`, `whatsapp-templates.ts`, `utils/index.js`, todos os
> `entry.ts`). Item "cópia de fallback Vercel" (seção 2) já estava
> resolvido pelo próprio Tony antes do início desta rodada (PR #110,
> `f021afb4`).

### PRs mergeados (squash), em ordem

| PR | SHA do squash | O que corrigia |
|---|---|---|
| [#111](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/111) | `0860ff97` | Remove código morto confirmado (zero imports): `PromotionalBanner.jsx` (oferta desatualizada R$29,90/R$49,90), `PublicAssistant.jsx`, `VirtualAssistant.jsx` (nome antigo "Toca"). |
| [#112](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/112) | `2077f85a` | Investigação do split "Comissão Plataforma 20%" em `AdminPagamentos`: confirmado que é só UI legada — backend fixa `platformFee = 0` desde a migração Asaas (12/09/2026), prestador recebe 100%. Removida a linguagem desatualizada da tela. Backend não alterado. |
| [#113](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/113) | `7edd9f7a` | Gate de rota pós-cadastro: usuário autenticado sem role admin e com `user_type` indefinido é redirecionado para `/CadastroTipo` em 13 rotas do app (`/Dashboard`, `/MeusPedidos`, `/MeuPerfilPrestador`, `/MinhaAgenda`, `/MeusServicos`, `/DashboardLojista`, `/Financeiro`, `/Chat`, `/Assistentevirtual`, `/Recomendador`, `/configuracoes`, `/VerificacaoDocumento`, `/VerificacaoAntecedentes`). Causa raiz: `MeusPedidos.jsx` e `Chat.jsx` nunca tiveram a checagem que `Dashboard`/`MeusServicos`/etc já tinham via `PermissionChecker`. |
| [#114](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/114) | `c2742c31` | **Achado na verificação ao vivo** (fora do escopo original): `Layout.jsx` sobrescrevia `document.title`/meta tags com fallback genérico em qualquer rota fora de um mapa fixo, destruindo o título correto do HTML pré-renderizado em `/guides/*`, páginas de destino e outras. Reproduzido ao vivo em `/guides/morar-em-trancoso`. |
| [#115](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/115) | `d75a15ba` | Mais um componente morto (mesmo padrão do #111): `HeroBanner.jsx`, zero imports, preços desatualizados (R$29,90/R$49,90/R$79,90) vs. os reais (R$59,90/R$197). |
| [#116](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/116) | `294c453a` | 16 `metaDescription` acima de 160 chars (medição atual, mais que as 2 originalmente reportadas) encurtadas; 2 títulos abaixo de 40 chars (`DiaristaCaraiva`, `PedreiroCaraiva`) expandidos para 50-60 chars. |
| [#117](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/117) | `807c8542` | Bug de contraste reproduzido ao vivo: botões `variant="outline"` + `text-white` ficavam ilegíveis (texto branco sobre fundo quase branco) no tema claro, em 13 lugares incluindo as 4 páginas de destino. Mais 2 componentes com cores hardcoded sempre escuras trocados por tokens semânticos. |
| [#118](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/118) | `970924fd` | Conteúdo único de 300+ palavras adicionado nas 32 páginas serviço×cidade (todas estavam entre 122-174 palavras). |
| [#119](https://github.com/tocaorganic-art/trancoso-resolve-base/pull/119) | `5d05484c` | 7 ocorrências reais de travessão em texto visível removidas (regra do Tony), incluindo uma introduzida por engano no próprio PR #112 desta rodada. |

### Tarefa 2 — investigação do split 20%

Backend (`base44/functions/criarPagamentoServico/entry.ts:146`) fixa
`const platformFee = 0; // COMISSÃO ZERO` desde a migração para Asaas
(12/09/2026). A UI de `AdminPagamentos.jsx` ainda mostrava "Comissão
Plataforma (20%)" / "Prestador (80%)", contradizendo a oferta pública
atual. Corrigido no PR #112. **Nota separada (não é código):** a rodada 1
já sinalizava uma transação de teste em produção com valores do modelo
antigo (R$29,90 → R$23,92/R$5,98) — isso é limpeza de dado, continua
pendente de decisão do Tony.

### Tarefa 3 — usuários com `user_type` indefinido

Consultados via Base44 (`User` entity, `query_entities`): **15 usuários**
com `user_type` indefinido no momento desta auditoria (id, e-mail
mascarado, data de criação). Nenhum foi alterado ou removido.

| ID | E-mail (mascarado) | Criado em | Observação |
|---|---|---|---|
| `6ab2af83...` | to\*\*\*@gmail.com | 22/09/2026 | role `admin` — não é "quebrado", admin não passa pelo gate |
| `6aa5f6c7...` | to\*\*\*@gmail.com | 13/09/2026 | conta de teste (`+asaasteste`) |
| `6aa5f6b3...` | to\*\*\*@gmail.com | 13/09/2026 | conta de teste (`+asaas`) |
| `6aa1be69...` | au\*\*\*@uberip.com | 09/09/2026 | parece conta de bot/auditoria |
| `6a9c69bd...` | au\*\*\*@trancosoresolve-audit-20260905.com | 05/09/2026 | conta de auditoria de rodada anterior |
| `6a8dc2a8...` | ch\*\*\*@uxua.com | 25/08/2026 | usuário real |
| `6a858ddb...` | lu\*\*\*@gmail.com | 19/08/2026 | usuário real |
| `6a7c86db...` | ge\*\*\*@gmail.com | 12/08/2026 | usuário real |
| `6a79b48d...` | wi\*\*\*@gmail.com | 10/08/2026 | usuário real |
| `6a7344ee...` | ca\*\*\*@yahoo.com.br | 05/08/2026 | usuário real |
| `6a3f631a...` | co\*\*\*@tocaexperience.com.br | 27/06/2026 | e-mail institucional (Toca Experience) |
| `68ed6539...` | so\*\*\*@gmail.com | 13/10/2025 | usuário real |
| `68ec1282...` | is\*\*\*@gmail.com | 12/10/2025 | usuário real |
| `68ebc252...` | gr\*\*\*@gmail.com | 12/10/2025 | usuário real |
| `68ebbc53...` | ja\*\*\*@gmail.com | 12/10/2025 | usuário real |

Pelo menos 4 das 15 são contas de teste/auditoria de rodadas anteriores,
não usuários finais reais. O gate do PR #113 impede que o número cresça;
estes 15 continuam com tipo indefinido até logarem de novo e passarem
pelo `/CadastroTipo` (ou até o Tony decidir agir sobre eles — nada foi
alterado por conta própria).

**Limitação de teste:** não foi possível rodar o teste end-to-end
"cadastrar, fechar antes de escolher tipo, logar de novo" em ambiente
real porque o cadastro exige confirmação por OTP de e-mail
(`Register.jsx`), e este ambiente não tem acesso a uma caixa de entrada
real. Recomendo um teste manual rápido do Tony.

### Tarefa 4 — cards alt/width/height

Auditados `ProviderCard`, `AnuncioCard`, `PlanCard`, `CategoryCard`,
`EventCard`, grid de serviços da Home e `BannerRotativo`. Todos já usam
`LazyImage` (ou `<img>` com `width`/`height` explícitos no caso do
`BannerRotativo`) dentro de containers com altura/largura fixa via
Tailwind, o que já previne CLS mesmo sem atributo `width`/`height` no
próprio `<img>`. Nenhuma correção necessária além do `HeroBanner.jsx`
morto removido no PR #115.

### Tarefa 5 — fluxos E2E

**Não foi possível completar os 4 fluxos completos** (cliente, prestador
com checkout Asaas, lojista, admin) como usuário real porque:
- Cadastro exige OTP de e-mail (sem caixa de entrada real disponível).
- Criar uma conta de teste real e avançar até o checkout Asaas teria
  efeito colateral em produção (conta real, possível e-mail/webhook
  disparado) sem autorização explícita para esse tipo de ação.

O que foi verificado com a sessão já autenticada do Tony (leitura, sem
nenhuma ação destrutiva): `/MeusPedidos` carrega corretamente com dados
reais e não é afetado indevidamente pelo gate do PR #113. Observação
secundária, fora do escopo desta rodada, não corrigida: os cards de
pedido mostram "Prestador: Carregando..." que nunca resolve para o nome
real — vale investigar numa próxima rodada.

### Tarefa 6 — legibilidade modo claro + 390px

**Achado real, corrigido no PR #117:** botão "Como funciona?" em
`/SejaPrestador` (e mais 12 ocorrências do mesmo padrão, incluindo as 4
páginas de destino) com texto branco sobre fundo quase branco no tema
claro — reproduzido ao vivo com screenshot e zoom. Causa: `variant="outline"`
do shadcn/ui usa `bg-background` (branco no claro), e o override local só
trocava a cor do texto. Também corrigidos 2 componentes com cores
hardcoded sempre escuras (`ProviderGrid.jsx`, `MultilingualAutocomplete.jsx`).

`ProviderCard` revisado no código: cores hardcoded escuras (`bg-[#1a1a2e]`,
`text-white`) são **internamente consistentes** (fundo escuro + texto
claro = contraste correto), não ficam ilegíveis no tema claro, só não
usam tokens semânticos. Como o critério do Tony era "se ficar ilegível,
corrija", não alterado.

**Limitação de teste:** não foi possível validar no viewport exato
390×844 — a ferramenta de automação de browser desta sessão
(`resize_window`) não alterou o `window.innerWidth` real da página
(confirmado via JS: ficou em 911px mesmo após redimensionar a janela).
A auditoria de contraste foi feita no viewport disponível (~911px), nos
dois temas, nas páginas públicas acessíveis sem login. Recomendo
confirmação manual do Tony no celular.

### Tarefa 7 — SEO complemento

1. **Conteúdo único 300+ palavras:** todas as 32 páginas serviço×cidade
   estavam abaixo de 300 (122-174). PR #118 adiciona 2-3 parágrafos
   únicos por página (menor resultado: 302 palavras; maior: 362).
2. **Títulos:** só 2 páginas estavam genuinamente abaixo de 40 chars
   (`DiaristaCaraiva`, `PedreiroCaraiva`), corrigidas no PR #116. O
   título da home já estava em 56 chars (dentro de 50-60) — a
   expectativa de "maior oportunidade" do pedido original parece já ter
   sido endereçada em rodada anterior.
3. **Meta descriptions:** medição atual achou **16** páginas acima de
   160 chars (não as 2 originalmente reportadas — o conteúdo cresceu
   desde a rodada 1). Todas as 16 corrigidas no PR #116.

### Tarefa 8 — verificação ao vivo (sem Publish)

Produção (`trancosoresolve.com.br`) verificada via browser real:
- `/` e `/Planos`: título com marca, "TrIA" (não "Toca"), oferta "2 meses
  grátis" e "sem comissão" consistentes com o código.
- `/guides/morar-em-trancoso`: **achado crítico** (ver PR #114) — título
  ficava genérico ("Trancoso Resolve") após a hidratação, mesmo com o
  HTML pré-renderizado correto. Causa raiz identificada e corrigida.
- `/SejaPrestador`: **achado crítico** (ver PR #117) — botão "Como
  funciona?" ilegível no tema claro.
- Produção já refletia a `main` no momento da verificação (Tony publicou
  do Base44 durante esta sessão, múltiplas vezes). Nenhum Publish foi
  feito por mim.

---

## 12. Validação final — Rodada 2

- `npm run build`: limpo, 47 rotas pré-renderizadas.
- `npm run lint`: 0 erros, 44 warnings pré-existentes (nenhum novo
  introduzido nesta rodada).
- `gh pr list --state open`: nenhum PR pendente de merge desta rodada.
- PRs mergeados (squash), em ordem: #111 (`0860ff97`), #112 (`2077f85a`),
  #113 (`7edd9f7a`), #114 (`c2742c31`), #115 (`d75a15ba`), #116
  (`294c453a`), #117 (`807c8542`), #118 (`970924fd`), #119 (`5d05484c`).
- Pendências que dependem do Tony: limpeza da transação de teste em
  `AdminPagamentos` (dado, não código); decisão sobre os 15 usuários com
  tipo indefinido (nenhum alterado); teste manual do fluxo de cadastro
  completo (OTP) e da legibilidade em 390px real no celular; investigar
  "Prestador: Carregando..." em `/MeusPedidos` numa próxima rodada.
