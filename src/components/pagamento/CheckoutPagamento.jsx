import { useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertCircle } from 'lucide-react';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || '');

export default function CheckoutPagamento({ preferenceId, amountBrl, onSuccess, onCancel }) {
  const [error, setError] = useState(null);

  if (!preferenceId) return null;

  if (window.self !== window.top) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
        ⚠️ O pagamento só funciona no aplicativo publicado, não em preview.
      </div>
    );
  }

  const handleSubmit = async ({ formData }) => {
    setError(null);
    try {
      const result = await base44.functions.invoke('processPayment', {
        preference_id: preferenceId,
        payment_data: formData,
      });
      const status = result?.data?.status;
      if (status === 'approved' || status === 'authorized') {
        onSuccess(result.data.id);
      } else {
        setError('Pagamento não aprovado. Tente outro método.');
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#E8571A] mt-0.5 shrink-0" />
        <p className="text-xs text-orange-800">
          Valor de <strong>R$ {amountBrl.toFixed(2)}</strong> será reservado agora e liberado ao
          prestador somente após você confirmar que o serviço foi concluído.
        </p>
      </div>

      <Payment
        initialization={{ amount: amountBrl, preferenceId }}
        customization={{
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            bankTransfer: ['pix'],
            mercadoPago: ['wallet_purchase', 'onboarding_credits'],
          },
          visual: { style: { theme: 'default' } },
        }}
        onSubmit={handleSubmit}
        onError={(err) => setError(err.message || 'Erro no formulário de pagamento')}
        onReady={() => setError(null)}
      />

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="button" variant="outline" onClick={onCancel} className="w-full">
        Cancelar
      </Button>
    </div>
  );
}
