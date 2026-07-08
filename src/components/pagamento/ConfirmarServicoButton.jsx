import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

export default function ConfirmarServicoButton({ payment, onConfirmed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  if (!payment || payment.status !== 'requires_capture') return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await base44.functions.invoke('confirmarServicoConcluido', { payment_id: payment.id });
      queryClient.invalidateQueries({ queryKey: ['myServiceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myPayments'] });
      onConfirmed?.();
    } catch (err) {
      setError(err.message || 'Erro ao confirmar serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </div>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Confirmar Serviço Concluído
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar conclusão do serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao confirmar, o pagamento de <strong>R$ {((payment.amount_provider || 0) / 100).toFixed(2)}</strong> será
              liberado ao prestador automaticamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
              Sim, confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}