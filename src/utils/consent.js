export const COOKIE_CONSENT_KEY = 'cookie-consent';
export const CONSENT_CHANGED_EVENT = 'trancoso:consent-changed';

function getStorage(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

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

export function readConsent(storage) {
  const targetStorage = getStorage(storage);
  return targetStorage ? parseConsent(targetStorage.getItem(COOKIE_CONSENT_KEY)) : null;
}

export function saveConsent(consent, storage) {
  const normalized = {
    necessary: true,
    analytics: consent.analytics === true,
    marketing: consent.marketing === true,
    timestamp: new Date().toISOString(),
  };
  const targetStorage = getStorage(storage);
  if (!targetStorage) return normalized;
  targetStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(normalized));
  return normalized;
}

export function hasConsent(category, windowRef = typeof window === 'undefined' ? null : window) {
  try {
    return Boolean(windowRef && readConsent(windowRef.localStorage)?.[category] === true);
  } catch {
    return false;
  }
}

export function hasAnalyticsConsent(windowRef) {
  return hasConsent('analytics', windowRef);
}

export function hasMarketingConsent(windowRef) {
  return hasConsent('marketing', windowRef);
}

export function trackAnalyticsEvent(eventName, params = {}, windowRef = typeof window === 'undefined' ? null : window) {
  if (!hasAnalyticsConsent(windowRef) || typeof windowRef?.gtag !== 'function') return false;
  windowRef.gtag('event', eventName, params);
  return true;
}

export function trackAnalyticsPageView(params = {}, windowRef = typeof window === 'undefined' ? null : window) {
  if (!hasAnalyticsConsent(windowRef) || typeof windowRef?.gtag !== 'function') return false;
  windowRef.gtag('config', 'G-3KF75243B4', params);
  return true;
}

function appendScriptOnce(documentRef, id, src) {
  if (documentRef.getElementById(id)) return;
  const script = documentRef.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  documentRef.head.appendChild(script);
}

function enableGoogleTagManager(documentRef, windowRef, consent) {
  windowRef.dataLayer = windowRef.dataLayer || [];
  windowRef.gtag = windowRef.gtag || function gtag() {
    windowRef.dataLayer.push(arguments);
  };
  windowRef.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
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
  if (!consent) return;
  if (consent.analytics) enableGoogleTagManager(documentRef, windowRef, consent);
  if (consent.marketing) enableMetaPixel(documentRef, windowRef);
}
