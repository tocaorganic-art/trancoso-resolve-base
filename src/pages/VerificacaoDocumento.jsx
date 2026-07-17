import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DocumentVerificationFlow from '@/components/verificacao/DocumentVerificationFlow';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export default function VerificacaoDocumentoPage() {
  const navigate = useNavigate();

  // Verificar autenticação e tipo de usuário
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
    queryKey: ['verificacao', provider?.id],
    queryFn: async () => {
      if (!provider?.id) return null;
      const verifList = await base44.entities.Verificacao.filter({
        provider_id: provider.id,
        verification_type: 'identity',
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

  const handleVerificationComplete = async (result) => {
    // Aguardar atualização do estado e redirecionar
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
              Esta página é apenas para prestadores de serviço verificados.
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
            Verificação de Identidade
          </h1>
          <p className="text-slate-600 text-lg">
            Aumente sua credibilidade e apareça no topo das buscas
          </p>
        </div>

        {/* Status de Verificação Atual */}
        {provider && (
          <div className="mb-8">
            {provider.verified ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 flex items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">Seu perfil já está verificado!</h3>
                    <p className="text-green-800 text-sm mt-1">
                      Você aparece nos topo das buscas e tem acesso a todos os recursos premium.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : verificacao?.status === 'pending_review' ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 flex items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 shrink-0 animate-spin" />
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">Verificação em análise</h3>
                    <p className="text-blue-800 text-sm mt-1">
                      Seu documento foi recebido e está sendo analisado. Você receberá um email em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-900 mb-2">Por que se verificar?</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>✅ Apareça no topo das buscas</li>
                  <li>✅ Aumente a confiança de clientes em 40%</li>
                  <li>✅ Desbloqueie planos premium</li>
                  <li>✅ Receba mais solicitações de serviço</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Fluxo de Verificação */}
        {!provider?.verified && verificacao?.status !== 'pending_review' && (
          <DocumentVerificationFlow
            prestadorId={provider?.id}
            onVerificationComplete={handleVerificationComplete}
          />
        )}

        {/* Info de Segurança */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-bold text-slate-900 mb-3 text-sm">🔒 Segurança de Dados</h4>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>• Seus dados são criptografados e nunca compartilhados com terceiros</li>
            <li>• Análise é feita com IA moderna de visão computacional</li>
            <li>• Documentos são validados contra bases oficiais</li>
            <li>• Você pode solicitar exclusão dos dados a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}