import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Thresholds para Web Vitals
const THRESHOLDS = {
  lcp:      { good: 2500,  bad: 4000  }, // ms
  fid:      { good: 100,   bad: 300   }, // ms
  cls:      { good: 0.1,   bad: 0.25  }, // score
  ttfb:     { good: 800,   bad: 1800  }, // ms
  loadTime: { good: 3000,  bad: 6000  }, // ms
};

function classify(metric, value) {
  if (value === null || value === undefined) return 'unknown';
  const t = THRESHOLDS[metric];
  if (!t) return 'unknown';
  if (value <= t.good) return 'good';
  if (value >= t.bad) return 'bad';
  return 'warning';
}

function buildEmailBody(page, badMetrics) {
  const rows = badMetrics.map(({ metric, value, threshold, status }) =>
    `<tr style="background:${status === 'bad' ? '#fee2e2' : '#fef9c3'}">
      <td style="padding:8px 12px;font-weight:bold">${metric.toUpperCase()}</td>
      <td style="padding:8px 12px">${value}</td>
      <td style="padding:8px 12px">${threshold}</td>
      <td style="padding:8px 12px;color:${status === 'bad' ? '#dc2626' : '#d97706'}">${status.toUpperCase()}</td>
    </tr>`
  ).join('');

  return `
    <h2>⚠️ Alerta de Performance — Trancoso Resolve</h2>
    <p><strong>Página:</strong> ${page}</p>
    <p><strong>Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    <table style="border-collapse:collapse;width:100%;margin-top:16px">
      <thead>
        <tr style="background:#1e293b;color:white">
          <th style="padding:8px 12px;text-align:left">Métrica</th>
          <th style="padding:8px 12px;text-align:left">Valor Medido</th>
          <th style="padding:8px 12px;text-align:left">Limite</th>
          <th style="padding:8px 12px;text-align:left">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;color:#64748b;font-size:12px">Trancoso Resolve — Monitoramento Automático</p>
  `;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();
    const { page, lcp, fid, cls, ttfb, loadTime, timestamp } = body;

    const metrics = { lcp, fid, cls, ttfb, loadTime };
    const results = {};
    const badMetrics = [];
    let overallStatus = 'ok';

    for (const [metric, value] of Object.entries(metrics)) {
      if (value === null || value === undefined) continue;
      const status = classify(metric, value);
      results[metric] = { value, status };

      if (status === 'bad') {
        overallStatus = 'critical';
        badMetrics.push({
          metric,
          value,
          threshold: `bom < ${THRESHOLDS[metric].good} / ruim > ${THRESHOLDS[metric].bad}`,
          status,
        });
      } else if (status === 'warning' && overallStatus !== 'critical') {
        overallStatus = 'warning';
        badMetrics.push({
          metric,
          value,
          threshold: `bom < ${THRESHOLDS[metric].good} / ruim > ${THRESHOLDS[metric].bad}`,
          status,
        });
      }
    }

    console.info('PERFORMANCE_METRIC', { page, timestamp, overallStatus, results });

    // Enviar alerta por email se houver métricas ruins
    if (badMetrics.length > 0) {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'tocaorganic@gmail.com',
        from_name: 'Trancoso Resolve Monitor',
        subject: `⚠️ Alerta de Performance: ${page || 'página desconhecida'} — ${overallStatus.toUpperCase()}`,
        body: buildEmailBody(page || 'desconhecida', badMetrics),
      }).catch((e) => console.warn('Email alert failed:', e.message));
    }

    return Response.json({ status: overallStatus, metrics: results });
  } catch (error) {
    console.error('Error logging performance:', error);
    return Response.json({ error: 'Failed to log performance' }, { status: 500 });
  }
});