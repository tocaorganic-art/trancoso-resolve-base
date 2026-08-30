/**
 * DESTINO NO REPO: base44/functions/sendOpenAiCapiEvent/entry.ts  (ARQUIVO NOVO)
 *
 * sendOpenAiCapiEvent — Conversions API (CAPI) da OpenAI Ads
 *
 * Espelha o padrão já validado em base44/functions/sendCapiEvent/entry.ts
 * (Meta), mas para a conta e Pixel da OpenAI Ads — sistema, credenciais e
 * conta completamente separados do Meta Pixel (FB_PIXEL_ID) já existente
 * no projeto. NÃO reutiliza nem depende do metaCAPI/sendCapiEvent.
 *
 * ESTADO ATUAL: COMPLETAMENTE INERTE (ajustado em 16/08/2026 a pedido de Tony).
 *
 * Diferente de uma versão anterior deste arquivo, o destino do POST NÃO é
 * lido de uma env var arbitrária. `OPENAI_ADS_CAPI_ACTIVATED` e
 * `OPENAI_CAPI_ENDPOINT` são constantes fixas no código-fonte — só podem
 * mudar via alteração de código revisada em PR, nunca via configuração de
 * ambiente. Isso evita que uma env var mal configurada (acidental ou
 * maliciosa) redirecione o envio de eventos para um destino não confiável.
 *
 * Enquanto `OPENAI_ADS_CAPI_ACTIVATED` for `false` (estado atual), a function
 * NUNCA faz fetch/POST para lugar nenhum — apenas loga um aviso e retorna
 * `{ ok: false }`. Isso é seguro para deploy e para chamar a partir de
 * createPublicLead/createLead sem nenhum risco de rede/segurança.
 *
 * Pendências antes de ativar de verdade (ver docs/openai-ads/arquitetura.md):
 * 1. Confirmar em ads.openai.com → Tools → Conversions → Data Source:
 *    - Pixel ID / Data Source ID real da OpenAI Ads.
 *    - Endpoint oficial da Conversions API (developers.openai.com/ads/conversions-api).
 *    - Método de autenticação oficial (o placeholder abaixo assume
 *      Authorization: Bearer, a confirmar).
 *    - Formato exato do payload aceito pela API. O payload abaixo usa uma
 *      estrutura inspirada no padrão CAPI do Meta como ponto de partida —
 *      DEVE ser revalidado contra o schema oficial antes de ativar.
 * 2. Só com os 4 itens acima confirmados: preencher OPENAI_CAPI_ENDPOINT com
 *    a URL oficial (hardcoded, via PR revisado) e mudar
 *    OPENAI_ADS_CAPI_ACTIVATED para true.
 * 3. Configurar o secret OPENAI_ADS_CAPI_TOKEN no Base44 (token permanece
 *    como secret de ambiente — só o endpoint/URL é fixado em código).
 * 4. Só então esta function passa a enviar eventos de verdade.
 *
 * Regras:
 * - NUNCA expor tokens ou dados PII no response.
 * - Nenhum CPF, endereço completo, telefone, e-mail ou conteúdo da
 *   solicitação em custom_data — apenas dados agregados de negócio.
 * - event_id deve ser o mesmo usado pelo Pixel client-side (quando o Pixel
 *   existir) para deduplicação Pixel + CAPI.
 * - oppref é incluído quando disponível (parâmetro oficial de atribuição
 *   da OpenAI Ads).
 * - Se a function não estiver ativada (ou o token não estiver configurado),
 *   falha silenciosamente (analytics é opcional, nunca bloqueia o fluxo de negócio).
 */

// [Segurança] Endpoint fixo no código — NUNCA lido de env var. Só é
// preenchido (e revisado via PR) quando a URL oficial for confirmada.
const OPENAI_CAPI_ENDPOINT: string | null = null; // TODO: preencher com a URL oficial confirmada em developers.openai.com/ads/conversions-api

// [Segurança] Flag de ativação fixa no código — só muda via alteração de
// código revisada, nunca via configuração de ambiente.
const OPENAI_ADS_CAPI_ACTIVATED = false;

const OPENAI_CAPI_TOKEN_ENV = 'OPENAI_ADS_CAPI_TOKEN';

/**
 * Envia um evento CAPI à OpenAI Ads.
 * @param eventName Nome do evento (ex.: lead_created)
 * @param customData Dados customizados sem PII
 * @param eventId UUID do evento (mesmo enviado pelo Pixel client-side, quando existir)
 * @param oppref Parâmetro oficial de atribuição de clique da OpenAI Ads (opcional)
 */
export async function sendOpenAiCapiEventInternal(
  eventName: string,
  customData: Record<string, unknown> = {},
  eventId?: string,
  oppref?: string,
): Promise<{ ok: boolean; error?: string }> {
  // [Inerte por design] Nenhuma chamada de rede acontece enquanto isto for
  // false ou o endpoint não estiver preenchido — ambos exigem mudança de
  // código, nunca de env var.
  if (!OPENAI_ADS_CAPI_ACTIVATED || !OPENAI_CAPI_ENDPOINT) {
    console.warn(
      '[openai-capi] function inerte — endpoint/ativação da Conversions API da OpenAI Ads ainda não confirmados oficialmente. Evento não enviado:',
      eventName,
    );
    return { ok: false, error: 'OPENAI_ADS_CAPI_NOT_ACTIVATED' };
  }

  const accessToken = Deno.env.get(OPENAI_CAPI_TOKEN_ENV);
  if (!accessToken) {
    console.warn(`[openai-capi] ${OPENAI_CAPI_TOKEN_ENV} não configurado — evento não enviado:`, eventName);
    return { ok: false, error: 'OPENAI_ADS_CAPI_TOKEN_NOT_SET' };
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: now,
        event_id: eventId || crypto.randomUUID(),
        event_source_url: 'https://trancosoresolve.com.br',
        action_source: 'website',
        ...(oppref ? { oppref } : {}),
        custom_data: customData,
      },
    ],
  };

  try {
    const resp = await fetch(OPENAI_CAPI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const bodyText = await resp.text();
      // Nunca logar o token — apenas o código de erro e um trecho curto do corpo.
      console.error(`[openai-capi] HTTP ${resp.status} ao enviar ${eventName}:`, bodyText.slice(0, 200));
      return { ok: false, error: `HTTP_${resp.status}` };
    }

    console.log(`[openai-capi] Evento enviado com sucesso: ${eventName}`);
    return { ok: true };
  } catch (err) {
    console.error(`[openai-capi] Erro de rede ao enviar ${eventName}:`, (err as Error).message);
    return { ok: false, error: 'NETWORK_ERROR' };
  }
}

// ─── Handler HTTP (chamada direta via API — apenas admin, para testes manuais) ─────────────────
// Mesmo com OPENAI_ADS_CAPI_ACTIVATED = false, este handler pode ser chamado
// (por um admin) para conferir a resposta { ok: false, error: 'OPENAI_ADS_CAPI_NOT_ACTIVATED' }
// sem nenhum risco — nenhuma chamada de rede é feita internamente.

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405 });
  }

  const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.31');
  let base44;
  try {
    base44 = createClientFromRequest(req);
  } catch {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { event_name, custom_data, event_id, oppref } = body as {
    event_name?: string;
    custom_data?: Record<string, unknown>;
    event_id?: string;
    oppref?: string;
  };

  if (!event_name || typeof event_name !== 'string') {
    return Response.json({ error: 'event_name_required' }, { status: 400 });
  }

  const result = await sendOpenAiCapiEventInternal(event_name, custom_data ?? {}, event_id, oppref);
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
