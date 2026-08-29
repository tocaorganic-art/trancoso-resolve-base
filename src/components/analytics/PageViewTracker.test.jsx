import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CookieConsent from '@/components/CookieConsent';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { initFacebookPixel, OFFICIAL_PIXEL_ID } from '@/lib/facebook-pixel';

function pixelCalls(eventName) {
  return (window.fbq?.queue || []).filter(([, name]) => name === eventName);
}

describe('consentimento e Meta Pixel', () => {
  beforeEach(() => {
    localStorage.clear();
    document.getElementById('trancoso-meta-pixel')?.remove();
    delete document.documentElement.dataset.trancosoPixelInitialized;
    delete window.fbq;
    delete window._fbq;
    delete window.gtag;
    delete window.dataLayer;
    vi.stubEnv('VITE_FB_PIXEL_ID', OFFICIAL_PIXEL_ID);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it('inicializa o Pixel oficial após aceite e envia um único PageView', async () => {
    const view = render(
      <MemoryRouter initialEntries={['/']}>
        <PageViewTracker />
        <CookieConsent />
      </MemoryRouter>,
    );

    expect(window.fbq).toBeUndefined();
    expect(document.getElementById('trancoso-meta-pixel')).toBeNull();

    fireEvent.click(await screen.findByRole('button', { name: 'Aceitar' }));

    expect(document.getElementById('trancoso-meta-pixel')).not.toBeNull();
    expect(pixelCalls(OFFICIAL_PIXEL_ID)).toHaveLength(1);
    expect(pixelCalls('PageView')).toHaveLength(1);

    // Simula a ativação posterior do App e um rerender da mesma rota.
    initFacebookPixel();
    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <PageViewTracker />
        <CookieConsent />
      </MemoryRouter>,
    );

    expect(pixelCalls(OFFICIAL_PIXEL_ID)).toHaveLength(1);
    expect(pixelCalls('PageView')).toHaveLength(1);
  });

  it('mantém Pixel e PageView desativados quando marketing é recusado', async () => {
    const view = render(
      <MemoryRouter initialEntries={['/']}>
        <PageViewTracker />
        <CookieConsent />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Rejeitar' }));
    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <PageViewTracker />
        <CookieConsent />
      </MemoryRouter>,
    );

    expect(window.fbq).toBeUndefined();
    expect(document.getElementById('trancoso-meta-pixel')).toBeNull();
  });
});
