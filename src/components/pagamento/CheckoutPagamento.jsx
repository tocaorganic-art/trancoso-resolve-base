import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';

// Checkout via Mercado Pago (redirect para init_point)
// Props:
//   checkoutUrl  — init_point retornado por criarPagamentoServico (MP)
//   clientSecret — legado Stripe (ignorado; mantido para compatibilidade de props)
//   amountBrl    — valor em reais (number)
//   onCancel     — callback ao cancelar

export default function CheckoutPagamento({ checkoutUrl, clientSecret, amountBrl, onCancel }) {
  // Suporte legado: se receber clientSecret (Stripe) sem checkoutUrl, avisa
  const url = checkoutUrl || null;

  if (!url) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Checkout em atualização</p>
            <p className="mt-1">
              O sistema de pagamento foi migrado para Mercado Pago. Se você está vendo esta mensagem,
              entre em contato com o suporte: contato@trancosoresolve.com.br
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Valor de <strong>R$ {Number(amountBrl).toFixed(2)}</strong> será reservado agora
          e liberado ao prestador somente após você confirmar que o serviço foi concluído.
          Pagamento processado com segurança pelo Mercado Pago.
        </p>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          className="flex-1 bg-[#009EE3] hover:bg-[#0087C3] text-white font-semibold"
          onClick={() => window.location.href = url}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Pagar R$ {Number(amountBrl).toFixed(2)} com Mercado Pago
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Você será redirecionado para o ambiente seguro do Mercado Pago
      </p>
    </div>
  );
}
