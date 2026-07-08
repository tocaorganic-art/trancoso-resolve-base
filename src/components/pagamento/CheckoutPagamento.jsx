import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || window.__STRIPE_PK__ || '');

function PaymentForm({ onSuccess, onCancel, amountBrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'requires_capture') {
      onSuccess(paymentIntent.id);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Valor de <strong>R$ {(amountBrl).toFixed(2)}</strong> será reservado agora e liberado ao prestador
          somente após você confirmar que o serviço foi concluído.
        </p>
      </div>

      <PaymentElement />

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={!stripe || loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processando...</> : `Reservar R$ ${amountBrl.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

export default function CheckoutPagamento({ clientSecret, amountBrl, onSuccess, onCancel }) {
  if (!clientSecret) return null;

  // Bloqueia se estiver em iframe
  if (window.self !== window.top) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
        ⚠️ O pagamento só funciona no aplicativo publicado, não em preview.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: 'pt-BR' }}>
      <PaymentForm onSuccess={onSuccess} onCancel={onCancel} amountBrl={amountBrl} />
    </Elements>
  );
}