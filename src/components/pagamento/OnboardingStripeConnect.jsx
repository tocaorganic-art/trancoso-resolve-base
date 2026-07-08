import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, CheckCircle2, AlertCircle, Banknote } from 'lucide-react';

export default function OnboardingStripeConnect({ providerId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: accounts, refetch } = useQuery({
    queryKey: ['providerStripeAccount', providerId],
    queryFn: () => base44.entities.ProviderStripeAccount.filter({ provider_id: providerId }),
    enabled: !!providerId,
    initialData: [],
  });

  const account = accounts?.[0];
  const isComplete = account?.onboarding_status === 'complete' && account?.charges_enabled;

  const handleStartOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.functions.invoke('onboardingStripeConnect', { provider_id: providerId });
      if (result?.data?.onboarding_url) {
        window.open(result.data.onboarding_url, '_blank');
        // Aguarda retorno e refaz a consulta
        setTimeout(() => refetch(), 3000);
      }
    } catch (err) {
      setError(err.message || 'Erro ao iniciar onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="w-5 h-5 text-blue-600" />
          Receber Pagamentos (Stripe)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isComplete ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Conta verificada!</p>
              <p className="text-xs text-green-600">Você receberá 80% do valor dos serviços automaticamente.</p>
            </div>
          </div>
        ) : account?.stripe_account_id ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Cadastro incompleto</p>
                <p className="text-xs">Complete seu cadastro para receber pagamentos.</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {account.stripe_account_id}
            </Badge>
            <Button onClick={handleStartOnboarding} disabled={loading} className="w-full" size="sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              Continuar Cadastro
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Conecte sua conta bancária para receber <strong>80%</strong> do valor dos serviços automaticamente após confirmação do cliente.
            </p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>✅ Pagamentos seguros via Stripe</li>
              <li>✅ Transferência automática após confirmação</li>
              <li>✅ Painel de ganhos e histórico</li>
            </ul>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
            )}
            <Button onClick={handleStartOnboarding} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              Cadastrar para Receber Pagamentos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}