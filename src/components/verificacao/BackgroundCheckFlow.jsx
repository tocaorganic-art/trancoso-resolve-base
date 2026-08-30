import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function BackgroundCheckFlow({ prestadorId, onVerificationComplete }) {
  const [step, setStep] = useState('form'); // 'form', 'processing', 'result'
  const [formData, setFormData] = useState({
    cpf: '',
    fullName: '',
    dateOfBirth: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.cpf || !formData.fullName || !formData.dateOfBirth) {
      alert('Preencha todos os campos obrigatórios');
      return false;
    }
    // Validar CPF básico
    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      alert('CPF inválido');
      return false;
    }
    return true;
  };

  const processVerification = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setStep('processing');

    try {
      // Salva o CPF informado no cadastro do prestador (o backend consulta a partir dele)
      await base44.entities.ServiceProvider.update(prestadorId, {
        cpf: formData.cpf.replace(/\D/g, ''),
      });

      const res = await base44.functions.invoke('verificarAntecedentes', {
        service_provider_id: prestadorId,
      });
      const data = res?.data || {};

      const statusMap = {
        aprovado: 'approved',
        em_analise_manual: 'pending_review',
        reprovado: 'rejected',
      };
      const status = statusMap[data.status || data.status_verificacao] || 'rejected';
      const result = {
        status,
        message: status === 'approved'
          ? 'A etapa de verificação foi concluída.'
          : status === 'pending_review'
            ? 'Sua solicitação está em análise pela equipe.'
            : 'Seu cadastro não foi autorizado.',
      };

      setVerificationResult(result);
      setStep('result');

      if (result.status === 'approved') {
        onVerificationComplete?.(result);
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      setVerificationResult({
        status: 'error',
        message: 'Erro ao processar verificação. Tente novamente.',
        error: error.message,
      });
      setStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setFormData({
      cpf: '',
      fullName: '',
      dateOfBirth: '',
    });
    setVerificationResult(null);
    setStep('form');
  };

  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        .replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3')
        .replace(/(\d{3})(\d{3})/, '$1.$2')
        .replace(/(\d{3})/, '$1');
    }
    return value;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-cyan-600" />
          Verificação de Antecedentes
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Sua segurança é prioridade. A verificação pode exigir análise automática e revisão da equipe.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Passo 1: Formulário */}
        {step === 'form' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              ℹ️ Seus dados são tratados somente para a finalidade autorizada de verificação. Você pode solicitar exclusão a qualquer momento.
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
              O resultado será informado apenas como concluído, em análise ou não autorizado. Detalhes da análise não são exibidos nesta tela.
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">CPF *</label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">Nome Completo *</label>
              <Input
                type="text"
                placeholder="Digite seu nome completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value.toUpperCase())}
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">Data de Nascimento *</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="h-11"
              />
            </div>

            <Button
              onClick={processVerification}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold h-12"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando Antecedentes...
                </>
              ) : (
                'Iniciar Verificação'
              )}
            </Button>
          </div>
        )}

        {/* Passo 2: Processamento */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            <p className="text-lg font-semibold text-slate-900">Validando antecedentes...</p>
            <p className="text-sm text-slate-600 text-center">
              Processando sua solicitação de verificação. Isso pode levar alguns segundos.
            </p>
          </div>
        )}

        {/* Passo 3: Resultado */}
        {step === 'result' && verificationResult && (
          <div className="space-y-6">
            {verificationResult.status === 'approved' ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="bg-green-100 rounded-full p-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-green-900">Verificação Aprovada!</h3>
                  <p className="text-green-800">
                    Seu perfil está verificado. Você tem maior confiabilidade junto aos clientes.
                  </p>
                  <Badge className="bg-green-600 text-white">✓ Verificado</Badge>
                </div>
                <p className="text-sm text-slate-600 text-center">
                  A etapa de verificação foi concluída.
                </p>
              </>
            ) : verificationResult.status === 'pending_review' ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="bg-yellow-100 rounded-full p-3">
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-900">Análise Manual Necessária</h3>
                  <p className="text-yellow-800">
                    Seus dados requerem análise manual. Você receberá um email em breve com o resultado.
                  </p>
                  <Badge className="bg-yellow-600 text-white">⏳ Em Análise</Badge>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="bg-red-100 rounded-full p-3">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-red-900">Verificação Não Aprovada</h3>
                  <p className="text-red-800">{verificationResult.message}</p>
                </div>
                <p className="text-sm text-slate-600 text-center">
                  Se acredita que há um erro, entre em contato com nosso suporte.
                </p>
              </>
            )}

            <Button onClick={resetFlow} variant="outline" className="w-full">
              {verificationResult.status === 'approved' ? 'Fechar' : 'Tentar Novamente'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
