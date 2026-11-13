# Handoff para o Claude — o que foi feito e o que falta

Snapshot de 13/11/2026, `main` em `180f93f9`.

**Leia antes deste arquivo:**

1. `AGENTS.md` (espelhado em `CLAUDE.md`) — regras inegociáveis, fluxo de PR e o que nunca tocar.
2. `docs/auditoria/RELATORIO_FINAL_12NOV2026.md` — relatório da última rodada, com números e PRs.
3. `docs/auditoria/FERRAMENTAS.md` — como as medições foram feitas (axe, Lighthouse, skills).

Os números abaixo foram medidos contra a `main` em 12/11/2026. Remeça antes de citar; não trate como estado permanente.

---

## 1. Onde o projeto está

| Verificação | Estado em 12/11/2026 |
|---|---|
| `npm run lint` | 0 erros (avisos de variável não usada continuam) |
| `npm run build` | concluído, com prerender por rota |
| `npm test` | 61 testes verdes |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| axe (11 rotas, desktop e mobile) | 0 violações graves ou críticas |
| LCP da página de serviço | 4,8 s (simulado, Lighthouse mobile) |
| Palavras por página (53 rotas) | média 544, nenhuma abaixo de 270 |

Alvo do projeto: **LCP abaixo de 2,5 s no 4G**. Ainda não chegamos lá.

---

## 2. O que foi entregue (rodadas de 10 a 12/11)

Tudo já está na `main`, mergeado em squash, branches apagadas.

### Produto e automação
| PR | Entrega |
|---|---|
| #164 | Cadastro: revisão de antecedentes só depois do CPF salvo; consulta paga da Infosimples desligada por padrão |
| #165 | Remove 3 workflows duplicados que mandavam e-mail em dobro |
| #171 | `trial_type` aceita `free_60d` (o trial de 2 meses era rejeitado pelo schema) |
| #177 | Asaas: alerta ao admin em chargeback e em exclusão de cobrança/assinatura, sem mexer no status local |
| #180 | Agentes: aviso de fim dos 2 meses (D-7 e D-1), SLA de 48 h das verificações, alerta de análise manual/reprovação e moderação de avaliações |
| #185 | `verificarVencimentos` e `notificarAntecedentesAprovados` passam a aceitar o admin do Base44; workflow órfão removido |

### Qualidade, acessibilidade e performance
| PR | Entrega |
|---|---|
| #181 | `console.log` do navegador só em desenvolvimento (antes expunha dado financeiro) |
| #182 | Acessibilidade: nomes, rótulos, foco e áreas roláveis — de 55 para 20 violações |
| #183 | SEO da `/ajuda`: `useSEO`, schema `FAQPage` (19 perguntas) e entrada no sitemap |
| #187 | Cor de marca passa ao terracota `#C1440E`: branco sobre ela vai de 3,6:1 para 5,1:1 |
| #188 | Zera as violações de contraste (20 → 0): botões, selos, links, placeholders, chips de gráfico, onboarding |
| #189 | Performance: `gtag.js` sai do caminho crítico; Nunito vira WOFF2 com subconjunto latino (0,87 MB → 0,48 MB) |
| #190 | Reforça o conteúdo das rotas finas e tira `/CadastroTipo` do sitemap |

### Dependências e CI
#167 (Dependabot semanal), #169, #172 (44 atualizações), #174, #175, #176 (framer-motion 11 → 14, verificado no navegador), #178 e #179 (vulnerabilidades corrigidas; `zod` removido por estar declarado e sem uso).

---

## 3. O que falta — em ordem

### P1 · Do Tony, não executar sem ordem dele
1. **Escopo `workflow` no GitHub.** Sem ele não entram a revisão automática do Claude nos PRs (`.github/workflows/claude-review.yml` já existe e não roda) nem os PRs #168 e #170 do Dependabot, que alteram arquivos de `.github/workflows`.
2. **Conferência visual do framer-motion 14 em produção.** Já mergeado e verificado no navegador; falta o olho do Tony nas animações.
3. **Publish.** É exclusivo dele. Nada de `base44 deploy`, `site deploy` ou `entities push`.

### P1 · Código
4. **Remedir Lighthouse em produção depois do Publish.** O LCP de 6,7 s → 4,8 s foi medido em simulação. Medir o trancosoresolve.com.br e confirmar se caiu de verdade.
5. **Reduzir JavaScript não usado.** O Lighthouse estima 1,2 s de economia. Candidato natural: dividir os componentes do painel administrativo, que hoje entram no pacote principal. Critério de aceite: build ok, mesmo `npm test` verde, e a rota admin continuando a abrir em carregamento lazy.

### P2 · Verificar depois do Publish
6. **Histórico do workflow "Verificar Vencimentos"** não deve mais mostrar 401 (corrigido no #185).
7. **`revisaoDiariaPrestadores`** pode ser chamada com `{ "dry_run": true }` para conferir a saída sem efeito.
8. **Chargeback no sandbox do Asaas** para ver o e-mail de alerta chegar. Pagamento real só com supervisão humana.

### P2 · Código
9. **Rotas entre 270 e 296 palavras:** `/porto-seguro`, `/ajuda`, `/caraiva`, `/arraial-dajuda`, `/Contact`, `/participar`, `/trancoso`. Já estão perto do alvo e nenhuma abaixo de 270; é polimento, não bloqueio.
10. **Atualização do React:** o #173 foi fechado porque subia só o `react-dom` e quebrava o CI. Precisa ir com `react` e `react-dom` juntos, na mesma versão.

### P3 · Backlog que continua válido
11. **i18n incompleta:** nav, footer, hero e categorias estão em PT/ES/EN/FR; o corpo das páginas ainda é só pt-BR.
12. **Avisos de lint restantes** (variáveis e imports não usados) — endurecer o gate depois de zerar.
13. **Cobertura de testes** além dos 61 atuais, principalmente fluxos de pagamento e verificação.
14. **Microcopy** com a voz da marca ("A gente resolve.", sentence case, "você") de forma consistente.
15. **App mobile** — citado como produto digital da marca, não iniciado.

---

## 4. Como trabalhar neste repo

- **Fonte da verdade é o GitHub.** O Base44 só recebe: pull do GitHub para o Base44. Nunca o contrário.
- **Branch de trabalho + PR. Nunca push direto em `main`** (proteção ativa).
- **Merge sempre squash**, título do PR como mensagem, commit em português no imperativo. Depois do merge, apagar a branch.
- **CI precisa estar verde** (`lint` + `build`). Se falhar, é corrigir antes de mergear.
- **Avisar "pronto para o Tony publicar"** com o SHA do squash. Depois do Publish, conferir no bundle ao vivo se a mudança entrou.
- **Commit do `base44-builder[bot]` na `main`** é o sync esperado depois do Publish; não reverter.

### Comandos
```bash
npm ci                # instalar do lock
npm run lint          # eslint
npm run build         # build + prerender das rotas
npm test              # suíte node --test
npm run test:all      # vitest
node scripts/a11y-audit.mjs http://localhost:5173   # axe em 11 rotas; sai com 1 se houver violação grave
npm run sitemap       # regenera public/sitemap.xml
```

### Regras que mais importam no dia a dia
- **Arquivos protegidos, nunca recriar:** `src/lib/facebook-pixel.ts`, `src/lib/whatsapp-templates.ts`, `src/utils/index.js` e todos os `base44/functions/*/entry.ts`. Se faltar algum, pare e avise.
- **`index.html`** só com mudanças cirúrgicas: não tocar em LGPD, Consent Mode nem Meta Pixel.
- **Asaas é o gateway oficial.** Não editar nem reativar Mercado Pago ou Stripe; apenas sinalizar.
- **Oferta é 2 meses (60 dias) grátis sem cartão**, e os 100 primeiros ganham o Selo Fundador. Nunca escrever "30 dias grátis". Preço e plano só mudam com ordem do Tony.
- **Sem CTA público de WhatsApp.** Marca segue o Brand Kit "Trancoso Resolve Casa".
- **Design:** só tokens (`bg-brand-primary`, `text-foreground`, `border-border`). Cor de marca é o terracota `#C1440E`.
- **Entidades:** mudanças mínimas em `base44/entities/*.jsonc`. Schema ausente localmente não significa apagar no remoto.
- **Arquivos não rastreados do Tony** ficam fora do git: não abrir, mover, commitar nem apagar.

---

## 5. Conferido e mantido como está (não "corrigir")

- **hreflang:** só `pt-BR` e `x-default`, porque o idioma troca sem mudar a URL.
- **Imagens:** nenhuma imagem local acima de 150 KB; as grandes vêm do CDN.
- **`cleanupVerificacaoOrfaos`** não está agendada de propósito: é limpeza única de 5 registros fixos.
- **Typecheck global** não é gate de CI: o projeto tem erros preexistentes.
