import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  trackLead: vi.fn(),
  trackRegistration: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: { functions: { invoke: mocks.invoke } },
}));

vi.mock('@/utils/analytics.js', () => ({
  trackLead: mocks.trackLead,
  trackPrestadorCadastro: mocks.trackRegistration,
}));

import LeadPrestadorForm from '@/components/leads/LeadPrestadorForm';

describe('lead público de prestador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.invoke.mockResolvedValue({ ok: true });
  });

  it('registra Lead, sem contar a consulta como CompleteRegistration', async () => {
    render(<LeadPrestadorForm />);

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'Pessoa Teste' } });
    fireEvent.change(screen.getByPlaceholderText('(73) 9 0000-0000'), { target: { value: '(73) 99999-0000' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Elétrica' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Receber informações no WhatsApp' }));

    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1));
    expect(mocks.trackLead).toHaveBeenCalledTimes(1);
    expect(mocks.trackRegistration).not.toHaveBeenCalled();
  });
});
