import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
  fireEvent.change(screen.getByLabelText(/Telefone/), { target: { value: '73999990000' } });
  fireEvent.change(screen.getByLabelText(/Serviço de interesse/), { target: { value: 'Limpeza' } });
  fireEvent.change(screen.getByLabelText(/Localização/), { target: { value: 'Trancoso' } });
  fireEvent.click(screen.getByRole('checkbox'));
}

describe('Envio de lead sem WhatsApp público', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('envia o lead via createPublicLead e mostra confirmação, sem abrir WhatsApp', async () => {
    const openSpy = vi.spyOn(window, 'open');
    mocks.invoke.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <LeadCaptureForm serviceInterest="Limpeza" source="teste-mobile" />
      </MemoryRouter>
    );
    fillForm();
    fireEvent.submit(screen.getByRole('button', { name: /Quero ser atendido/ }).closest('form'));

    await screen.findByText('Recebemos seu contato! ✅');

    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    const [fnName, payload] = mocks.invoke.mock.calls[0];
    expect(fnName).toBe('createPublicLead');
    expect(payload).toMatchObject({ type: 'cliente', consent: true });
    expect(mocks.trackLead).toHaveBeenCalledTimes(1);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('não duplica o envio ao submeter duas vezes antes da resposta', async () => {
    let resolveInvoke;
    const invokePromise = new Promise((resolve) => { resolveInvoke = resolve; });
    mocks.invoke.mockImplementation(() => invokePromise);

    render(
      <MemoryRouter>
        <LeadCaptureForm serviceInterest="Limpeza" source="teste-mobile" />
      </MemoryRouter>
    );
    fillForm();
    const form = screen.getByRole('button', { name: /Quero ser atendido/ }).closest('form');

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(mocks.invoke).toHaveBeenCalledTimes(1);

    await act(async () => resolveInvoke({ ok: true }));
    await screen.findByText('Recebemos seu contato! ✅');

    expect(mocks.trackLead).toHaveBeenCalledTimes(1);
  });
});
