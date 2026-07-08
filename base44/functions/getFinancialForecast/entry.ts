import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { format, subMonths, addMonths } from 'npm:date-fns@3.6.0';

// Simulação de um modelo Prophet/Pandas
const generateForecast = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    // 1. Agrupar transações por mês
    const monthlyRevenue = {};
    transactions.forEach(t => {
        if (t.type === 'Receita' && t.status === 'Validado' && t.date) {
            const monthKey = format(new Date(t.date), 'yyyy-MM');
            monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + t.amount;
        }
    });

    const historicalData = Object.entries(monthlyRevenue).map(([date, revenue]) => ({
        date: `${date}-01`,
        actual: revenue,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (historicalData.length < 2) {
      // Se não há dados históricos suficientes, retorna o que tem
      return historicalData;
    }

    // 2. Calcular uma tendência linear simples
    const first = historicalData[0];
    const last = historicalData[historicalData.length - 1];
    const monthsDiff = (new Date(last.date).getFullYear() - new Date(first.date).getFullYear()) * 12 + (new Date(last.date).getMonth() - new Date(first.date).getMonth());
    
    const trend = monthsDiff > 0 ? (last.actual - first.actual) / monthsDiff : 0;
    
    // 3. Projetar os próximos 3 meses
    const forecastData = [];
    let lastActual = last.actual;
    for (let i = 1; i <= 3; i++) {
        const nextMonthDate = addMonths(new Date(last.date), i);
        const prediction = Math.max(0, lastActual + trend * i * (1 + (Math.random() - 0.5) * 0.1)); // Adiciona um pouco de ruído
        forecastData.push({
            date: format(nextMonthDate, 'yyyy-MM-dd'),
            prediction: parseFloat(prediction.toFixed(2)),
        });
    }

    return [...historicalData, ...forecastData];
};

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // SEGURANÇA: Verifica autenticação
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // SEGURANÇA: Filtra apenas transações do usuário (admin vê todas)
        const query = user.role === 'admin' ? {} : { created_by: user.email };
        const userTransactions = await base44.entities.Transaction.filter(query);
        
        const forecast = generateForecast(userTransactions);

        return new Response(JSON.stringify(forecast), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});