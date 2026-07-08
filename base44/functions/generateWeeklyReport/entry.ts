import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_EMAIL = 'suporte@trancosoresolve.com.br';

function weekStart(daysBack = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString('pt-BR');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verificar admin
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const thisMonday = weekStart(now.getDay() === 0 ? 6 : now.getDay() - 1);
    const lastMonday = new Date(thisMonday.getTime() - 7 * 86400000);
    const lastSunday = new Date(thisMonday.getTime() - 1);

    const fmtStart = lastMonday.toISOString().split('T')[0];
    const fmtEnd = lastSunday.toISOString().split('T')[0];

    // Coleta de dados
    const [allLeads, allProviders, allRequests] = await Promise.all([
      base44.asServiceRole.entities.LeadPreLancamento.list('-created_date', 1000),
      base44.asServiceRole.entities.ServiceProvider.list('-created_date', 500),
      base44.asServiceRole.entities.ServiceRequest.list('-created_date', 500),
    ]);

    const weekLeads = allLeads.filter(l => l.created_date >= fmtStart && l.created_date <= fmtEnd);
    const weekRequests = allRequests.filter(r => r.created_date >= fmtStart && r.created_date <= fmtEnd);
    const weekProviders = allProviders.filter(p => p.created_date >= fmtStart && p.created_date <= fmtEnd);

    // Top serviços
    const serviceCounts = {};
    weekRequests.forEach(r => {
      const k = r.service_id || 'Desconhecido';
      serviceCounts[k] = (serviceCounts[k] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Top origens
    const sourceCounts = {};
    weekLeads.forEach(l => {
      const k = l.source || 'Desconhecida';
      sourceCounts[k] = (sourceCounts[k] || 0) + 1;
    });
    const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const convRate = weekLeads.length > 0
      ? ((weekRequests.length / weekLeads.length) * 100).toFixed(1)
      : '0';

    const emailBody = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
        <div style="background:#1e293b;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#f1f5f9;margin:0;font-size:22px">📊 Relatório Semanal</h1>
          <p style="color:#94a3b8;margin:8px 0 0">Trancoso Resolve — ${formatDate(lastMonday)} a ${formatDate(lastSunday)}</p>
        </div>
        <div style="background:#f8fafc;padding:24px 32px;border:1px solid #e2e8f0">

          <h2 style="color:#0f172a;font-size:16px;margin-top:0">🎯 KPIs da Semana</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr style="background:#e2e8f0">
              <td style="padding:10px 14px;font-weight:bold">Métrica</td>
              <td style="padding:10px 14px;font-weight:bold;text-align:right">Valor</td>
            </tr>
            <tr style="background:white"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Novos Leads</td><td style="padding:10px 14px;text-align:right;font-weight:bold;color:#2563eb">${weekLeads.length}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Novos Prestadores</td><td style="padding:10px 14px;text-align:right;font-weight:bold;color:#16a34a">${weekProviders.length}</td></tr>
            <tr style="background:white"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Solicitações de Serviço</td><td style="padding:10px 14px;text-align:right;font-weight:bold;color:#7c3aed">${weekRequests.length}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">Taxa Conversão Lead→Sol.</td><td style="padding:10px 14px;text-align:right;font-weight:bold;color:#d97706">${convRate}%</td></tr>
            <tr style="background:white"><td style="padding:10px 14px">Total Leads Acumulado</td><td style="padding:10px 14px;text-align:right;color:#64748b">${allLeads.length}</td></tr>
          </table>

          ${topServices.length > 0 ? `
          <h2 style="color:#0f172a;font-size:16px">🏆 Top Serviços da Semana</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr style="background:#e2e8f0"><td style="padding:8px 14px;font-weight:bold">Serviço</td><td style="padding:8px 14px;font-weight:bold;text-align:right">Solicitações</td></tr>
            ${topServices.map(([s, c], i) => `<tr style="background:${i%2===0?'white':'#f8fafc'}"><td style="padding:8px 14px;border-bottom:1px solid #e2e8f0">${s}</td><td style="padding:8px 14px;text-align:right;font-weight:bold;border-bottom:1px solid #e2e8f0">${c}</td></tr>`).join('')}
          </table>` : ''}

          ${topSources.length > 0 ? `
          <h2 style="color:#0f172a;font-size:16px">📍 Origens dos Leads</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr style="background:#e2e8f0"><td style="padding:8px 14px;font-weight:bold">Origem</td><td style="padding:8px 14px;font-weight:bold;text-align:right">Leads</td></tr>
            ${topSources.map(([s, c], i) => `<tr style="background:${i%2===0?'white':'#f8fafc'}"><td style="padding:8px 14px;border-bottom:1px solid #e2e8f0">${s}</td><td style="padding:8px 14px;text-align:right;font-weight:bold;border-bottom:1px solid #e2e8f0">${c}</td></tr>`).join('')}
          </table>` : ''}

        </div>
        <div style="background:#1e293b;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center">
          <p style="color:#64748b;font-size:12px;margin:0">Trancoso Resolve — Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      from_name: 'Trancoso Resolve Analytics',
      subject: `📊 Relatório Semanal Trancoso Resolve — ${formatDate(lastMonday)} a ${formatDate(lastSunday)}`,
      body: emailBody,
    });

    console.info('Weekly report sent', { weekLeads: weekLeads.length, weekRequests: weekRequests.length });
    return Response.json({ ok: true, sent_to: ADMIN_EMAIL, week: { start: fmtStart, end: fmtEnd }, stats: { leads: weekLeads.length, providers: weekProviders.length, requests: weekRequests.length } });

  } catch (error) {
    console.error('generateWeeklyReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});