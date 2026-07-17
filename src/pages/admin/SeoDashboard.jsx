import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { subWeeks, subMonths, format, parseISO, isAfter } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, TrendingDown, CheckCircle, Search, FileText, BarChart2 } from 'lucide-react';

const PERIOD_OPTIONS = [
  { label: 'Última semana', value: '1w' },
  { label: 'Últimas 4 semanas', value: '4w' },
  { label: 'Últimos 3 meses', value: '3m' },
];

const LINE_COLORS = [
  '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#ec4899', '#14b8a6',
];

function getStartDate(period) {
  const now = new Date();
  if (period === '1w') return subWeeks(now, 1);
  if (period === '4w') return subWeeks(now, 4);
  return subMonths(now, 3);
}

function formatCtr(val) {
  if (val == null) return '–';
  return `${(val * 100).toFixed(1)}%`;
}

function formatPos(val) {
  if (val == null) return '–';
  return val.toFixed(1);
}

export default function SeoDashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('4w');

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  useEffect(() => {
    if (!loadingUser && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loadingUser, navigate]);

  const { data: keywordData = [] } = useQuery({
    queryKey: ['seoKeywords'],
    queryFn: () => base44.entities.SearchKeywordWeekly.list('-week_start', 500),
    enabled: user?.role === 'admin',
  });

  const { data: pageData = [] } = useQuery({
    queryKey: ['seoPages'],
    queryFn: () => base44.entities.SearchPageWeekly.list('-week_start', 500),
    enabled: user?.role === 'admin',
  });

  const startDate = getStartDate(period);

  // Filtered data
  const filteredKeywords = useMemo(() =>
    keywordData.filter(r => isAfter(parseISO(r.week_start), startDate)),
    [keywordData, startDate]
  );

  const filteredPages = useMemo(() =>
    pageData.filter(r => isAfter(parseISO(r.week_start), startDate)),
    [pageData, startDate]
  );

  // Latest week string
  const latestWeek = useMemo(() => {
    if (!filteredKeywords.length && !filteredPages.length) return null;
    const all = [...filteredKeywords, ...filteredPages].map(r => r.week_start).sort().reverse();
    return all[0] || null;
  }, [filteredKeywords, filteredPages]);

  const prevWeek = useMemo(() => {
    if (!latestWeek) return null;
    return format(subWeeks(parseISO(latestWeek), 1), 'yyyy-MM-dd');
  }, [latestWeek]);

  // Keyword table (latest week)
  const keywordTableData = useMemo(() => {
    if (!latestWeek) return [];
    const byKeyword = {};
    filteredKeywords.filter(r => r.week_start === latestWeek).forEach(r => {
      byKeyword[r.keyword] = r;
    });
    return Object.values(byKeyword).sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  }, [filteredKeywords, latestWeek]);

  // Keyword line chart data
  const keywordChartData = useMemo(() => {
    const weeks = [...new Set(filteredKeywords.map(r => r.week_start))].sort();
    const keywords = [...new Set(filteredKeywords.map(r => r.keyword))];
    return weeks.map(week => {
      const entry = { week: format(parseISO(week), 'dd/MM') };
      keywords.forEach(kw => {
        const rec = filteredKeywords.find(r => r.week_start === week && r.keyword === kw);
        entry[kw] = rec?.clicks || 0;
      });
      return entry;
    });
  }, [filteredKeywords]);

  const keywords = useMemo(() =>
    [...new Set(filteredKeywords.map(r => r.keyword))],
    [filteredKeywords]
  );

  // Page bar chart (latest week)
  const pageBarData = useMemo(() => {
    if (!latestWeek) return [];
    return filteredPages
      .filter(r => r.week_start === latestWeek)
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(r => ({
        page: r.page_url?.replace('https://trancosoresolve.com.br', '') || r.page_url,
        clicks: r.clicks || 0,
      }));
  }, [filteredPages, latestWeek]);

  // Page table (latest week)
  const pageTableData = useMemo(() => {
    if (!latestWeek) return [];
    return filteredPages
      .filter(r => r.week_start === latestWeek)
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  }, [filteredPages, latestWeek]);

  // Alerts: pages with 20%+ drop
  const alerts = useMemo(() => {
    if (!latestWeek || !prevWeek) return [];
    const current = filteredPages.filter(r => r.week_start === latestWeek);
    const previous = pageData.filter(r => r.week_start === prevWeek);
    return current.filter(curr => {
      const prev = previous.find(p => p.page_url === curr.page_url);
      if (!prev || !prev.clicks) return false;
      const dropPct = (prev.clicks - (curr.clicks || 0)) / prev.clicks;
      return dropPct >= 0.2;
    }).map(curr => {
      const prev = previous.find(p => p.page_url === curr.page_url);
      const drop = Math.round(((prev.clicks - (curr.clicks || 0)) / prev.clicks) * 100);
      return { page: curr.page_url, drop, currClicks: curr.clicks, prevClicks: prev.clicks };
    });
  }, [filteredPages, pageData, latestWeek, prevWeek]);

  if (loadingUser) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== 'admin') return null;

  const isEmpty = keywordData.length === 0 && pageData.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-cyan-400" />
            Painel SEO
          </h1>
          <p className="text-slate-400 text-sm mt-1">Métricas de busca orgânica — Trancoso Resolve</p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty && (
        <div className="bg-slate-800 rounded-2xl p-12 text-center">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">Nenhum dado de SEO ainda</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Adicione registros nas entidades <strong>SearchKeywordWeekly</strong> e <strong>SearchPageWeekly</strong> para visualizar as métricas aqui.
          </p>
        </div>
      )}

      {!isEmpty && (
        <>
          {/* Section 1 – Keywords */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Palavras-chave monitoradas
            </h2>

            {keywordChartData.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-4 md:p-6 mb-6">
                <p className="text-sm text-slate-400 mb-4">Cliques por semana</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={keywordChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Legend />
                    {keywords.map((kw, i) => (
                      <Line key={kw} type="monotone" dataKey={kw} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {keywordTableData.length > 0 && (
              <div className="bg-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Palavra-chave</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">Cliques</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">Impressões</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">CTR</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">Posição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordTableData.map((row, i) => (
                      <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{row.keyword}</td>
                        <td className="px-4 py-3 text-right text-cyan-400 font-bold">{row.clicks ?? 0}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{row.impressions ?? 0}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{formatCtr(row.ctr)}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{formatPos(row.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 2 – Pages */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Páginas mais acessadas via busca
            </h2>

            {pageBarData.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-4 md:p-6 mb-6">
                <p className="text-sm text-slate-400 mb-4">Cliques por página (semana atual)</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pageBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis type="category" dataKey="page" tick={{ fill: '#94a3b8', fontSize: 11 }} width={160} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {pageTableData.length > 0 && (
              <div className="bg-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Página</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">Cliques</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">Impressões</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">CTR</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">Posição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageTableData.map((row, i) => (
                      <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-white text-xs font-mono max-w-xs truncate">{row.page_url}</td>
                        <td className="px-4 py-3 text-right text-blue-400 font-bold">{row.clicks ?? 0}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{row.impressions ?? 0}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{formatCtr(row.ctr)}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{formatPos(row.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 3 – Alerts */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alertas de queda
            </h2>
            <div className="bg-slate-800 rounded-2xl p-6">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">Nenhuma queda detectada esta semana.</span>
                </div>
              ) : (
                <ul className="space-y-3">
                  {alerts.map((alert, i) => (
                    <li key={i} className="flex items-start gap-3 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
                      <TrendingDown className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium text-sm">{alert.page}</p>
                        <p className="text-red-400 text-xs mt-0.5">
                          Queda de <strong>{alert.drop}%</strong> em cliques —&nbsp;
                          de {alert.prevClicks} para {alert.currClicks} esta semana
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}