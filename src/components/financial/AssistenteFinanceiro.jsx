import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import { Card, CardContent } from '@/components/ui/card';

const jsonSchema = {
    type: "object",
    properties: {
        receitaProjetada: { type: "number", description: "Projeção de receita para o próximo mês." },
        crescimentoProjetado: { type: "number", description: "Porcentagem de crescimento projetado em relação ao mês atual." },
        melhorDia: { type: "string", description: "O dia da semana com maior faturamento médio." },
        receitaMelhorDia: { type: "number", description: "O valor médio faturado nesse dia." },
        recomendacoes: { type: "array", items: { type: "string" }, description: "Lista com 3 recomendações acionáveis." }
    },
    required: ["receitaProjetada", "crescimentoProjetado", "melhorDia", "receitaMelhorDia", "recomendacoes"]
};

function toSimplifiedPayments(payments) {
  return (payments || [])
    .filter((p) => p.status === 'captured')
    .map((p) => ({
      date: p.captured_at || p.service_date,
      amount: (Number(p.amount_provider) || 0) / 100,
    }));
}

export default function AssistenteFinanceiro({ payments }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variacaoDespesas, setVariacaoDespesas] = useState(null);

  const recebimentos = toSimplifiedPayments(payments);

  // Variação de receita (mês atual x anterior) com base nos recebimentos da plataforma
  React.useEffect(() => {
    if (recebimentos.length > 0) {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const receitaAtual = recebimentos
        .filter(r => r.date && new Date(r.date) >= currentMonthStart)
        .reduce((sum, r) => sum + r.amount, 0);

      const receitaAnterior = recebimentos
        .filter(r => r.date && new Date(r.date) >= previousMonthStart && new Date(r.date) <= previousMonthEnd)
        .reduce((sum, r) => sum + r.amount, 0);

      if (receitaAnterior > 0) {
        const variacao = ((receitaAtual - receitaAnterior) / receitaAnterior) * 100;
        setVariacaoDespesas({
          valor: Math.abs(variacao).toFixed(1),
          aumentou: variacao > 0
        });
      }
    }
  }, [payments]);

  const analisarFinancas = async () => {
    if (recebimentos.length === 0) {
      toast.info("Não há recebimentos suficientes para análise.");
      return;
    }

    setLoading(true);
    setInsights(null);

    const prompt = `
      Analise os seguintes recebimentos de um prestador de serviços em Trancoso (pagamentos confirmados via Asaas na plataforma) e forneça insights.

      Recebimentos (JSON, data e valor em R$):
      ${JSON.stringify(recebimentos.slice(0, 50), null, 2)}

      Com base nesses dados, calcule e retorne as seguintes informações em um objeto JSON:
      - receitaProjetada: Uma projeção de receita para o próximo mês.
      - crescimentoProjetado: A porcentagem de crescimento projetado em relação ao mês atual.
      - melhorDia: O dia da semana com maior faturamento médio.
      - receitaMelhorDia: O valor médio faturado nesse dia.
      - recomendacoes: Uma lista (array) com 3 recomendações acionáveis para aumentar a receita.
    `;

    try {
       const response = await base44.functions.invoke('callPlatformAI', {
         messages: [{ role: 'user', content: prompt }],
         response_json_schema: jsonSchema,
         systemPrompt: 'Você é um assistente financeiro especializado em análise de dados. Retorne insights acionáveis em português do Brasil.'
       });

       setInsights(response.data);
       toast.success("Análise financeira concluída!");

    } catch (error) {
       console.error('Erro ao analisar finanças:', error);
       toast.error("Ocorreu um erro ao gerar a análise.", { description: error.message || "Tente novamente mais tarde." });
    } finally {
       setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 rounded-lg shadow-md p-5 my-6 border border-slate-700">
      <div className="mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-white mb-3">
          <Sparkles className="w-5 h-5 text-orange-400"/>
          Assistente Financeiro
        </h3>

        {variacaoDespesas && (
          <div className={`text-sm p-3 rounded-lg mb-3 ${
            variacaoDespesas.aumentou
              ? 'bg-green-900/20 border border-green-800/30 text-green-300'
              : 'bg-red-900/20 border border-red-800/30 text-red-300'
          }`}>
            {variacaoDespesas.aumentou ? '✅' : '⚠️'} Sua receita {variacaoDespesas.aumentou ? 'aumentou' : 'reduziu'} {variacaoDespesas.valor}% em relação ao mês anterior.
          </div>
        )}

        <Button
          onClick={analisarFinancas}
          disabled={loading || recebimentos.length === 0}
          className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</>
          ) : (
            'Analisar Finanças com IA'
          )}
        </Button>
      </div>

      {loading && (
          <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-orange-500" />
              <p className="mt-2 text-slate-500">Aguarde, nossa IA está processando seus dados...</p>
          </div>
      )}

      {insights && (
        <div className="animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-orange-50 p-4 border-orange-200">
              <CardContent>
                  <h4 className="text-sm font-medium text-orange-800 mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4"/>Receita Projetada</h4>
                  <p className="text-2xl font-bold text-orange-900">R$ {insights.receitaProjetada?.toLocaleString('pt-BR')}</p>
                  <p className={`text-xs font-semibold mt-1 ${insights.crescimentoProjetado > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {insights.crescimentoProjetado > 0 ? '+' : ''}{insights.crescimentoProjetado?.toFixed(1)}% vs. mês anterior
                  </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 p-4 border-green-200">
              <CardContent>
                  <h4 className="text-sm font-medium text-green-800 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4"/>Melhor Dia</h4>
                  <p className="text-xl font-bold text-green-900">{insights.melhorDia}</p>
                  <p className="text-xs text-green-700 mt-1">
                    R$ {insights.receitaMelhorDia?.toLocaleString('pt-BR')} em média
                  </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-slate-800 mb-3">Recomendações para Aumentar sua Receita:</h4>
            <ul className="list-disc pl-5 space-y-2">
              {insights.recomendacoes.map((rec, index) => (
                <li key={index} className="text-slate-700">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};
