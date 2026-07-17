import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, CheckCircle, Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RelatorioDiarioPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { data: relatorios, isLoading } = useQuery({
    queryKey: ['relatorioDiario', selectedDate],
    queryFn: async () => {
      const result = await base44.entities.RelatorioDiario.filter({ data: selectedDate });
      return Array.isArray(result) ? result : [];
    },
  });

  const relatorioDoDia = relatorios?.[0];

  const exportarRelatorio = () => {
    if (!relatorioDoDia) return;

    const conteudo = `
# Relatório Diário - Trancoso Resolve
Data: ${format(new Date(relatorioDoDia.data), 'dd/MM/yyyy')}

## Métricas do Dia
- Serviços Concluídos: ${relatorioDoDia.metricas?.servicos_concluidos || 0}
- Receita Gerada: R$ ${(relatorioDoDia.metricas?.receita_gerada || 0).toFixed(2)}

## Tarefas Concluídas
${relatorioDoDia.tarefas_concluidas?.map((tarefa, i) => 
  `${i + 1}. ${tarefa.descricao}
     - Horário: ${tarefa.horario}
     - Valor: R$ ${tarefa.valor?.toFixed(2)}
     - Request ID: ${tarefa.request_id}`
).join('\n\n') || 'Nenhuma tarefa concluída no dia.'}

---
Última atualização: ${relatorioDoDia.ultima_atualizacao ? format(new Date(relatorioDoDia.ultima_atualizacao), 'dd/MM/yyyy HH:mm') : 'N/A'}
`.trim();

    const blob = new Blob([conteudo], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${selectedDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-gradient-to-r from-amber-800 to-amber-600 text-white py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Relatório Diário</h1>
          <p className="text-amber-100">Acompanhe os serviços concluídos e métricas do dia</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Filtro de Data */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Selecionar Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                max={new Date().toISOString().split('T')[0]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Serviços Concluídos</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {relatorioDoDia?.metricas?.servicos_concluidos || 0}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-amber-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Receita Gerada</p>
                  <p className="text-3xl font-bold text-slate-900">
                    R$ {(relatorioDoDia?.metricas?.receita_gerada || 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Tarefas Registradas</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {relatorioDoDia?.tarefas_concluidas?.length || 0}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Tarefas */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-amber-600" />
              Tarefas Concluídas em {format(new Date(selectedDate), "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            {relatorioDoDia && (
              <Button onClick={exportarRelatorio} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Carregando...</div>
            ) : !relatorioDoDia || !relatorioDoDia.tarefas_concluidas || relatorioDoDia.tarefas_concluidas.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Nenhuma tarefa concluída nesta data</p>
                <p className="text-slate-400 text-sm mt-1">Os serviços aparecem aqui quando são marcados como concluídos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {relatorioDoDia.tarefas_concluidas.map((tarefa, index) => (
                  <div key={tarefa.request_id || index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-amber-600 text-white">#{index + 1}</Badge>
                          <span className="font-semibold text-slate-900 dark:text-white">{tarefa.descricao}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {tarefa.horario}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            R$ {tarefa.valor?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          ID: {tarefa.request_id?.slice(-6)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        {relatorioDoDia && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">
                Última Atualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-900 dark:text-white">
                {relatorioDoDia.ultima_atualizacao 
                  ? format(new Date(relatorioDoDia.ultima_atualizacao), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })
                  : 'Não disponível'}
              </p>
              {relatorioDoDia.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                  {relatorioDoDia.description}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}