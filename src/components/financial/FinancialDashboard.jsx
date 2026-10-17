import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, AlertCircle } from 'lucide-react';

function paymentDate(payment) {
  return payment.captured_at || payment.service_date || payment.created_date;
}

export default function FinancialDashboard({ payments }) {
  const captured = useMemo(
    () => (payments || []).filter((p) => p.status === 'captured' && paymentDate(p)),
    [payments]
  );

  const chartData = useMemo(() => {
    if (captured.length === 0) return [];

    const monthlyData = {};
    const monthDates = {};
    captured.forEach((p) => {
      const date = new Date(paymentDate(p));
      const monthKey = format(date, 'MMM/yy', { locale: ptBR });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, receita: 0 };
        monthDates[monthKey] = date;
      }
      monthlyData[monthKey].receita += (Number(p.amount_provider) || 0) / 100;
    });

    return Object.values(monthlyData).sort((a, b) => monthDates[a.month] - monthDates[b.month]);
  }, [captured]);

  if (captured.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Nenhum recebimento confirmado pela plataforma ainda.</p>
          <p className="text-sm text-slate-500 mt-2">Os valores recebidos via Asaas aparecerão aqui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <Card className="border border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <TrendingUp className="text-green-500" />
            Receita Mensal: {chartData.length > 0 ? `${chartData[0].month} a ${chartData[chartData.length - 1].month}` : ''}
          </CardTitle>
          <CardDescription className="text-slate-400">Recebimentos confirmados via Asaas</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
              />
              <Legend />
              <Bar dataKey="receita" fill="#10b981" name="Receita" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur-xs">
        <CardHeader>
          <CardTitle className="text-slate-100">Tendência de Receita</CardTitle>
          <CardDescription className="text-slate-400">Evolução dos recebimentos ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                strokeWidth={2}
                name="Receita"
                fill="#10b981"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
