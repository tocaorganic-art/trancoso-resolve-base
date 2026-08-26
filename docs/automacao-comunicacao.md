# Automação de comunicação e captura de leads

Documento de implementação para a Trancoso Resolve. O frontend está no checkout React/Vite; as funções e entidades em `base44/` serão sincronizadas no sandbox remoto Base44 por função. A ligação final dos webhooks Meta e o teste real de mensagens permanecem pendentes.

## 1. Arquitetura

```text
Visitante / Lead Ads / WhatsApp / Messenger / Instagram
              │
              ▼
      Webhooks Base44 (Deno)
      ├─ assinatura HMAC + verify token
      ├─ normalização e consentimento LGPD
      ├─ Lead + LeadConversa
      ├─ calcularLeadScore
      └─ respostas WhatsApp/Messenger/Instagram
              │
              ├─ Meta Cloud API (WhatsApp / Messenger / Instagram)
              └─ Base44 SDK (entidades e funções)

React/Vite ── LeadCaptureForm ── createLead ── Lead
     │
     ├─ consentimento local antes de Meta Pixel/GTM
     └─ eventos Lead, CompleteRegistration, Purchase, PageView
```

## 2. Gatilhos e ações

| Gatilho | Validação | Ações |
|---|---|---|
| Formulário do site | Nome, telefone, serviço, localidade e consentimento | `createPublicLead` (persistência em `Lead`), evento `Lead`, fallback para WhatsApp oficial |
| Lead Ads Facebook | HMAC, `leadgen_id`, consulta Graph `field_data` e consentimento | Cria `Lead` com `source=facebook`, registra conversa, calcula score e tenta boas-vindas |
| Mensagem WhatsApp | HMAC e telefone E.164 | Salva entrada; cadastro/prestador usa template oficial; preço/plano e demais mensagens usam resposta de texto |
| Mensagem Messenger | HMAC e token de verificação | Salva entrada e responde por palavra-chave via Send API |
| Mensagem Instagram Direct | HMAC e token de verificação | Usa o webhook compartilhado com Messenger, salva entrada e responde via Instagram Send API |
| Erro no site | `ErrorBoundary` → `logClientError` | Salva no Base44, faz uma triagem única com Claude e ChatGPT e avisa a equipe por email |
| Score >= 70 | Serviço interno + critérios documentados | Atualiza `qualificado` e notifica `LEAD_TEAM_PHONE` uma vez |
| Cadastro validado | Identidade e antecedentes aprovados na fila administrativa | Libera o prestador e envia boas-vindas por email e WhatsApp uma vez |
| Cadastro concluído | Consentimento de marketing já concedido | `CompleteRegistration` via módulo do Pixel |
| Assinatura confirmada | URL de confirmação com plano | `Purchase` sem enviar valor inventado; valor deve ser obtido de fonte comercial aprovada |

## 3. Templates WhatsApp

O módulo `src/lib/whatsapp-templates.ts` usa chaves internas e nomes cadastrados na Meta. `trc_bem_vindo_lead`, `trc_lead_confirmado` e `trc_reativacao_lead` são os nomes verificados na Regra 1. Os demais nomes do módulo precisam ser criados/aprovados no painel antes do uso em produção.

| Chave | Nome Meta | Variáveis |
|---|---|---|
| `boas_vindas_lead` | `trc_bem_vindo_lead` | sem variáveis no template atual da Meta |
| `prestador_aprovado` | `trc_prestador_aprovado` | `nome` |
| `prestador_rejeitado` | `trc_prestador_rejeitado` | `nome`, `motivo` |
| `nova_solicitacao` | `trc_nova_solicitacao` | `cliente`, `servico`, `localidade` |
| `lembrete_resposta` | `trc_lembrete_resposta` | `cliente` |
| `follow_up_lead` | `trc_lead_confirmado` | `nome`, `servico` |

Todos os templates usam `pt_BR`. O envio de template sempre usa `WHATSAPP_TOKEN` somente no header Bearer e nunca grava o token em logs. A mensagem de boas-vindas do cadastro usa o template existente `trc_bem_vindo_lead` sem parâmetros; se o template for alterado no Meta, o contrato deve ser atualizado antes do deploy.

## 4. Variáveis de ambiente

### Frontend/Vercel

```text
VITE_FB_PIXEL_ID=908361385639766
VITE_BASE44_APP_ID=<app-id-publico-do-frontend>
VITE_BASE44_BACKEND_URL=<url-do-backend-base44>
```

`VITE_FB_PIXEL_ID` é configurável, mas deve permanecer no Pixel oficial da Regra 1. Variáveis VITE são públicas no bundle; nunca coloque tokens nelas.

### Base44

```text
WHATSAPP_TOKEN=<token-da-meta-no-painel-base44>
WHATSAPP_PHONE_NUMBER_ID=<phone-number-id-da-meta>
FB_PIXEL_ID=908361385639766
FB_PAGE_ACCESS_TOKEN=<token-da-pagina-no-painel-base44>
INSTAGRAM_ACCESS_TOKEN=<token-do-usuario-profissional-do-instagram-no-painel-base44>
FB_VERIFY_TOKEN=<valor-aleatorio-gerado-e-guardado-no-painel>
FB_APP_SECRET=<app-secret-da-meta-no-painel-base44>
LEAD_TEAM_PHONE=<telefone-internacional-da-equipe>
```

Os valores acima são nomes de configuração, não valores para commit. O token da Meta nunca deve ser colocado em Notion, Git, documentação pública ou memória.

Estado verificado em 26/08/2026: o app Base44 ainda possui o webhook legado `whatsappWebhook` e o novo `processarWebhookWhatsApp`; somente um deles deve ser conectado ao mesmo número no Meta para evitar respostas duplicadas. O segredo `INSTAGRAM_ACCESS_TOKEN` ainda não está cadastrado.

## 5. Webhooks no Meta Business Manager

Registrar no painel o endpoint publicado pelo Base44 para cada função abaixo. O Base44 Dashboard fornece a URL final do app correto `68eb21726a9614db4a82ba99`; não deduzir uma URL local nem usar outro app.

| Evento | Função | Verificação |
|---|---|---|
| WhatsApp Cloud API | `processarWebhookWhatsApp` | `FB_VERIFY_TOKEN` + `x-hub-signature-256` |
| Facebook Lead Ads | `processarLeadFacebook` | `FB_VERIFY_TOKEN` + `x-hub-signature-256` |
| Messenger | `processarWebhookMessenger` | `FB_VERIFY_TOKEN` + `x-hub-signature-256` |
| Instagram Direct | `processarWebhookMessenger` (objeto `instagram`) | `FB_VERIFY_TOKEN` + `x-hub-signature-256` |

No painel, assinar apenas os campos necessários: mensagens/status do WhatsApp, `leadgen` para Lead Ads, mensagens do Messenger e `messages` do Instagram. Fazer o GET de verificação e um POST assinado de teste antes de ativar qualquer automação.

## 6. Configuração passo a passo

1. Confirmar o app Base44 oficial e o sandbox remoto com as entidades existentes; não usar deploy CLI a partir de `/app` local.
2. Criar/validar `Lead` e `LeadConversa` no sandbox e conferir RLS de leitura administrativa e escrita por função de serviço.
3. Configurar as variáveis de ambiente no Base44; testar apenas presença/ausência, nunca imprimir valores.
4. Publicar as funções pelo fluxo do sandbox/Base44 e aguardar o checkpoint persistido.
5. No Meta Business Manager, configurar callback, verify token e assinatura HMAC. Validar GET e POST.
6. Confirmar que o template `trc_bem_vindo_lead` está aprovado; submeter os novos templates antes de habilitar seus gatilhos.
7. Criar o formulário Lead Ads com consentimento LGPD explícito e campos `full_name`, `email`, `phone_number`, `service_interest`, `location` e `consent`. O webhook recebe `leadgen_id` e consulta `field_data` com `FB_PAGE_ACCESS_TOKEN` antes de persistir.
8. Configurar `VITE_FB_PIXEL_ID` no Vercel e aceitar cookies de marketing em ambiente de teste; rejeitar cookies deve manter Google/Meta ausentes.
9. Executar teste autenticado e teste de ponta a ponta em sandbox/teste Meta, incluindo duplicidade, assinatura inválida, ausência de consentimento e falha da API.
10. Somente após aprovação de Tony, publicar a versão e acompanhar as métricas.

## 7. Métricas

- Taxa de envio válido do formulário: submissões aceitas / tentativas.
- Taxa de consentimento: consentimentos explícitos / formulários iniciados.
- Tempo até primeiro contato: `created_date` do Lead até primeira conversa de saída.
- Score médio e proporção de leads >= 70.
- Entrega, leitura e falha por canal em `LeadConversa`.
- Conversão Lead → contato qualificado → serviço/assinatura, com eventos deduplicados por `eventID`.
- Erros HMAC, rejeições por campos inválidos e falhas Meta por endpoint.

Não registrar telefone, email, token ou conteúdo sensível em analytics. Use IDs internos e agregações.

## 8. Contingência

- Meta indisponível: manter o Lead salvo, exibir o fallback `wa.me` e registrar erro sem expor detalhes do token.
- Base44 indisponível: não afirmar captura concluída; exibir erro orientando contato direto e reprocessar somente eventos com idempotência.
- Assinatura inválida: rejeitar com 401, registrar apenas motivo técnico e revisar o App Secret no painel.
- Template pendente/rejeitado: responder por texto somente dentro da janela permitida ou pausar o gatilho; não trocar por nome inventado.
- Score indisponível: manter Lead como `novo` e reprocessar após o sandbox voltar; não atribuir score manual.
- Solicitação de exclusão LGPD: localizar o Lead e conversas por ID, remover conforme política aprovada e registrar a solicitação sem replicar PII em logs.
