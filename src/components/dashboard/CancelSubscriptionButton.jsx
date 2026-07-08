import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, XCircle } from "lucide-react";
import { cancelarAssinatura } from "@/functions/cancelarAssinatura";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CancelSubscriptionButton({ accessUntil }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await cancelarAssinatura({});
      if (res.data?.ok) {
        const until = res.data.access_until;
        toast.success(
          until
            ? `Assinatura cancelada. Você terá acesso até ${new Date(until + "T00:00:00").toLocaleDateString("pt-BR")}.`
            : "Assinatura cancelada com sucesso."
        );
        queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
      } else {
        toast.error(res.data?.error || "Erro ao cancelar assinatura.");
      }
    } catch {
      toast.error("Erro ao cancelar assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" size="sm">
          <XCircle className="w-4 h-4 mr-2" />
          Cancelar assinatura
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
          <AlertDialogDescription>
            Ao cancelar, você manterá o acesso até o fim do período já pago{accessUntil ? ` (${new Date(accessUntil + 'T00:00:00').toLocaleDateString('pt-BR')})` : ""}.
            Após essa data, seu perfil ficará invisível e os clientes não poderão mais entrar em contato.
            <br /><br />
            Esta ação não tem como ser desfeita. Para voltar, você precisará fazer uma nova assinatura.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sim, cancelar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}