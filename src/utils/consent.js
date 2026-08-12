export const COOKIE_CONSENT_KEY = 'cookie-consent';
export const CONSENT_CHANGED_EVENT = 'trancoso:consent-changed';

export function parseConsent(rawValue) {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      timestamp: parsed.timestamp || null,
    };
  } catch {
    return null;
  }
}

export function readConsent(storage = window.localStorage) {
  return parseConsent(storage.getItem(COOKIE_CONSENT_KEY));
}

export function saveConsent(consent, storage = window.localStorage) {
  const normalized = {
    necessary: true,
    analytics: consent.analytics === true,
    marketing: consent.marketing === true,
    timestamp: new Date().toISOString(),
  };
  storage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(normalized));
  return normalized;
}

function appendScriptOnce(documentRef, id, src) {
  if (documentRef.getElementById(id)) return;
  const script = documentRef.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  documentRef.head.appendChild(script);
}

function enableGoogleTagManager(documentRef, windowRef) {
  windowRef.dataLayer = windowRef.dataLayer || [];
  windowRef.gtag = windowRef.gtag || function gtag() {
    windowRef.dataLayer.push(arguments);
  };
  windowRef.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  });
  windowRef.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  appendScriptOnce(documentRef, 'trancoso-gtm', 'https://www.googletagmanager.com/gtm.js?id=GTM-5CQLT5JM');
}

function enableMetaPixel(documentRef, windowRef) {
  void import('../lib/facebook-pixel.ts').then(({ initFacebookPixel }) => {
    initFacebookPixel({ documentRef, windowRef });
  }).catch(() => {
    // O consentimento permanece salvo; o Pixel só é opcional e pode ser reativado na próxima navegação.
  });
}

export function activateOptionalTracking(
  consent,
  documentRef = document,
  windowRef = window,
) {
  if (!consent?.analytics) return;
  enableGoogleTagManager(documentRef, windowRef);
  if (consent.marketing) enableMetaPixel(documentRef, windowRef);
}
