/**
 * Ads Attribution — Trancoso Resolve × OpenAI Ads
 * DESTINO NO REPO: src/lib/adsAttribution.js  (ARQUIVO NOVO)
 *
 * Captura e persiste parâmetros de atribuição de campanhas (UTM + oppref)
 * para anexar ao payload de criação de leads.
 *
 * Regras (definidas em docs/openai-ads/eventos.md e arquitetura.md, ajustadas
 * em 16/08/2026 a pedido de Tony):
 * - Captura de UTM e oppref é feita diretamente da URL, sem depender de
 *   nenhum cookie próprio ou do Pixel da OpenAI.
 * - Persistência usa exclusivamente mecanismo próprio da Trancoso Resolve
 *   (sessionStorage, mesmo padrão já usado no restante do projeto — ver
 *   src/lib/app-params.js) — NENHUM cookie é criado ou lido por este módulo.
 *   Não fazemos nenhuma suposição sobre duração de retenção não confirmada
 *   oficialmente (por isso não usamos cookie com max-age arbitrário).
 * - A persistência de UTM e oppref é CONDICIONADA a consentimento de
 *   marketing (mesmo gate já usado pelo Meta Pixel — ver src/utils/consent.js).
 *   Sem `consent.marketing === true`, o módulo lê a URL mas não persiste nada.
 *   Isso é intencional: esses dados só servem para mensuração/atribuição de
 *   anúncios, que é justamente o propósito coberto pelo consentimento de
 *   marketing no banner já existente.
 * - O Measurement Pixel da própria OpenAI (quando ativado) pode manter seu
 *   próprio armazenamento first-party interno — isso é gerenciado pelo
 *   script oficial da OpenAI (fora do nosso controle) e é independente
 *   deste módulo.
 * - UTMs: capturados na primeira navegação da sessão que os trouxer,
 *   persistidos em sessionStorage, NUNCA sobrescritos por uma navegação
 *   subsequente sem UTM (first-touch-in-session).
 * - oppref: parâmetro oficial da OpenAI Ads (confirmado em
 *   help.openai.com/en/articles/20001409-conversion-measurement). Capturado
 *   da URL a cada navegação (mais recente vence, por ser um identificador de
 *   clique, não uma campanha de sessão) e persistido em sessionStorage.
 * - Nenhum dado PII é lido ou persistido por este módulo.
 * - Nenhuma chamada de rede é feita aqui — apenas leitura de URL e
 *   sessionStorage local.
 * - Este módulo é 100% passivo: não decide nada sobre Pixel/CAPI, apenas
 *   captura e disponibiliza os dados de atribuição para quem precisar.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const OPPREF_KEY = 'oppref';
const SESSION_PREFIX = 'tr_ads_';
const COOKIE_CONSENT_KEY = 'cookie-consent';

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function hasMarketingConsent(windowRef) {
  try {
    const raw = windowRef.localStorage.getItem(COOKIE_CONSENT_KEY);
    return raw ? JSON.parse(raw).marketing === true : false;
  } catch {
    return false;
  }
}

function readSession(windowRef, key) {
  try {
    return windowRef.sessionStorage.getItem(SESSION_PREFIX + key) || undefined;
  } catch {
    return undefined;
  }
}

function writeSession(windowRef, key, value) {
  try {
    windowRef.sessionStorage.setItem(SESSION_PREFIX + key, value);
  } catch {
    // sessionStorage indisponível (modo privado, etc.) — segue sem persistir.
  }
}

/**
 * Lê a URL atual, captura UTMs + oppref (se presentes) e persiste — apenas
 * quando há consentimento de marketing. Deve ser chamada uma vez por
 * navegação (ex.: dentro do PageViewTracker, a cada mudança de rota).
 *
 * Sem consentimento de marketing: lê a URL normalmente, mas não grava nada
 * em sessionStorage (no-op de persistência).
 *
 * Idempotente para UTMs: não sobrescreve valores já capturados nesta sessão
 * quando a navegação atual não traz o parâmetro (first-touch-in-session).
 */
export function captureAdsAttribution({ windowRef = isBrowser() ? window : undefined } = {}) {
  if (!windowRef) return;
  if (!hasMarketingConsent(windowRef)) return;

  let params;
  try {
    params = new URLSearchParams(windowRef.location.search);
  } catch {
    return;
  }

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value && !readSession(windowRef, key)) {
      writeSession(windowRef, key, value.trim().slice(0, 200));
    }
  });

  const oppref = params.get(OPPREF_KEY);
  if (oppref) {
    writeSession(windowRef, OPPREF_KEY, oppref.trim().slice(0, 500));
  }
}

/**
 * Retorna os dados de atribuição já capturados (para anexar ao payload de lead).
 * Nunca lança erro; retorna objeto apenas com as chaves presentes.
 * Seguro para chamar em SSR/build (retorna {} fora do browser).
 */
export function getAdsAttribution() {
  if (!isBrowser()) return {};
  const result = {};
  UTM_KEYS.forEach((key) => {
    const value = readSession(window, key);
    if (value) result[key] = value;
  });
  const oppref = readSession(window, OPPREF_KEY);
  if (oppref) result.oppref = oppref;
  return result;
}
