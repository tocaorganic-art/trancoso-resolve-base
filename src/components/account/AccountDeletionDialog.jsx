import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function AccountDeletionDialog({ providerId, userEmail }) {
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation
  const [confirmationText, setConfirmationText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const requiredText = 'excluir minha conta permanentemente';

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // Delete provider profile if exists
      if (providerId) {
        await base44.entities.ServiceProvider.delete(providerId);
      }

      // Delete all associated entities (subscriptions, service requests, etc)
      const [subs, requests, reviews] = await Promise.all([
        base44.entities.Subscription.filter({ user_email: userEmail }),
        base44.entities.ServiceRequest.filter({ created_by: userEmail }),
        base44.entities.ServiceReview.filter({ created_by: userEmail }),
      ]);

      await Promise.all([
        ...subs.map(s => base44.entities.Subscription.delete(s.id)),
        ...requests.map(r => base44.entities.ServiceRequest.delete(r.id)),
        ...reviews.map(r => base44.entities.ServiceReview.delete(r.id)),
      ]);

      // Logout
      await base44.auth.logout('/');
    },
    onError: (error) => {
      toast.error('Erro ao excluir conta', { 
        description: error.message 
      });
    },
  });

  const handleConfirmDeletion = () => {
    if (confirmationText.toLowerCase() !== requiredText.toLowerCase()) {
      toast.error('Texto de confirmação incorreto');
      return;
    }
    deleteAccountMutation.mutate();
  };

  const handleOpenChange = (open) => {
    setOpenDialog(open);
    if (!open) {
      setStep(1);
      setConfirmationText('');
    }
  };

  return (
    <AlertDialog open={openDialog} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="select-none">
          <Trash2 className="w-4 h-4 mr-2 select-none" />
          Excluir Conta
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
        {step === 1 ? (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="dark:text-slate-300">
                <div className="space-y-3 mt-2">
                  <p className="font-semibold text-foreground dark:text-slate-100">Esta ação é irreversível!</p>
                  <ul className="list-disc list-inside space-y-1 text-sm dark:text-slate-400">
                    <li>Seu perfil de prestador será deletado</li>
                    <li>Todos os seus dados serão removidos permanentemente</li>
                    <li>Avaliações e histórico de serviços serão excluídos</li>
                    <li>Você será desconectado imediatamente</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="select-none dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                Cancelar
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setStep(2)}
                className="select-none"
              >
                Continuar com exclusão
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-slate-100">Confirmar exclusão da conta</AlertDialogTitle>
              <AlertDialogDescription className="dark:text-slate-300">
                <div className="space-y-4 mt-4">
                  <p className="text-sm font-medium text-foreground dark:text-slate-100">
                    Para confirmar, digite exatamente:
                  </p>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded text-sm font-mono text-red-800 dark:text-red-300">
                    {requiredText}
                  </div>
                  <Label htmlFor="confirmation" className="text-foreground dark:text-slate-100">
                    Confirmação:
                  </Label>
                  <Input
                    id="confirmation"
                    placeholder="Digite o texto acima..."
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className={cn(
                      'dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100',
                      confirmationText.toLowerCase() === requiredText.toLowerCase()
                        ? 'border-green-500'
                        : 'border-slate-300'
                    )}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={deleteAccountMutation.isPending}
                className="dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:border-slate-600 select-none"
              >
                Voltar
              </Button>
              <AlertDialogAction
                className={cn(
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90 select-none',
                  confirmationText.toLowerCase() !== requiredText.toLowerCase()
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                )}
                onClick={handleConfirmDeletion}
                disabled={
                  deleteAccountMutation.isPending ||
                  confirmationText.toLowerCase() !== requiredText.toLowerCase()
                }
              >
                {deleteAccountMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {deleteAccountMutation.isPending ? 'Excluindo...' : 'Sim, excluir minha conta'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}