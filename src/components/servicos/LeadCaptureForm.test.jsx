import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  trackLead: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: { functions: { invoke: mocks.invoke } },
}));

vi.mock('@/utils/analytics.js', () => ({ trackLead: mocks.trackLead }));

import LeadCaptureForm from '@/components/servicos/LeadCaptureForm';

function fillForm() {
  fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: 'Pessoa Teste' } });
  fireEvent.change(screen.getByRole('textbox', { name: /WhatsApp/ }), { target: { value: '73999990000' } });
  fireEvent.change(screen.getByLabelText(/Localização/), { target: { value: 'Trancoso' } });
  fireEvent.click(screen.getByRole('checkbox'));
}

describe('WhatsApp mobile após captura de lead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('abre sincronamente, redireciona após o await e não duplica o envio', async () => {
    const order = [];
    let resolveInvoke;
    const invokePromise = new Promise((resolve) => { resolveInvoke = resolve; });
    const popup = { location: { href: '' }, close: vi.fn() };
    vi.spyOn(window, 'open').mockImplementation(() => {
      order.push('open');
      return popup;
    });
    mocks.invoke.mockImplementation(() => {
      order.push('invoke');
      return invokePromise;
    });

    render(<LeadCaptureForm serviceInterest="Limpeza" source="teste-mobile" />);
    fillForm();
    const form = screen.getByRole('button', { name: /Quero ser atendido/ }).closest('form');

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(order).toEqual(['open', 'invoke']);
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    expect(popup.location.href).toBe('');

    await act(async () => resolveInvoke({ ok: true }));

    const fallback = await screen.findByRole('link', { name: 'Não abriu? Continuar no WhatsApp' });
    expect(popup.location.href).toMatch(/^https:\/\/wa\.me\//);
    expect(fallback).toHaveAttribute('href', popup.location.href);
    expect(mocks.trackLead).toHaveBeenCalledTimes(1);
  });

  it('mostra fallback seguro quando o popup é bloqueado', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    mocks.invoke.mockResolvedValue({ ok: true });

    render(<LeadCaptureForm serviceInterest="Limpeza" source="teste-mobile" />);
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /Quero ser atendido/ }).closest('form'));

    const fallback = await screen.findByRole('link', { name: /bloqueou o popup/ });
    expect(fallback).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\//));
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
});
