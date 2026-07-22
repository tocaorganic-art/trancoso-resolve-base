import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";

export default function AIRecommendations({ services }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setRecommendations([]);

    try {
      const servicesData = services.map(s => ({
        name: s.name,
        category: s.category,
        summary: s.summary,
        description: s.description,
        location: s.location?.address,
        price_range: s.price_range
      }));

      const prompt = `
Você é um concierge virtual especializado em Trancoso, Brasil.

Usuário perguntou: "${query}"

Serviços disponíveis:
${JSON.stringify(servicesData, null, 2)}

Analise a pergunta e recomende os 3 MELHORES serviços para o usuário.
Para cada recomendação, forneça:
1. Nome do serviço
2. Por que você recomenda (seja específico e relevante à pergunta)
3. Dicas práticas para aproveitar melhor

Responda em formato JSON:
{
  "recommendations": [
    {
      "service_name": "nome exato do serviço",
      "reason": "por que recomendamos...",
      "tips": "dicas práticas..."
    }
  ]
}
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service_name: { type: "string" },
                  reason: { type: "string" },
                  tips: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response.recommendations) {
        setRecommendations(response.recommendations);
      }
    } catch (error) {
      console.error("Erro ao obter recomendações:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-none shadow-xl mb-8">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-sand/30 border-b">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg">Pergunte ao Concierge com IA</span>
            <p className="text-sm font-normal text-slate-600 mt-1">
              Descreva o que você procura e receba recomendações personalizadas
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Ex: Procuro um restaurante romântico à beira-mar para jantar especial..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-24 resize-none"
          />
          <Button
            onClick={getRecommendations}
            disabled={!query.trim() || loading}
            className="w-full bg-gradient-to-r from-orange-600 to-[#C1440E] hover:from-orange-700 hover:to-[#A33A0C]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Obter Recomendações
              </>
            )}
          </Button>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Recomendações Personalizadas
            </h3>
            {recommendations.map((rec, index) => {
              const service = services.find(s => s.name === rec.service_name);
              
              return (
                <Card key={index} className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="bg-brand-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-slate-900 mb-2">
                          {rec.service_name}
                        </h4>

                        <div className="mb-3">
                          <p className="text-sm font-semibold text-orange-900 mb-1">
                            Por que recomendamos:
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {rec.reason}
                          </p>
                        </div>

                        {rec.tips && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <p className="text-sm font-semibold text-orange-900 mb-1">
                              💡 Dicas:
                            </p>
                            <p className="text-sm text-orange-800 leading-relaxed">
                              {rec.tips}
                            </p>
                          </div>
                        )}

                        {service && service.summary && (
                          <p className="text-xs text-slate-500 mt-3 italic">
                            {service.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}