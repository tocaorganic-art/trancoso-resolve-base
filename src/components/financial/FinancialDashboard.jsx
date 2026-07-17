import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, AlertCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FinancialDashboard({ transactions }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Agrupa por mês
    const monthlyData = {};
    transactions.forEach(t => {
      if (!t.date) return;
      const monthKey = format(new Date(t.date), 'MMM/yy', { locale: ptBR });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, receita: 0, despesa: 0 };
      }
      if (t.type === 'Receita') {
        monthlyData[monthKey].receita += t.amount;
      } else {
        monthlyData[monthKey].despesa += t.amount;
      }
    });

    return Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month.split('/').reverse().join('-'));
      const dateB = new Date(b.month.split('/').reverse().join('-'));
      return dateA - dateB;
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const categories = {};
    transactions
      .filter(t => t.type === 'Despesa' && t.status === 'Validado')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Nenhuma transação registrada ainda.</p>
          <p className="text-sm text-slate-500 mt-2">Adicione transações para visualizar os gráficos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Gráfico de Receita x Despesa */}
      <Card className="border border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <TrendingUp className="text-green-500" />
            Comparativo Mensal — {chartData.length > 0 ? `${chartData[0].month} a ${chartData[chartData.length - 1].month}` : ''}
          </CardTitle>
          <CardDescription className="text-slate-400">Receitas vs Despesas</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
              />
              <Legend />
              <Bar dataKey="receita" fill="#10b981" name="Receita" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" fill="#ef4444" name="Despesa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Categorias */}
      <Card className="border border-slate-700 shadow-lg bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100">Despesas por Categoria</CardTitle>
          <CardDescription className="text-slate-400">Distribuição dos gastos</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Área - Tendência */}
      <Card className="border border-slate-700 shadow-lg col-span-1 lg:col-span-2 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100">Tendência Financeira</CardTitle>
          <CardDescription className="text-slate-400">Evolução ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
                formatter={(value, name) => [
                  `R$ ${value.toLocaleString('pt-BR')}`,
                  name === 'receita' ? 'Receita' : 'Despesa'
                ]}
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
              <Area 
                type="monotone" 
                dataKey="despesa" 
                stroke="#ef4444" 
                strokeWidth={2} 
                name="Despesa"
                fill="#ef4444"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}