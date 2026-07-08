import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const alert = payload.data;
    const alertId = payload.event?.entity_id;

    if (!alert) {
      return Response.json({ error: 'No alert data in payload' }, { status: 400 });
    }

    const priorityEmoji = {
      'Crítica': '🔴',
      'Alta': '🟠',
      'Média': '🟡',
      'Baixa': '🟢',
    }[alert.priority] || '⚪';

    const typeEmoji = alert.alert_type === 'Urgente' ? '🚨' : '🔧';

    const subject = `${typeEmoji} ${priorityEmoji} Alerta de Manutenção ${alert.alert_type?.toUpperCase()} — ${alert.property_name}`;

    const body = `
<h2>${typeEmoji} Novo Alerta de Manutenção Criado</h2>

<table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
  <tr style="background: #f1f5f9;">
    <td style="padding: 8px 12px; font-weight: bold; width: 40%;">🏠 Propriedade</td>
    <td style="padding: 8px 12px;">${alert.property_name || '—'}</td>
  </tr>
  <tr>
    <td style="padding: 8px 12px; font-weight: bold; background: #f8fafc;">🔧 Equipamento / Área</td>
    <td style="padding: 8px 12px;">${alert.equipment || '—'}</td>
  </tr>
  <tr style="background: #f1f5f9;">
    <td style="padding: 8px 12px; font-weight: bold;">📋 Tipo de Alerta</td>
    <td style="padding: 8px 12px;">${alert.alert_type || '—'}</td>
  </tr>
  <tr>
    <td style="padding: 8px 12px; font-weight: bold; background: #f8fafc;">⚡ Prioridade</td>
    <td style="padding: 8px 12px; font-weight: bold; color: ${alert.priority === 'Crítica' ? '#dc2626' : alert.priority === 'Alta' ? '#ea580c' : '#ca8a04'};">${priorityEmoji} ${alert.priority || '—'}</td>
  </tr>
  ${alert.description ? `
  <tr style="background: #f1f5f9;">
    <td style="padding: 8px 12px; font-weight: bold;">📝 Descrição</td>
    <td style="padding: 8px 12px;">${alert.description}</td>
  </tr>` : ''}
  ${alert.predicted_failure_date ? `
  <tr>
    <td style="padding: 8px 12px; font-weight: bold; background: #f8fafc;">📅 Data Prevista de Falha</td>
    <td style="padding: 8px 12px;">${new Date(alert.predicted_failure_date).toLocaleDateString('pt-BR')}</td>
  </tr>` : ''}
  ${alert.cost_estimate ? `
  <tr style="background: #f1f5f9;">
    <td style="padding: 8px 12px; font-weight: bold;">💰 Custo Estimado</td>
    <td style="padding: 8px 12px;">R$ ${Number(alert.cost_estimate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
  </tr>` : ''}
  ${alert.ai_confidence ? `
  <tr>
    <td style="padding: 8px 12px; font-weight: bold; background: #f8fafc;">🤖 Confiança IA</td>
    <td style="padding: 8px 12px;">${alert.ai_confidence}%</td>
  </tr>` : ''}
</table>

<br/>
<p style="color: #64748b; font-size: 13px;">
  Alerta ID: ${alertId || '—'} • Trancoso Resolve Manutenção
</p>
    `.trim();

    // Busca todos os admins para notificar
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    const emailPromises = (admins || []).map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject,
        body,
        from_name: 'Trancoso Resolve — Manutenção',
      })
    );

    await Promise.all(emailPromises);

    console.log(`Alerta de manutenção enviado para ${(admins || []).length} admin(s). Alerta ID: ${alertId}`);

    return Response.json({ success: true, notified: (admins || []).length });
  } catch (error) {
    console.error('Erro ao notificar alerta de manutenção:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});