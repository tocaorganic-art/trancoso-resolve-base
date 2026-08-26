const OFFICIAL_PIXEL_ID = '908361385639766';
const PIXEL_SCRIPT_ID = 'trancoso-meta-pixel';

type PixelData = Record<string, unknown>;
type PixelFunction = ((command: string, eventName: string, data?: PixelData, options?: Record<string, unknown>) => void) & {
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  callMethod?: (...args: unknown[]) => void;
};

declare global {
  interface ImportMetaEnv {
    readonly VITE_FB_PIXEL_ID?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  interface Window {
    fbq?: PixelFunction;
    _fbq?: Window['fbq'];
  }
}

function getPixelId(): string {
  const configured = import.meta.env.VITE_FB_PIXEL_ID;
  return typeof configured === 'string' && /^\d{8,20}$/.test(configured)
    ? configured
    : OFFICIAL_PIXEL_ID;
}

function hasMarketingConsent(windowRef: Window): boolean {
  try {
    const raw = windowRef.localStorage.getItem('cookie-consent');
    return raw ? JSON.parse(raw).marketing === true : false;
  } catch {
    return false;
  }
}

function appendPixelScript(documentRef: Document): void {
  if (documentRef.getElementById(PIXEL_SCRIPT_ID)) return;
  const script = documentRef.createElement('script');
  script.id = PIXEL_SCRIPT_ID;
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  documentRef.head.appendChild(script);
}

export function initFacebookPixel({
  documentRef = document,
  windowRef = window,
  pixelId = getPixelId(),
}: {
  documentRef?: Document;
  windowRef?: Window;
  pixelId?: string;
} = {}): boolean {
  if (!hasMarketingConsent(windowRef)) return false;

  if (!windowRef.fbq) {
    const fbq = function queuedPixel(command: string, eventName: string, data?: PixelData, options?: Record<string, unknown>) {
      const api = queuedPixel as PixelFunction;
      if (api.callMethod) api.callMethod(command, eventName, data, options);
      else api.queue?.push([command, eventName, data, options]);
    } as PixelFunction;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    windowRef.fbq = fbq;
    windowRef._fbq = fbq;
  }

  appendPixelScript(documentRef);
  if (documentRef.documentElement.dataset.trancosoPixelInitialized !== pixelId) {
    windowRef.fbq?.('init', pixelId);
    windowRef.fbq?.('track', 'PageView');
    documentRef.documentElement.dataset.trancosoPixelInitialized = pixelId;
  }
  return true;
}

function track(eventName: string, data: PixelData = {}, eventId?: string): void {
  if (typeof window === 'undefined' || !hasMarketingConsent(window) || typeof window.fbq !== 'function') return;
  const options = eventId ? { eventID: eventId } : undefined;
  window.fbq('track', eventName, data, options);
}

function eventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function trackLead(data: PixelData = {}): void {
  track('Lead', { content_category: 'servico_local', ...data }, eventId());
}

export function trackRegistration(data: PixelData = {}): void {
  track('CompleteRegistration', { status: true, ...data }, eventId());
}

export function trackPurchase(data: PixelData = {}): void {
  track('Purchase', { currency: 'BRL', ...data }, eventId());
}

export function trackPageView(data: PixelData = {}): void {
  track('PageView', data);
}

export { OFFICIAL_PIXEL_ID };
