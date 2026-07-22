# Checklist de Release — Trancoso Resolve

> Use este checklist antes de cada merge para `main` e após cada deploy de produção.
> Nenhum item pode ser marcado sem execução real — sem "acho que está OK".

---

## Pré-merge (antes do squash merge)

### CI & Qualidade

- [ ] `npm run lint` → **0 errors** (warnings tolerados temporariamente; meta: 0)
- [ ] `npm run build` → **exit 0**, sem erros
- [ ] `npm run typecheck` → **0 errors** (quando typecheck for gate de CI)
- [ ] Nenhum segredo, token ou credencial no diff

### Review

- [ ] PR tem descrição explicando o **porquê** da mudança (não apenas o quê)
- [ ] Diff revisado: sem código morto, imports não utilizados, ou debug logs
- [ ] Mudanças de comportamento documentadas no corpo da PR
- [ ] Se alterou rotas: verificar se `sitemap.xml` precisa ser regenerado (`npm run sitemap`)

### Preview Vercel

- [ ] Preview está com status **Ready** (não Building, não Error)
- [ ] Fluxo crítico funciona no Preview (ver seção abaixo)

---

## Fluxo crítico (validar no Preview antes do merge / em produção após deploy)

### Autenticação

- [ ] Login com conta existente
- [ ] Cadastro de nova conta
- [ ] Logout
- [ ] Recuperação de senha (email enviado)

### Conteúdo principal

- [ ] Homepage carrega sem erro
- [ ] Categorias de serviço listam corretamente
- [ ] Perfil de prestador abre
- [ ] Busca retorna resultados

### IA (TryA)

- [ ] Assistente TryA responde mensagens
- [ ] Histórico de conversa persiste
- [ ] Mensagem de erro de auth aparece se não logado

### Painel

- [ ] Dashboard carrega para usuário logado
- [ ] Agenda exibe itens corretamente
- [ ] Financeiro exibe dados (não zero sem motivo)

### Pagamentos

- [ ] Checkout Mercado Pago abre (Pix)
- [ ] Checkout Mercado Pago abre (Cartão)

### Técnico

- [ ] Console do navegador: sem erros críticos (erros de rede esperados de APIs externas são OK)
- [ ] Network: sem respostas 5xx em rotas da aplicação
- [ ] Mobile (viewport 375px): navegação e layout OK
- [ ] Desktop (viewport 1280px): navegação e layout OK
- [ ] Logo visível e sem corte em todas as larguras

---

## Pós-merge (após deploy de produção)

### Deploy

> ⚠️ **O deploy final de produção é feito pelo Base44, não pela Vercel.**
> A Vercel faz o build e o preview. Para publicar em produção, acesse o painel
> do Base44 (app ID `68eb21726a9614db4a82ba99`) → Configurações → pull do branch `main`.

- [ ] Pull do branch `main` executado no Base44
- [ ] Base44 confirma build concluído sem erros
- [ ] URL de produção (`www.trancosoresolve.com.br`) abre sem erro 502/504
- [ ] Commit em produção bate com o SHA do squash merge

### Validação em produção

- [ ] Homepage carrega normalmente
- [ ] Login funciona
- [ ] Busca IA (TryA) responde
- [ ] Categorias carregam
- [ ] Prestadores carregam
- [ ] Console sem erros críticos
- [ ] Network sem respostas 500

### Monitoramento (primeiros 15 minutos)

- [ ] Logs do Base44: sem spike de erros ou exceções
- [ ] Analytics continuam registrando page views
- [ ] Nenhum alerta de usuário reportado

---

## Critérios de rollback imediato

Acione rollback (redeploy do commit anterior na Vercel) se qualquer item abaixo ocorrer:

- Login ou cadastro quebrado em produção
- Homepage retornando erro 5xx
- TryA completamente inoperante
- Checkout Mercado Pago inacessível
- Spike de erros > 10x a linha de base nos logs

**Como fazer rollback na Vercel:** Deployments → selecionar o deploy anterior → "Promote to Production".

---

## Checklist de segurança (a cada 30 dias ou antes de lançamento com campanha)

- [ ] Nenhum token, chave de API ou credencial no repositório (`git log --all -S "ghp_"`)
- [ ] `vercel.json` contém bloco `headers` com CSP, X-Frame-Options, etc.
- [ ] `securityheaders.com` para `www.trancosoresolve.com.br`: nota **A ou superior**
- [ ] App Base44 de produção identificado (ID `68eb21726a9614db4a82ba99`)
- [ ] Banco de dados sem registros de teste (`teste@`, `test-provider-`, etc.)
- [ ] VisualEditAgent fora de produção (`import.meta.env.DEV`)

---

## Notas

- **Squash merge sempre** — nunca `merge commit` nem `rebase` direto em `main`
- **Branch protection ativa** em `main` — push direto é bloqueado
- **Nunca push do Base44 → GitHub** — sobrescreve a migração de marca
- Regenerar sitemap após adicionar novas páginas: `npm run sitemap`
- Issues de dívida técnica ativa: **#77** (TypeScript) e **#78** (ESLint)

---

*Última atualização: 21/07/2026 — Conselho Técnico + Trancoso Resolve*
