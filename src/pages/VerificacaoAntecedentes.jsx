import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BackgroundCheckFlow from '@/components/verificacao/BackgroundCheckFlow';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export default function VerificacaoAntecedentesPage() {
  const navigate = useNavigate();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: provider, isLoading: isLoadingProvider } = useQuery({
    queryKey: ['myProvider', user?.id],
    queryFn: async () => {
      const providers = await base44.entities.ServiceProvider.filter({
        email: user.email,
      });
      return providers?.[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: verificacao } = useQuery({
    queryKey: ['verificacaoAntecedentes', provider?.id],
    queryFn: async () => {
      if (!provider?.id) return null;
      const verifList = await base44.entities.Verificacao.filter({
        provider_id: provider.id,
        verification_type: 'background_check',
      });
      return verifList?.[0] || null;
    },
    enabled: !!provider?.id,
  });

  useEffect(() => {
    if (!isLoadingUser && !user) {
      navigate('/');
    }
    if (!isLoadingUser && user?.user_type !== 'prestador') {
      navigate('/');
    }
  }, [user, isLoadingUser, navigate]);

  const handleVerificationComplete = () => {
    setTimeout(() => {
      navigate('/Dashboard');
    }, 2000);
  };

  if (isLoadingUser || isLoadingProvider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'prestador') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-none shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Acesso Restrito</h2>
            <p className="text-slate-600">
              Esta página é apenas para prestadores de serviço.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Verificação de Antecedentes
          </h1>
          <p className="text-slate-600 text-lg">
            Comprovamos que você não tem antecedentes criminais
          </p>
        </div>

        {/* Status Atual */}
        {provider && (
          <div className="mb-8">
            {verificacao?.status === 'approved' ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 flex items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">Verificação Aprovada!</h3>
                    <p className="text-green-800 text-sm mt-1">
                      Seus antecedentes foram validados. Você tem maior confiabilidade.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : verificacao?.status === 'pending_review' ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 flex items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 shrink-0 animate-spin" />
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">Análise em Andamento</h3>
                    <p className="text-blue-800 text-sm mt-1">
                      Seus dados estão sendo verificados. Você receberá um email em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-900 mb-2">Por que se verificar?</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>✅ Aumente confiança de clientes em 50%</li>
                  <li>✅ Acesse planos premium exclusivos</li>
                  <li>✅ Receba mais solicitações de serviço</li>
                  <li>✅ Apareça em destaque nas buscas</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Fluxo de Verificação */}
        {verificacao?.status !== 'approved' && verificacao?.status !== 'pending_review' && (
          <BackgroundCheckFlow
            prestadorId={provider?.id}
            onVerificationComplete={handleVerificationComplete}
          />
        )}

        {/* Info de Segurança */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-bold text-slate-900 mb-3 text-sm">🔒 Como Funciona</h4>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>• Seus dados são consultados contra bases de dados oficiais</li>
            <li>• Análise totalmente criptografada e segura</li>
            <li>• Resultado imediato ou análise manual em casos específicos</li>
            <li>• Você pode solicitar exclusão dos dados a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}