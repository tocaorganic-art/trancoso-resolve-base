import { hasMarketingConsent } from '@/utils/consent.js';

const OFFICIAL_PIXEL_ID = '1469130194903035';
const PIXEL_SCRIPT_ID = 'trancoso-meta-pixel';

type PixelData = Record<string, unknown>;
type PixelFunction = ((command: string, eventName: string, data?: PixelData, options?: Record<string, unknown>) => void) & {
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  callMethod?: (...args: unknown[]) => void;
};

declare global { interface Window { fbq?: PixelFunction; _fbq?: Window['fbq']; } }

function appendPixelScript(documentRef: Document): void {
  if (
    documentRef.getElementById(PIXEL_SCRIPT_ID) ||
    documentRef.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]')
  ) return;
  const script = documentRef.createElement('script');
  script.id = PIXEL_SCRIPT_ID;
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  documentRef.head.appendChild(script);
}

export function initFacebookPixel({ documentRef = document, windowRef = window }: {
  documentRef?: Document; windowRef?: Window;
} = {}): boolean {
  if (!hasMarketingConsent(windowRef)) return false;
  if (typeof windowRef.fbq !== 'function') {
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
  if (documentRef.documentElement.dataset.trancosoPixelInitialized !== OFFICIAL_PIXEL_ID) {
    windowRef.fbq?.('init', OFFICIAL_PIXEL_ID);
    documentRef.documentElement.dataset.trancosoPixelInitialized = OFFICIAL_PIXEL_ID;
  }
  return true;
}

function track(eventName: string, data: PixelData = {}, eventId?: string, custom = false): boolean {
  if (typeof window === 'undefined' || !hasMarketingConsent(window)) return false;
  if (!initFacebookPixel()) return false;
  const options = eventId ? { eventID: eventId } : undefined;
  try {
    window.fbq?.(custom ? 'trackCustom' : 'track', eventName, data, options);
    return true;
  } catch {
    return false;
  }
}

export function trackPixelEvent(
  eventName: string,
  data: PixelData = {},
  { custom = false, eventId: providedEventId }: { custom?: boolean; eventId?: string } = {},
): boolean {
  return track(eventName, data, providedEventId, custom);
}

function eventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function trackLead(data: PixelData = {}): void { track('Lead', { content_category: 'servico_local', ...data }, eventId()); }
export function trackRegistration(data: PixelData = {}): void { track('CompleteRegistration', { status: true, ...data }, eventId()); }
export function trackPurchase(data: PixelData = {}): void { track('Purchase', { currency: 'BRL', ...data }, eventId()); }
export function trackPageView(data: PixelData = {}): boolean { return track('PageView', data); }
export { OFFICIAL_PIXEL_ID };
