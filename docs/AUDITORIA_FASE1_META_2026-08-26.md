# Auditoria da Fase 1 e bloqueio Meta — 26/08/2026

> **Errata (28/08/2026):** este documento registrou `908361385639766` como o Pixel ID
> correto e `1469130194903035` como "antigo". Essa conclusão foi **revertida** pelos PRs
> #7, #8 e #9 (mergeados em 26–28/08/2026), que fixaram `1469130194903035` como o Pixel
> oficial e passaram a tratar `908361385639766` como ID legado a remover — confirmado
> pela auditoria final de 28/08/2026 (ver `docs/AUDITORIA_FINAL_2026-08-28.md`, se
> presente, ou o Pull Request desta auditoria). Não use `908361385639766` como referência;
> o texto abaixo é mantido apenas como registro histórico da investigação daquele dia.
> Como o histórico do Gerenciador de Eventos mostrava **0 eventos** para ambos os IDs,
> recomenda-se que Tony confirme manualmente e ao vivo, no Events Manager
> (`business_id=2061349114595345`), qual Pixel ID está de fato recebendo tráfego antes
> de considerar o rastreamento validado em produção.

## Resultado

O documento `FASE1_UX_UI_EXECUTADO.md` trata de UX/UI e não de login ou criação de aplicativo Meta. A captura enviada comprova acesso ao Meta Business Manager, ao portfólio empresarial **Toca Experience** e a uma conta de anúncios. Ela não comprova que existe um app em Meta Developers nem que o Instagram profissional está vinculado.

## Fase 1 — conferência documental

| Item | Evidência no rascunho | Estado seguro |
|---|---|---|
| Logo e navegação | `src/Layout.jsx` usa `shrink-0 min-w-fit` na marca | Preparado no código; falta confirmação visual ao vivo |
| Painel administrativo | Não há uso de `asServiceRole` nos dois arquivos citados pelo guia | Preparado no código; falta login admin e dados reais |
| Avatar quebrado | `ProviderCard.jsx` possui `AvatarFallback` | Preparado no código; falta teste ao vivo em `/Servicos` |
| Paleta e SEO | Tokens terrosos e canonical/meta descriptions existem | Parcial: o `theme-color` atual é `#E8571A`, enquanto o documento cita `#8B6914` |
| Hero `/SejaPrestador` | Página possui SEO/canonical e layout responsivo | Falta confirmação visual da imagem/tonalidade |
| GTM | Existe `GTM-5CQLT5JM` em `src/utils/consent.js` | O documento ainda registra o GTM como pendência manual; validar se esse ID é o oficial |
| Entrega da fase | Correção do Pixel está na branch `fix/meta-pixel-trancoso-resolve-908361385639766`; há outras alterações não commitadas | Não aprovado para produção |

## Bloqueio Meta identificado

1. A tela **Ações necessárias** vazia significa apenas que não existem tarefas pendentes para a sessão atual.
2. O portfólio e a conta de anúncios vistos na captura não equivalem a um app de desenvolvedor.
3. A automação local depende de um app Meta, dos webhooks publicados no Base44 e das credenciais configuradas no Base44.
4. A CLI confirmou acesso ao Base44 como `tocaorganic6@gmail.com`, com 56 funções remotas e 26 secrets cadastrados; `INSTAGRAM_ACCESS_TOKEN` não está entre os secrets.
5. O Base44 ainda possui o webhook legado `whatsappWebhook` e o novo `processarWebhookWhatsApp`; apenas o novo deve ser conectado ao número, depois do deploy.

## Gerenciador de Eventos

Na conta de anúncios consultada, o Gerenciador de Eventos exibiu três conjuntos de dados: `dados` e dois conjuntos chamados `Trancoso Resolve`. Todos apareceram com **Nenhuma integração**, **0 eventos nos últimos 28 dias** e **Nenhuma atividade de evento**.

O conjunto de dados `Trancoso Resolve` com ID `908361385639766` apareceu nessa tela e foi alinhado no código, na documentação e na tela administrativa. Mesmo assim, ele continua com **Nenhuma integração**, **0 eventos** e **Nenhuma atividade de evento**. O ID antigo `1469130194903035` não deve voltar a ser usado.

## Próximo ponto de verificação manual

Abrir `https://developers.facebook.com/apps/` com a conta que administra o portfólio **Toca Experience** e verificar se aparece um app chamado Trancoso Resolve. Se não aparecer, o app ainda não foi criado ou está em outra conta/portfólio. Não criar nem publicar app nesta auditoria.

Depois de confirmar o app, validar no Meta Business Manager o vínculo da Página do Facebook com o Instagram profissional. Só então configurar o token do Instagram diretamente no painel Base44; nunca inserir token no GitHub, neste documento ou no chat. O schema `Verificacao` e as autorizações dos fluxos de identidade/antecedentes já foram corrigidos no commit local; ainda precisam de revisão no PR e teste após a publicação.

## Validações do rascunho

- Testes locais: **12 passaram, 0 falharam**.
- Build de produção: **passou**, com 4.183 módulos transformados e 47 rotas pré-renderizadas.
- Avisos não bloqueantes: `VITE_BASE44_APP_ID` ausente no ambiente local, bases de navegador desatualizadas e alguns chunks acima de 500 kB.
- Foram corrigidos localmente: autorização por proprietário nos fluxos de identidade/antecedentes, status `pending_review` no schema e exposição de detalhes da consulta de antecedentes.

## Respostas automáticas — regra atual

WhatsApp, Messenger e Instagram agora usam o mesmo conteúdo em `base44/functions/_shared/automationResponses.js`:

| Intenção detectada | Orientação enviada |
|---|---|
| Cadastro ou prestador | Link `/SejaPrestador`, etapas do cadastro e aviso de verificação |
| Como funciona ou contratar | Três passos: buscar, solicitar e combinar diretamente com o prestador; link `/ComoFunciona` |
| Preço, plano ou valor | Plataforma gratuita para clientes; condições de prestadores/lojistas no link `/Planos` |
| Cliente, serviço, pousada ou villa | Acesso ao site, busca do serviço e solicitação |
| Outros assuntos | Pedido objetivo para a pessoa informar o interesse |

O gatilho de interesse não envia mais o template de boas-vindas antes da validação. A mensagem de boas-vindas continua reservada ao fluxo de cadastro aprovado. As respostas não orientam o cliente a migrar para o WhatsApp. O conteúdo é uma fotografia aprovada do site em 26/08/2026, não uma leitura dinâmica; deve ser revisado quando as páginas mudarem.

## Regra de entrega

Foi feito push apenas da correção do Pixel em uma branch de revisão; não houve deploy, publicação, alteração de secret ou ativação de webhook. As correções de segurança e automação foram consolidadas localmente no commit `cc99ced` da mesma branch, mas ainda não foram enviadas ao GitHub.

Para o próximo push, no PowerShell, a partir da raiz deste repositório:

```powershell
git push -u origin fix/meta-pixel-trancoso-resolve-908361385639766
```

Depois do push, revisar o diff/PR no GitHub. Só então fazer a publicação manual no Base44 e testar os webhooks; não usar `npm run deploy`, `base44 deploy` ou alteração de secrets nesta etapa.
