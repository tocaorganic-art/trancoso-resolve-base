# Auditoria SEO Orgânica Nacional — Trancoso Resolve

> Site: `https://trancosoresolve.com.br` (ver achado crítico #0 sobre o domínio canônico)
> Data: 14/10/2026 · Branch: `seo/auditoria-organica-nacional`
> Execução: `/resolveimediato` (corrigir em fluxo o que fosse seguro) + `/ruflo` (swarm real
> via claude-flow — ver seção "Uso real do Ruflo" ao final)

Esta auditoria cobriu as 4 frentes pedidas (on-page, imagens, técnico, performance),
página a página, nas ~49 rotas indexáveis de produção. Os relatórios detalhados de cada
frente estão em `SEO_AUDIT_A1_onpage.md`, `SEO_AUDIT_A2_imagens.md`,
`SEO_AUDIT_A3_tecnico.md` e `SEO_AUDIT_A4_performance.md`. Este documento consolida os
achados, lista o que foi corrigido em código nesta sessão, e separa o que só pode ser
resolvido pela plataforma Base44 ou por decisão do Tony.

---

## 0. Achado crítico #1 — domínio canônico (RESOLVIDO nesta sessão, era um erro de doc, não de código)

O `CLAUDE.md` do projeto dizia "sempre usar `www`" como regra de SEO. Isso estava
**desatualizado**. Verificado ao vivo:

- `https://www.trancosoresolve.com.br/` → **301 → `https://trancosoresolve.com.br/`** (sem www)
- Todo o código-fonte (hooks, páginas de destino, páginas de serviço×cidade, `index.html`)
  já usa consistentemente o domínio **sem** `www`.

Ou seja: código e redirect de produção já estavam alinhados entre si (sem `www`) — só a
documentação do projeto estava errada, provavelmente desde uma mudança de infraestrutura
depois da PR #51 (que tinha corrigido para `www` na época). **Corrigido:** `CLAUDE.md`
atualizado com a regra real, nenhum código foi alterado (teria sido uma regressão).

## 0.1. Achado crítico #2 — domínio de produção não está atrás da Vercel (decisão do Tony, não corrigido)

Os headers de resposta do domínio ao vivo (`trancosoresolve.com.br`) mostram
`via: 1.1 Caddy`, `x-render-origin-server: uvicorn`, `rndr-id` — **nenhum header de
Vercel** (`x-vercel-id`, `x-vercel-cache`). Reconfirmado de forma independente nesta
sessão (não só pelo agente de performance): o domínio aponta para a infraestrutura do
Base44 (Render), não para o projeto Vercel que o repo documenta (`vercel.json` com CSP e
Cache-Control customizados). **Isso significa que os headers de segurança e cache
configurados no `vercel.json` deste repositório podem não estar em vigor na produção
real.** Não mexi em DNS/infra — é uma decisão que só o Tony pode tomar (qual deploy é o
canônico: Vercel ou Base44/Render direto).

---

## 1. O que foi corrigido em código nesta sessão (resumo)

| # | Arquivo | Correção | Por quê é seguro |
|---|---|---|---|
| 1 | `CLAUDE.md` | Regra de domínio canônico corrigida (sem `www`) | Documentação, não código de produção |
| 2 | `src/components/BannerRotativo.jsx` + `index.html` | 9 URLs do carrossel da Home trocadas de `base44.app/api/...` (302 redirect) para o destino final direto `media.base44.com/...` | Mesmo arquivo, mesmo byte final — só elimina 1 RTT extra no caminho crítico do LCP da Home |
| 3 | `index.html` | Adicionado `preconnect` para `images.unsplash.com` | Usado em 5 páginas (Home, ServicoLanding, 4 destinos) e não tinha preconnect |
| 4 | `src/pages/ServicoLanding.jsx` | Adicionado `fetchPriority="high"` no hero | Imagem já era `loading="eager"`; só reforça prioridade. **Não** adicionei `width`/`height` — medi via parsing real de header (WebP/JPEG) e só consegui confirmar dimensões das 4 variantes Unsplash (~800×530-559px); as 5 variantes hospedadas no base44 não resolvi a tempo. Não inventei números para as que faltam. |
| 5 | `src/pages/destinos/ArraialDajuda.jsx` | `HERO_IMAGE` `w=1600&q=80` → `w=1080&q=60` (igual aos 3 irmãos) | Imagem decorativa a 20% de opacidade — 213KB → 91KB, confirmado via `curl`, perda visual imperceptível |
| 6 | `src/pages/destinos/Caraiva.jsx` | `HERO_IMAGE` `q=60` → `q=50` | 207KB → 179KB, mesma lógica |
| 7 | `src/pages/destinos/PortoSeguro.jsx` | `HERO_IMAGE` `w=1080&q=60` → `w=960&q=30` | Foto de alta entropia; 439KB → 193KB (testei várias combinações antes de escolher esta) |
| 8 | `src/pages/Home.jsx` | 87 URLs do `categoryImageMap` ganharam `&auto=format&fit=crop` | Alinha com o padrão já usado em `HERO_IMAGE` das páginas de destino; mecânico e seguro (padrão idêntico em todas) |
| 9 | `scripts/generate-sitemap.js` + `public/sitemap.xml` | Removida a entrada `/investidores` do sitemap | A própria página define `noIndex: true` — estava contraditório ter a URL no sitemap |

Todas essas correções passaram por `npm run lint` (0 erros, mesmos 48 warnings
pré-existentes) e `npm run build` (47 rotas pré-renderizadas com sucesso) depois de
aplicadas.

Também removidos 3 arquivos de teste (`alias_como_funciona.html`,
`alias_servicos_hyphen.html`, `notfound_test.html`) deixados como artefato de curl por um
dos agentes de auditoria — não eram parte do código do projeto.

---

## 2. Top 10 prioridades de SEO (ordenado por impacto)

1. **[Fora do repo] Conteúdo real da página só existe pós-hidratação JS.** O HTML que
   qualquer crawler sem JS vê é só o bloco `#seo-snapshot` da plataforma Base44 (H1 = title,
   1 parágrafo genérico, nav). Isso causa 99,7-99,8% de "duplicidade" entre páginas de
   serviço×cidade (na real, o texto de 300+ palavras existe no componente, só não é
   servido estaticamente) e esconde o FAQ real, a `BreadcrumbList` e os JSON-LD
   específicos de página. **Maior prioridade, mas é a plataforma Base44 quem decide o
   processo de snapshot — listado na seção 4 para o agente Base44 aplicar.**
2. **[Decisão do Tony]** Confirmar se o deploy canônico é Vercel ou Base44/Render direto
   (achado crítico #2 acima) — sem isso, não dá pra garantir que nenhuma correção de
   header/cache feita no repo está realmente em produção.
3. **[Corrigido]** `/investidores` fora do sitemap (contradição com `noIndex`).
4. **[Corrigido]** Redirect 302 eliminado no carrossel da Home (maior página, candidata a
   LCP mais visitada do site).
5. **[Não corrigido, recomendado]** 3 PNGs de fallback do carrossel da Home (1069KB,
   1186KB, 1351KB) — WebP irmãos pesam 11x menos. Não recomprimi porque exige edição de
   imagem (ferramenta fora do meu alcance nesta sessão); o `<picture><source webp>` já
   cobre ~97% dos navegadores, então o impacto real é menor do que parece à primeira
   vista, mas vale a pena recomprimir ou remover o fallback PNG.
6. **[Corrigido]** 3 backgrounds de destino acima de 200KB (Porto Seguro 439→193KB,
   Arraial d'Ajuda 213→91KB, Caraíva 207→179KB).
7. **[Não corrigido, recomendado]** `getWebPUrl()` em `src/utils/images.js` está
   desativado globalmente (sempre retorna `null`) — nenhuma imagem via `LazyImage` se
   beneficia de conversão WebP. Não mexi porque o comentário no código já registra que a
   troca ingênua de extensão quebrava URLs antes; precisa de uma abordagem diferente
   (`&fm=webp` nativo do Unsplash, por exemplo) e testes mais amplos do que o tempo desta
   sessão permitia.
8. **[Não corrigido, baixa prioridade]** 4 meta descriptions excedem 160 caracteres
   (`seguranca-trancoso` 167, `eletricista-arraial-dajuda` 166, `eletricista-porto-seguro`
   163, `diarista-arraial-dajuda` 162) — risco de truncamento no SERP, não encontrei os
   arquivos de dados de origem a tempo de editar com segurança nesta sessão.
9. **[Não corrigido]** `og:image` idêntica em todas as 49 páginas — nenhuma diferenciação
   visual por serviço/destino em compartilhamentos sociais.
10. **[Decisão de produto]** 9 páginas sem nenhuma imagem de conteúdo (`/About`, `/Planos`,
    `/investidores`, `/ComoFunciona`, páginas de serviço institucionais, etc.) — oportunidade
    perdida de Google Imagens em páginas de alto intento de busca local.

---

## 3. Estratégia de conteúdo nacional (visão além de Trancoso local)

O pedido original era otimizar para ranqueamento **nacional** (viajantes, donos de
pousada/villa, moradores, gente planejando se mudar), não só busca local. Achados
relevantes para isso:

- `src/data/seoLocal.js` só tem 4 destinos e 5 categorias mapeadas — bem menos que os
  ~15 tipos de serviço e os bairros de Trancoso (Quadrado, Rio Verde, Pitinga) já cobertos
  por páginas fixas em `src/pages/servicos/`. As rotas dinâmicas `/:destino/:categoria` e
  `/:destino` (`DestinoHub.jsx`, `ServicoDestino.jsx`) dependem desse mapa menor — vale
  confirmar se slugs fora do mapa retornam 404/noindex limpo em vez de conteúdo fraco
  (não verificado a fundo nesta sessão, por falta de tempo).
- Já existe um bom padrão de long-tail hiperlocal: páginas de bairro dentro de Trancoso
  (`QuadradoTrancoso.jsx`, `RioVerdeTrancoso.jsx`, `PitingaTrancoso.jsx`). Esse padrão
  pode ser estendido para bairros/áreas de Porto Seguro e Arraial d'Ajuda.
- `/guides/morar-em-trancoso` e `/investidores` já existem como conteúdo voltado a quem
  pensa em se mudar/investir — mas `/investidores` é `noIndex` (não deveria competir por
  tráfego orgânico de qualquer forma) e a profundidade real de conteúdo de
  `/guides/morar-em-trancoso` não foi auditada a fundo.
- **Oportunidades de conteúdo sugeridas** (não implementadas, ficam como recomendação):
  guias comparativos ("Trancoso vs. Arraial d'Ajuda: onde investir"), conteúdo sazonal
  (Carnaval, alta/baixa temporada), "Quanto custa manter uma pousada em Trancoso",
  "Checklist de mudança para a Costa do Descobrimento" — pensados para capturar busca de
  quem está em outros estados do Brasil pesquisando antes de viajar/investir/se mudar, não
  só busca local de quem já está em Trancoso.

---

## 4. Itens só corrigíveis na plataforma Base44 (para o agente Base44 aplicar via API)

1. **Processo de `#seo-snapshot`**: precisa capturar o DOM pós-hidratação (ou pelo menos
   incluir os blocos JSON-LD client-side: `page-schema-ld`, `page-faq-ld`,
   `page-breadcrumb-ld`, e a meta `robots` dinâmica de páginas `noIndex`) em vez de só
   title + 1 parágrafo genérico + lista de navegação.
2. Confirmar/corrigir, nas configurações do builder, se o painel de SEO global permite
   definir `og:image` por página/categoria em vez da imagem única atual.
3. Revisar se existe alguma configuração de deploy que explique por que o domínio de
   produção não está atrás da Vercel (achado crítico #2) — pode ser algo administrável
   só pelo painel Base44.

---

## 5. Uso real do Ruflo (claude-flow) nesta sessão

- `swarm_init` → swarm `swarm-1792005345416-4exks8` (hierárquico, 6 agentes max).
- `agent_spawn` ×4 → `seo-onpage`, `seo-imagens`, `seo-tecnico`, `seo-performance`.
- `task_create` → task geral da auditoria.
- `memory_store` → achado do domínio canônico salvo para sessões futuras.
- Execução real dos 4 agentes foi via Agent tool nativo (Task tool), conforme já
  documentado nas notas internas desta sessão.
- **2 dos 4 agentes (`seo-onpage`, `seo-tecnico`) esgotaram a cota de sessão própria
  antes de terminar.** `seo-onpage` conseguiu escrever o relatório completo antes de
  cair. `seo-tecnico` não — a Parte A3 (técnica) foi concluída diretamente por esta
  sessão coordenadora, com os mesmos critérios (medição real via `curl`, nada inventado).

---

## 6. Observações finais

- Nenhum código de Mercado Pago/Stripe, `base44/entities`, preços/planos/ofertas, ou CTA
  de WhatsApp foi tocado.
- Nenhum Publish/deploy no Base44 foi feito (reservado ao Tony).
- `npm run lint` → 0 erros (48 warnings pré-existentes, inalterados).
- `npm run build` → 47 rotas pré-renderizadas com sucesso.
- Próximo passo: abrir PR desta branch para `main`, aguardar CI verde, e mergear via
  squash conforme a regra já estabelecida.
