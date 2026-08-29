import { beforeEach, describe, expect, it, vi } from 'vitest';

import { trackFirstRegistration } from '@/utils/analytics.js';

describe('CompleteRegistration', () => {
  beforeEach(() => {
    localStorage.setItem('cookie-consent', JSON.stringify({ marketing: true }));
    window.fbq = vi.fn();
    window.gtag = vi.fn();
  });

  it.each(['cliente', 'prestador'])('dispara uma vez no primeiro cadastro de %s', (userType) => {
    const user = { user_type: 'indefinido' };
    let alreadyTracked = false;

    alreadyTracked = trackFirstRegistration(user, userType, alreadyTracked);
    alreadyTracked = trackFirstRegistration(user, userType, alreadyTracked);

    const registrations = window.fbq.mock.calls.filter(([, event]) => event === 'CompleteRegistration');
    const signUps = window.gtag.mock.calls.filter(([, event]) => event === 'sign_up');
    expect(alreadyTracked).toBe(true);
    expect(registrations).toHaveLength(1);
    expect(signUps).toHaveLength(1);
  });

  it.each(['cliente', 'prestador'])('não repete em retorno, login ou troca de tipo de %s', (userType) => {
    const alreadyRegistered = { user_type: userType };

    expect(trackFirstRegistration(alreadyRegistered, userType, false)).toBe(false);
    expect(window.fbq).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
