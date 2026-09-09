# INVENTÁRIO COMPLETO DE TOKENS — Trancoso Resolve & MCC

> Registro de referência dos IDs de rastreamento e contas. Última atualização: 2026-09-08.

| Recurso | ID / Token |
|---|---|
| Google Ads Account CID | 714-209-2343 |
| Google Tag (gtag.js) | AW-18431007500 |
| Conversão "Assinatura" | AW-18431007500/bYDPCPzcwPEcEIy2y9RE |
| GTM Trancoso Resolve | GTM-5CQLT5JM |
| GTM Toca Experience | GTM-5F9RSWTB |
| Meta Pixel | 1469130194903035 |
| MCC Google Ads | 729-802-8898 |

## Notas de implementação

- A tag global `AW-18431007500` está configurada no snippet único do gtag.js (index.html), junto do GA4 `G-3KF75243B4`.
- A conversão "Assinatura" dispara na página `/AssinaturaConfirmada` (código direto, uma vez por sessão, com consentimento LGPD).
- O container `GTM-5CQLT5JM` está vazio — o rastreamento atual vem exclusivamente do código direto. Se as tags forem criadas no GTM, remover os disparos do código para evitar contagem dupla.