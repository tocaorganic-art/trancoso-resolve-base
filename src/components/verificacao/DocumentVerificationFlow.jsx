import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import LiveCameraCapture from '@/components/perfil/LiveCameraCapture';

export default function DocumentVerificationFlow({ prestadorId, onVerificationComplete }) {
  const [step, setStep] = useState('upload'); // 'upload', 'camera', 'processing', 'result'
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDocumentUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => setDocumentPreview(evt.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieCapture = (imageSrc) => {
    // Converter dataURL para File
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setSelfieFile(file);
        setSelfiePreview(imageSrc);
        setStep('processing');
      });
  };

  const processVerification = async () => {
    if (!documentFile || !selfieFile) {
      alert('Por favor, envie documento e selfie');
      return;
    }

    setIsProcessing(true);
    try {
      // Upload documento
      const docRes = await base44.integrations.Core.UploadFile({ file: documentFile });
      const docUrl = docRes.file_url;

      // Upload selfie
      const selfieRes = await base44.integrations.Core.UploadFile({ file: selfieFile });
      const selfieUrl = selfieRes.file_url;

      // Chamar backend para análise com IA
      const result = await base44.functions.invoke('verificarDocumento', {
        prestadorId,
        documentUrl: docUrl,
        selfieUrl: selfieUrl,
      });

      setVerificationResult(result);
      setStep('result');

      // Se passou, chamar callback
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
    setDocumentFile(null);
    setDocumentPreview(null);
    setSelfieFile(null);
    setSelfiePreview(null);
    setVerificationResult(null);
    setStep('upload');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-cyan-600" />
          Verificação de Identidade
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Envie seu documento de identidade e um selfie para verificação automática
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Passo 1: Upload de Documento */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* Document Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-900">
                1. Documento de Identidade (RG/CNH/Passaporte)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-all"
              >
                {documentPreview ? (
                  <div className="space-y-3">
                    <img src={documentPreview} alt="Documento" className="h-40 mx-auto object-cover rounded" />
                    <p className="text-sm text-slate-600">{documentFile?.name}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocumentFile(null);
                        setDocumentPreview(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" /> Trocar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">Clique para enviar documento</p>
                    <p className="text-xs text-slate-500">PNG, JPG até 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </div>

            {/* Selfie Capture/Upload */}
            {documentPreview && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  2. Selfie para Validação de Rosto
                </label>
                {selfiePreview ? (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                    <img src={selfiePreview} alt="Selfie" className="h-40 mx-auto object-cover rounded" />
                    <p className="text-sm text-slate-600 text-center">Selfie capturada</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelfieFile(null);
                        setSelfiePreview(null);
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Capturar Novamente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <LiveCameraCapture onCapture={handleSelfieCapture} />
                  </div>
                )}
              </div>
            )}

            {/* Botão Enviar */}
            {documentPreview && selfiePreview && (
              <Button
                onClick={processVerification}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold h-12"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando Documentos...
                  </>
                ) : (
                  'Verificar Agora'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Passo 2: Processamento */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            <p className="text-lg font-semibold text-slate-900">Analisando documentos...</p>
            <p className="text-sm text-slate-600 text-center">
              Verificando autenticidade e comparando rosto. Isso pode levar alguns segundos.
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
                    Seu perfil foi marcado como verificado. Você agora apareça no topo das buscas.
                  </p>
                  <Badge className="bg-green-600 text-white">✓ Verificado</Badge>
                </div>
                <p className="text-sm text-slate-600 text-center">
                  <strong>Documentos validados:</strong> Identidade autêntica e rosto correspondente
                </p>
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
                  {verificationResult.details && (
                    <div className="bg-white rounded p-3 text-left text-sm text-slate-600 space-y-1">
                      {Object.entries(verificationResult.details).map(([key, value]) => (
                        <p key={key}>
                          <strong>{key}:</strong> {value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 text-center">
                  Dicas: Certifique-se de que a foto do documento é clara, bem iluminada e legível.
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