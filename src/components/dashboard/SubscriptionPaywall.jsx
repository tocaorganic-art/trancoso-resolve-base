import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { LockKeyhole, CreditCard, Zap, Gift, Loader2 } from "lucide-react";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import { criarTrialPrestador } from "@/functions/criarTrialPrestador";
import { toast } from "sonner";

export default function SubscriptionPaywall({ subscriptionStatus, isTrial, hasAnySubscription, userEmail }) {
  const [activatingTrial, setActivatingTrial] = useState(false);

  const handleActivateTrial = async () => {
    setActivatingTrial(true);
    try {
      await criarTrialPrestador({ user_email: userEmail });
      localStorage.setItem('trial_pendente', Date.now().toString());
      toast.success("Trial ativado! Carregando seu painel...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      toast.error("Não foi possível ativar o trial. Tente novamente.");
      setActivatingTrial(false);
    }
  };

  // Mostra botão de trial apenas quando não há nenhuma assinatura prévia
  const showTrialButton = !hasAnySubscription && userEmail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <LockKeyhole className="w-8 h-8 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Painel Bloqueado
        </h1>

        <p className="text-slate-600 mb-4 leading-relaxed">
          Para usar seu painel, receber pedidos e ser encontrado pelos clientes no Trancoso Resolve, você precisa ter uma assinatura ativa.
        </p>

        {subscriptionStatus && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 inline-block">
            <p className="text-sm text-amber-800 font-medium">
              Status atual:{" "}
              <span className="font-bold">
                {subscriptionStatus === "expired"
                  ? "Trial expirado"
                  : subscriptionStatus === "cancelled"
                  ? "Assinatura cancelada"
                  : "Sem assinatura ativa"}
              </span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          {showTrialButton && (
            <Button
              onClick={handleActivateTrial}
              disabled={activatingTrial}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold h-12 text-base"
            >
              {activatingTrial ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Gift className="w-5 h-5 mr-2" />
              )}
              Ativar teste grátis de 14 dias
            </Button>
          )}

          <Link to={createPageUrl("Planos")} className="block">
            <Button className={`w-full font-bold h-12 text-base ${showTrialButton ? 'bg-white border-2 border-amber-600 text-amber-700 hover:bg-amber-50' : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600'}`} variant={showTrialButton ? "outline" : "default"}>
              <CreditCard className="w-5 h-5 mr-2" />
              {showTrialButton ? "Ou assinar direto" : "Ativar assinatura"}
            </Button>
          </Link>

          <div className="bg-amber-50 rounded-lg p-3 text-left">
            <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> O que você terá ao assinar:
            </p>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>✓ Perfil visível para turistas e moradores</li>
              <li>✓ Receba pedidos de agendamento</li>
              <li>✓ Clientes podem chamar via WhatsApp</li>
              <li>✓ Agenda, financeiro e painel completo</li>
            </ul>
          </div>
        </div>

        {isTrial && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 mb-2">Seu trial expirou. Caso prefira cancelar:</p>
            <CancelSubscriptionButton />
          </div>
        )}

        <p className="text-xs text-slate-400 mt-5">
          Dúvidas? contato@tocaexperience.com.br
        </p>
      </div>
    </div>
  );
}