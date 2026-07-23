
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");
  const queryClient = useQueryClient();

  const createTransactionsMutation = useMutation({
    mutationFn: (transactions) => base44.entities.Transaction.bulkCreate(transactions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // A toast de sucesso geral já é disparada após este sucesso na handleUpload
    },
    onError: (error) => {
      console.error("Erro ao salvar transações:", error);
      // Este toast é para o caso de falha na mutation de salvar, após a extração da IA
      toast.error("Erro ao salvar transações no banco de dados. Tente novamente.");
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
      const fileName = selectedFile.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValid) {
        setError("Formato não suportado! Use apenas: PDF, JPG, PNG.");
        toast.error("Formato não suportado! Use apenas: PDF, JPG, PNG.");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
      setError(null);
      setProgressMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo primeiro.");
      toast.error("Por favor, selecione um arquivo primeiro.");
      return;
    }

    setUploading(true);
    setProcessing(false);
    setError(null);
    setResult(null);
    setProgressMessage("Fazendo upload do arquivo...");

    // Função auxiliar para retry com timeout
    const uploadWithRetry = async (retries = 2) => {
      for (let i = 0; i <= retries; i++) {
        try {
          if (i > 0) {
            setProgressMessage(`Tentativa ${i + 1} de ${retries + 1}... Aguarde.`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s entre tentativas
          }
          
          const uploadResult = await base44.integrations.Core.UploadFile({ file });
          return uploadResult;
        } catch (err) {
          if (i === retries) {
            throw err; // Última tentativa falhou, rethrow
          }
          console.log(`Tentativa ${i + 1} de upload falhou, tentando novamente...`, err);
        }
      }
    };

    try {
      setProgressMessage("Enviando arquivo para o servidor...");
      const uploadResult = await uploadWithRetry();
      
      if (!uploadResult || !uploadResult.file_url) {
        throw new Error("Erro ao fazer upload do arquivo. Tente novamente.");
      }
      
      const fileUrl = uploadResult.file_url;
      console.log("Arquivo enviado:", fileUrl);

      setUploading(false);
      setProcessing(true);
      setProgressMessage("IA está analisando o documento... Pode levar até 30 segundos.");

      const prompt = `
Analise esta imagem/documento financeiro e extraia TODAS as transações ou informações de pagamento.

Isso pode ser:
- Notas fiscais
- Recibos
- Extratos bancários
- Screenshots de reservas (Airbnb, Booking, etc.)
- Screenshots de pagamentos (PIX, transferências)
- Comprovantes
- Planilhas (screenshots)

Para CADA transação encontrada, retorne:
- description: descrição detalhada (ex: "Aluguel Airbnb - Acomodação Ilhota com Milton Carlos")
- amount: valor numérico total (procure por "Total", "Valor", "R$", etc.)
- type: "Receita" se for recebimento, "Despesa" se for pagamento
- category: escolha entre Transporte, Hospedagem, Serviços, Caixa, Compras, Eventos, Fornecedores, Salários, Marketing, Manutenção, Outros
- date: data no formato YYYY-MM-DD (se não encontrar data exata, use a data de hoje)
- payment_method: método (se visível: PIX, Cartão, Dinheiro, etc.)
- notes: informações adicionais (anfitrião, local, período, etc.)

IMPORTANTE: 
- Se for uma reserva de hospedagem (Airbnb, Booking), considere como uma DESPESA de categoria Hospedagem
- Extraia TODOS os valores visíveis
- Se houver check-in e checkout, inclua no notes
- Se não encontrar valor exato, tente inferir do contexto

Retorne um JSON válido.
`;

      const response_json_schema = {
        type: "object",
        properties: {
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                amount: { type: "number" },
                type: { type: "string" },
                category: { type: "string" },
                date: { type: "string" },
                payment_method: { type: "string" },
                notes: { type: "string" }
              }
            }
          }
        }
      };

      console.log("Chamando IA para análise...");
      
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: [fileUrl],
        response_json_schema: response_json_schema
      });

      console.log("Resposta da IA:", aiResult);

      setProcessing(false);
      setProgressMessage("");

      if (!aiResult || !aiResult.transactions) {
        throw new Error("A IA não conseguiu extrair transações deste documento. Verifique se a imagem está legível.");
      }

      const transactions = aiResult.transactions;

      if (transactions.length > 0) {
        // Validar e limpar transações
        const validTransactions = transactions
          .filter(t => t && t.description && typeof t.amount === 'number' && t.type && t.category)
          .map(t => ({
            description: String(t.description).trim(),
            amount: Number(t.amount),
            type: t.type,
            category: t.category,
            date: t.date || new Date().toISOString().split('T')[0],
            payment_method: t.payment_method || "Outro",
            status: "Pendente", // Requer revisão manual antes de entrar nos relatórios
            notes: t.notes || ""
          }));

        console.log("Transações válidas extraídas:", validTransactions);

        if (validTransactions.length === 0) {
          setError("Não foi possível extrair transações válidas. Verifique se o documento contém valores monetários e datas.");
          toast.error("Não foi possível extrair transações válidas. Verifique se o documento contém valores monetários e datas.");
          return;
        }

        setProgressMessage("Salvando transações no banco de dados...");
        
        try {
          console.log("Salvando", validTransactions.length, "transações...");
          await createTransactionsMutation.mutateAsync(validTransactions);
          console.log("Transações salvas com sucesso!");
          
          setProgressMessage("");
          setResult({
            success: true,
            count: validTransactions.length,
            transactions: validTransactions
          });
          toast.success(`✨ Sucesso! ${validTransactions.length} transações importadas e salvas.`);

          // Limpar arquivo após sucesso
          setFile(null);
          
        } catch (saveError) {
          console.error("Erro ao salvar transações:", saveError);
          // O onError da mutation já tratará o toast aqui, mas manter o throw para ser pego pelo catch principal
          throw new Error("Transações extraídas com sucesso, mas houve um erro ao salvá-las no banco de dados. Tente novamente.");
        }
      } else {
        setError("Nenhuma transação foi encontrada. Verifique se a imagem está legível e contém informações de pagamento ou valores.");
        toast.error("Nenhuma transação foi encontrada. Verifique se a imagem está legível e contém informações de pagamento ou valores.");
      }
    } catch (err) {
      console.error("Erro durante o processamento:", err);
      setUploading(false);
      setProcessing(false);
      setProgressMessage("");
      
      // Tratamento específico para diferentes tipos de erro
      const errorMessage = err.message || "";
      let userFriendlyError = "";
      
      if (errorMessage.includes("timeout") || errorMessage.includes("DatabaseTimeout")) {
        userFriendlyError = "⏱️ Timeout: O servidor está demorando para responder. Tente novamente em alguns segundos.";
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        userFriendlyError = "🌐 Erro de conexão: Verifique sua internet e tente novamente.";
      } else if (errorMessage.includes("Erro ao fazer upload do arquivo.")) {
        userFriendlyError = "Falha no upload do arquivo. Tente novamente.";
      } else if (errorMessage.includes("A IA não conseguiu extrair transações deste documento.")) {
        userFriendlyError = "A IA não conseguiu extrair transações deste documento. Verifique se a imagem está legível.";
      } else if (errorMessage.includes("Transações extraídas com sucesso, mas houve um erro ao salvá-las")) {
         userFriendlyError = "Transações extraídas com sucesso, mas houve um erro ao salvá-las no banco de dados. Tente novamente.";
      }
      else {
        userFriendlyError = errorMessage || "Erro ao processar o arquivo. Tente novamente.";
      }

      setError(userFriendlyError);
      toast.error(userFriendlyError);
    }
  };

  return (
    <div className="space-y-6">
      {/* Aviso sobre o que pode ser extraído */}
      <Card className="glass-card border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">📄 O que posso analisar?</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Screenshots de reservas (Airbnb, Booking.com)</li>
                <li>Comprovantes de pagamento (PIX, Transferências)</li>
                <li>Notas fiscais e recibos</li>
                <li>Extratos bancários</li>
                <li>Qualquer documento com valores e datas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Importação Inteligente de Documentos com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
            <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-700 mb-2">
              Arraste um arquivo ou clique para selecionar
            </p>
            <p className="text-sm text-slate-500 mb-4">
              ✅ Suporte: <strong>PDF</strong>, <strong>JPG</strong>, <strong>PNG</strong>
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Selecionar Arquivo</span>
              </Button>
            </label>
          </div>

          {/* Selected File */}
          {file && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || processing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {uploading || processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Processar com IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Progress Message */}
          {progressMessage && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-900 font-medium">{progressMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Erro no Processamento</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <div className="mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleUpload}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      🔄 Tentar Novamente
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    ✅ Sucesso! {result.count} transações importadas
                  </p>
                  <div className="mt-3 space-y-2">
                    {result.transactions.slice(0, 5).map((t, i) => (
                      <div key={i} className="text-sm bg-white p-3 rounded border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">{t.description}</p>
                            <p className="text-xs text-slate-600">{t.category} • {t.date}</p>
                            {t.notes && <p className="text-xs text-slate-500 mt-1">{t.notes}</p>}
                          </div>
                          <span className={`font-bold ${t.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {Number(t.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {result.count > 5 && (
                      <p className="text-xs text-slate-500 text-center">
                        E mais {result.count - 5} transações...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-card border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Como Funciona</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-bold shrink-0">1</div>
              <p>Faça upload de qualquer documento financeiro (foto, PDF, screenshot)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-bold shrink-0">2</div>
              <p>A IA analisa a imagem e identifica transações, valores e datas</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-bold shrink-0">3</div>
              <p>As transações são categorizadas automaticamente</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center font-bold shrink-0">4</div>
              <p>Dados são inseridos diretamente no sistema!</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 Funciona até com screenshots de reservas!</strong> A IA extrai anfitrião, local, datas e valores automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
