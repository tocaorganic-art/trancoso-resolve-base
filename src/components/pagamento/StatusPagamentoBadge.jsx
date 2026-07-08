import React from 'react';
import { Badge } from '@/components/ui/badge';

const config = {
  requires_payment_method: { label: 'Aguardando Pagamento', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  requires_confirmation:   { label: 'Confirmando...', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  requires_capture:        { label: '💰 Em Custódia', className: 'bg-teal-100 text-teal-800 border-teal-300' },
  processing:              { label: 'Processando', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  captured:                { label: '✅ Pago', className: 'bg-green-100 text-green-800 border-green-300' },
  canceled:                { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 border-slate-300' },
  disputed:                { label: '⚠️ Em Disputa', className: 'bg-red-100 text-red-800 border-red-300' },
  refunded:                { label: 'Reembolsado', className: 'bg-purple-100 text-purple-800 border-purple-300' },
};

export default function StatusPagamentoBadge({ status }) {
  const cfg = config[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}