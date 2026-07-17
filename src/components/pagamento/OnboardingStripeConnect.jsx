import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Banknote, Info } from 'lucide-react';

// ⚠️ Stripe Connect foi desativado. Este componente mostra o status da conta
// Mercado Pago do prestador (ProviderMercadoPagoAccount).
// O onboarding MP Connect será implementado em uma próxima fase.

export default function OnboardingMPConnect({ providerId }) {
  const { data: accounts } = useQuery({
    queryKey: ['providerMPAccount', providerId],
    queryFn: () => base44.entities.ProviderMercadoPagoAccount.filter({ provider_id: providerId }),
    enabled: !!providerId,
    initialData: [],
  });

  const account = accounts?.[0];
  const isComplete = account?.mp_onboarding_completed && account?.charges_enabled;

  return (
    <Card className="border-2 border-dashed border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="w-5 h-5 text-[#009EE3]" />
          Receber Pagamentos (Mercado Pago)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isComplete ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Conta verificada!</p>
              <p className="text-xs text-green-600">
                Você receberá pagamentos automaticamente pelo Mercado Pago.
              </p>
            </div>
          </div>
        ) : account?.mp_user_id ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Conta conectada, pendente de verificação</p>
                <p className="text-xs">Aguardando aprovação do Mercado Pago para liberar recebimentos.</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              MP User ID: {account.mp_user_id}
            </Badge>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700">
                Integração de recebimentos via Mercado Pago em configuração.
                Entre em contato: <strong>contato@trancosoresolve.com.br</strong>
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>✅ Pagamentos via Mercado Pago</li>
              <li>✅ Transferência após confirmação do cliente</li>
              <li>✅ Painel de ganhos e histórico</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
