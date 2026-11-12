# Relatório final da auditoria, 11/11/2026

Repositório `tocaorganic-art/trancoso-resolve-base`, branch `main`, SHA final `36a4709`.
Todos os merges foram feitos com squash e as branches foram apagadas. O Publish é do Tony.

## Estado da main (medido)
- `npm ci` limpo, lint 0 erros, build ok, 59 testes verdes.
- 71 `base44/functions/*/entry.ts`; arquivos protegidos presentes (`facebook-pixel.ts`, `whatsapp-templates.ts`, `utils/index.js`).
- `npm audit --omit=dev`: 0 vulnerabilidades (antes eram 3).
- Acessibilidade axe (11 rotas, desktop e mobile): 55 para 20 violações sérias ou críticas.

## PRs mergeados
| PR | O que fez |
|---|---|
| #164 | Corrige falha no cadastro; consulta paga da Infosimples desligada por padrão |
| #165 | Remove 3 workflows duplicados (fim do e-mail em dobro) |
| #166 | Script de auditoria de acessibilidade e skills |
| #167 | Dependabot semanal |
| #169, #172, #174, #175 | Atualizações do Dependabot com CI verde |
| #171 | `trial_type` aceita `free_60d` (o trial de 2 meses podia ser rejeitado pelo schema) |
| #177 | Alerta à equipe em chargeback e exclusão no Asaas, sem mudar status |
| #178, #179 | Vulnerabilidades corrigidas; `zod` removido (declarado e sem uso) |
| #180 | Agentes: aviso de fim dos 2 meses (D-7 e D-1), SLA de 48h das verificações, alerta de análise manual ou reprovação, moderação de avaliações |
| #181 | `console.log` do navegador só em desenvolvimento (antes o upload expunha dado financeiro) |
| #182 | Acessibilidade: nomes, rótulos, foco e áreas roláveis |
| #183 | SEO da `/ajuda`: useSEO, schema FAQPage, entrada no sitemap |

## Decisões que são do Tony
1. **Contraste do laranja da marca.** O branco sobre #E8571A dá 3,6:1, e o mínimo AA é 4,5:1. Isso responde pelas 20 violações restantes. A opção dentro do Brand Kit é o terracota #C1440E (5,1:1) nos botões com texto pequeno. Não foi alterado.
2. **Permissão `workflow` no GitHub.** Sem ela não entram a revisão automática do Claude nos PRs e os PRs #168 e #170 do Dependabot (que alteram `.github/workflows`).
3. **framer-motion 11 para 14 (PR #176).** É versão maior, e as animações precisam de conferência visual antes do merge.
4. **React.** O PR #173 foi fechado porque atualizava só o react-dom e quebrava o CI. A atualização precisa ir com react e react-dom juntos.

## Riscos para conferir depois do Publish
- `verificarVencimentos` só aceita o cabeçalho `x-automation-secret`. Se o workflow não enviar esse cabeçalho, ele recusa a própria automação. Para conferir: histórico de execuções do workflow "Verificar Vencimentos" no Base44.
- Testar `revisaoDiariaPrestadores` com `{ "dry_run": true }`.
- Testar o chargeback no sandbox do Asaas e conferir o e-mail de alerta (regra: pagamento real é sempre com supervisão humana).

## Conferido e mantido como está
- hreflang: só `pt-BR` e `x-default`, porque o idioma troca sem mudar a URL.
- Imagens: nenhuma imagem local acima de 150 KB; as imagens grandes já vêm do CDN.
- `cleanupVerificacaoOrfaos` não foi agendada: é uma limpeza única de 5 registros fixos.
