import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  filter: vi.fn(),
  invoke: vi.fn(),
  me: vi.fn(),
}));

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: mocks.me, redirectToLogin: vi.fn() },
    entities: { Subscription: { filter: mocks.filter } },
    functions: { invoke: mocks.invoke },
  },
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/components/auth/CompletarPerfilModal', () => ({ default: () => null }));

import WhatsAppCallButton from '@/components/whatsapp/WhatsAppCallButton';

describe('WhatsAppCallButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.me.mockResolvedValue({ id: 'cliente-1', phone: '73999990000' });
    mocks.filter.mockResolvedValue([{ status: 'active', next_billing_date: '2099-01-01' }]);
  });

  afterEach(cleanup);

  it('bloqueia duas chamadas disparadas no mesmo ciclo', async () => {
    let resolveInvoke;
    mocks.invoke.mockReturnValue(new Promise((resolve) => { resolveInvoke = resolve; }));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <WhatsAppCallButton
          provider={{
            id: 'prestador-1',
            created_by: 'prestador@example.com',
            full_name: 'Pessoa Prestadora',
            status_verificacao: 'aprovado',
          }}
        />
      </QueryClientProvider>,
    );

    const button = await screen.findByRole('button', { name: /Chamar prestador/ });
    await waitFor(() => expect(button).not.toBeDisabled());

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    expect(mocks.invoke).toHaveBeenCalledWith('chamarPrestador', { id_prestador: 'prestador-1' });

    await act(async () => {
      resolveInvoke({
        data: {
          provider_name: 'Pessoa Prestadora',
          whatsapp_prestador: '73999990001',
          whatsapp_cliente: '73999990000',
        },
      });
    });
  });
});
