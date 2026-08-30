/**
 * DESTINO NO REPO: src/lib/openai-pixel.js  (ARQUIVO NOVO)
 *
 * Measurement Pixel da OpenAI Ads — Trancoso Resolve
 *
 * ESTADO ATUAL: INERTE POR DESIGN.
 * O Pixel ID da OpenAI Ads ainda não foi confirmado por Tony em
 * ads.openai.com → Tools → Conversions → Data Source. Por isso, NENHUM ID
 * é hardcoded aqui — a função só carrega o script do Pixel se
 * VITE_OPENAI_ADS_PIXEL_ID estiver definida no ambiente de build. Sem essa
 * variável, todas as funções abaixo são no-ops seguros (não fazem nada,
 * não lançam erro).
 *
 * Quando o Pixel ID for confirmado:
 * 1. Adicionar VITE_OPENAI_ADS_PIXEL_ID=<id real> nas env vars do projeto (Vercel).
 * 2. Confirmar a URL oficial do script do Measurement Pixel em
 *    developers.openai.com/ads (o placeholder PIXEL_SCRIPT_SRC abaixo
 *    provavelmente precisa de ajuste).
 * 3. Confirmar a API real de inicialização/tracking (o formato abaixo é um
 *    placeholder inspirado no padrão fbq — PODE precisar de ajuste).
 * 4. Importar e chamar initOpenAiPixel()/trackOpenAiEvent() a partir de
 *    PageViewTracker.jsx (mesmo padrão do Meta Pixel), só depois dos passos acima.
 *
 * Segue o mesmo padrão de consentimento já usado pelo Meta Pixel
 * (src/lib/facebook-pixel.ts): só carrega/dispara se consent.marketing === true
 * (ver src/utils/consent.js — banner já existe e distingue analytics de marketing).
 */

const PIXEL_SCRIPT_ID = 'trancoso-openai-pixel';
const PIXEL_SCRIPT_SRC = 'https://static.ads.openai.com/pixel.js'; // PLACEHOLDER — confirmar URL oficial antes de ativar

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function hasMarketingConsent(windowRef) {
  try {
    const raw = windowRef.localStorage.getItem('cookie-consent');
    return raw ? JSON.parse(raw).marketing === true : false;
  } catch {
    return false;
  }
}

function getPixelId() {
  const configured = import.meta.env.VITE_OPENAI_ADS_PIXEL_ID;
  return typeof configured === 'string' && configured.trim() ? configured.trim() : undefined;
}

function appendPixelScript(documentRef) {
  if (documentRef.getElementById(PIXEL_SCRIPT_ID)) return;
  const script = documentRef.createElement('script');
  script.id = PIXEL_SCRIPT_ID;
  script.async = true;
  script.src = PIXEL_SCRIPT_SRC;
  documentRef.head.appendChild(script);
}

/**
 * Inicializa o Pixel da OpenAI Ads, se e somente se:
 * - VITE_OPENAI_ADS_PIXEL_ID estiver configurada, e
 * - houver consentimento de marketing.
 * Caso contrário, no-op silencioso (retorna false). Seguro para chamar
 * sempre, mesmo antes de qualquer configuração real.
 */
export function initOpenAiPixel({ documentRef = isBrowser() ? document : undefined, windowRef = isBrowser() ? window : undefined } = {}) {
  if (!documentRef || !windowRef) return false;
  const pixelId = getPixelId();
  if (!pixelId) return false; // Pixel ID pendente de confirmação — não carrega nada.
  if (!hasMarketingConsent(windowRef)) return false;

  appendPixelScript(documentRef);
  // A chamada de inicialização real (ex.: window.oaipixel('init', pixelId))
  // depende da API de script oficial da OpenAI Ads — a confirmar junto com
  // PIXEL_SCRIPT_SRC antes de ativar de verdade.
  return true;
}

/**
 * Dispara um evento client-side no Pixel da OpenAI Ads (quando configurado).
 * @param {string} eventName - ex.: 'lead_created'
 * @param {object} data - dados sem PII
 * @param {string} [eventId] - mesmo event_id usado no CAPI, para dedup
 */
export function trackOpenAiEvent(eventName, data = {}, eventId) {
  if (!isBrowser()) return;
  const pixelId = getPixelId();
  if (!pixelId || !hasMarketingConsent(window)) return;
  // Placeholder — implementar a chamada real assim que a API de tracking
  // client-side da OpenAI Ads for confirmada.
  console.warn('[openai-pixel] trackOpenAiEvent chamado mas API de tracking ainda não implementada:', eventName, { data, eventId });
}

export { getPixelId as getOpenAiPixelId };
