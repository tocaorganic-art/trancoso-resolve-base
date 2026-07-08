import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Calendar, Zap } from 'lucide-react';

const ocupacoes = [
  { label: "Limpeza / Faxina", valorHora: 40 },
  { label: "Garçom / Serviço de Mesa", valorHora: 50 },
  { label: "Jardinagem", valorHora: 45 },
  { label: "Eletricista", valorHora: 80 },
  { label: "Encanador", valorHora: 80 },
  { label: "Pintor", valorHora: 55 },
  { label: "Pedreiro", valorHora: 65 },
  { label: "Cozinheiro / Chef", valorHora: 90 },
  { label: "Babá / Cuidador", valorHora: 45 },
  { label: "Outro", valorHora: 50 },
];

const COMISSAO = 0.20; // 20%

export default function CalculadoraGanhos() {
  const [ocupacaoIndex, setOcupacaoIndex] = useState(0);
  const [horasPorDia, setHorasPorDia] = useState(4);
  const [diasPorMes, setDiasPorMes] = useState(15);

  const ocupacao = ocupacoes[ocupacaoIndex];

  const ganhos = useMemo(() => {
    const bruto = ocupacao.valorHora * horasPorDia * diasPorMes;
    const comissao = bruto * COMISSAO;
    const liquido = bruto - comissao;
    const anual = liquido * 12;
    return { bruto, comissao, liquido, anual };
  }, [ocupacao, horasPorDia, diasPorMes]);

  const fmt = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-slate-900 to-blue-950">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-cyan-400 uppercase tracking-widest">Simule seus ganhos</span>
          <h2 className="text-2xl md:text-4xl font-bold text-white mt-2">
            Quanto você pode ganhar em Trancoso?
          </h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">
            Ajuste as variáveis abaixo e veja seu potencial de faturamento na plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controles */}
          <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
            <CardContent className="p-6 space-y-7">

              {/* Ocupação */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Minha ocupação</label>
                <Select
                  value={String(ocupacaoIndex)}
                  onValueChange={(v) => setOcupacaoIndex(Number(v))}
                >
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ocupacoes.map((o, i) => (
                      <SelectItem key={i} value={String(i)}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-cyan-300 mt-1">
                  Valor médio por hora: <strong>{fmt(ocupacao.valorHora)}</strong>
                </p>
              </div>

              {/* Horas por dia */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-300">Horas trabalhadas por dia</label>
                  <span className="text-xl font-bold text-cyan-400">{horasPorDia}h</span>
                </div>
                <Slider
                  min={1} max={10} step={1}
                  value={[horasPorDia]}
                  onValueChange={([v]) => setHorasPorDia(v)}
                  className="[&_[role=slider]]:bg-cyan-400 [&_.range]:bg-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1h</span><span>10h</span>
                </div>
              </div>

              {/* Dias por mês */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-300">Dias trabalhados por mês</label>
                  <span className="text-xl font-bold text-cyan-400">{diasPorMes} dias</span>
                </div>
                <Slider
                  min={1} max={30} step={1}
                  value={[diasPorMes]}
                  onValueChange={([v]) => setDiasPorMes(v)}
                  className="[&_[role=slider]]:bg-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 dia</span><span>30 dias</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-none text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-1">
                  <DollarSign className="w-6 h-6 opacity-80" />
                  <span className="text-sm font-medium opacity-90">Ganho líquido mensal</span>
                </div>
                <p className="text-4xl md:text-5xl font-black tracking-tight">{fmt(ganhos.liquido)}</p>
                <p className="text-xs opacity-70 mt-1">Após comissão da plataforma (20%)</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-300">Faturamento bruto</span>
                  </div>
                  <p className="text-xl font-bold">{fmt(ganhos.bruto)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-slate-300">Projeção anual</span>
                  </div>
                  <p className="text-xl font-bold">{fmt(ganhos.anual)}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold">O que a plataforma oferece</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>✅ Clientes verificados e pagamento garantido</li>
                  <li>✅ Visibilidade para turistas de alto padrão</li>
                  <li>✅ Painel de gestão completo e gratuito</li>
                  <li>✅ Suporte e proteção em cada serviço</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          * Simulação baseada em valores médios de mercado em Trancoso. Resultados reais podem variar.
        </p>
      </div>
    </section>
  );
}