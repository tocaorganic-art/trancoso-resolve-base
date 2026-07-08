import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { verificacao_id, action, motivo } = await req.json();

    if (!verificacao_id || !action) {
      return Response.json({ error: 'verificacao_id e action são obrigatórios' }, { status: 400 });
    }

    if (!['aprovar', 'rejeitar'].includes(action)) {
      return Response.json({ error: 'action deve ser "aprovar" ou "rejeitar"' }, { status: 400 });
    }

    const newStatus = action === 'aprovar' ? 'Verificado' : 'Rejeitado';
    const adminNotes = action === 'rejeitar' && motivo
      ? `❌ Rejeitado pelo admin: ${motivo}`
      : (action === 'aprovar' ? `✅ Aprovado pelo admin ${user.full_name || user.email}` : '');

    const updateData = { status: newStatus };
    if (adminNotes) updateData.admin_notes = adminNotes;

    await base44.asServiceRole.entities.Verificacao.update(verificacao_id, updateData);

    // Se aprovado, marca o ServiceProvider como verificado e notifica por email
    if (action === 'aprovar') {
      const verificacao = await base44.asServiceRole.entities.Verificacao.get(verificacao_id);
      if (verificacao?.user_email) {
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter({});
        const provider = providers.find(p => p.email === verificacao.user_email || p.created_by === verificacao.user_email);
        if (provider) {
          await base44.asServiceRole.entities.ServiceProvider.update(provider.id, { verified: true });
          console.log(`[adminVerificacao] Marked provider ${provider.id} as verified`);

          // Email de confirmação para o prestador
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: verificacao.user_email,
            from_name: 'Trancoso Resolve',
            subject: `✅ Identidade verificada! Seu perfil está aprovado`,
            body: `Olá, ${verificacao.user_name || provider.full_name}!

Ótima notícia! Sua identidade foi verificada com sucesso pela equipe da Trancoso Resolve.

🏅 Você agora possui o Selo Verificado em seu perfil — isso aumenta sua visibilidade e gera mais confiança nos clientes.

O que muda agora:
• Seu perfil aparece com destaque nos resultados de busca
• Clientes verão o badge "✅ Verificado" no seu card
• Você tem acesso a mais solicitações de serviço

Acesse seu dashboard: https://trancosoresolve.com.br/Dashboard

Bons negócios!
Equipe Trancoso Resolve`,
          });
        }
      }
    }

    // Se rejeitado, notifica o prestador com o motivo
    if (action === 'rejeitar') {
      const verificacao = await base44.asServiceRole.entities.Verificacao.get(verificacao_id);
      if (verificacao?.user_email) {
        const motivoTexto = motivo && motivo.trim() ? motivo : 'O documento enviado não pôde ser validado.';
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: verificacao.user_email,
          from_name: 'Trancoso Resolve',
          subject: `⚠️ Verificação de identidade — ação necessária`,
          body: `Olá, ${verificacao.user_name}!

Infelizmente não conseguimos verificar sua identidade com o documento enviado.

Motivo: ${motivoTexto}

O que fazer agora:
1. Acesse seu perfil em: https://trancosoresolve.com.br/VerificacaoDocumento
2. Envie um novo documento legível (RG, CNH ou Passaporte)
3. A foto deve estar nítida, sem reflexos ou partes cortadas

Se tiver dúvidas, responda este email ou entre em contato via WhatsApp: https://wa.me/5573998283579

Equipe Trancoso Resolve`,
        });
      }
    }

    console.log(`[adminVerificacao] ${action} verificacao ${verificacao_id} by ${user.email}`);
    return Response.json({ ok: true, status: newStatus });

  } catch (error) {
    console.error('[adminVerificacao] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});