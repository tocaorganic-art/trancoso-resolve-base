import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { verificacao_id, status, motivo } = await req.json();

    if (!verificacao_id || !status) {
      return Response.json({ error: 'verificacao_id e status são obrigatórios' }, { status: 400 });
    }

    const allowedStatuses = ['Verificado', 'Rejeitado', 'pending', 'in_progress', 'approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return Response.json({ error: `Status inválido. Use: ${allowedStatuses.join(', ')}` }, { status: 400 });
    }

    // Buscar a verificação existente
    const verificacao = await base44.asServiceRole.entities.Verificacao.get(verificacao_id);
    if (!verificacao) {
      return Response.json({ error: 'Verificação não encontrada' }, { status: 404 });
    }

    // Mapear status legado → novo padrão
    const statusNormalizado =
      status === 'approved' ? 'Verificado' :
      status === 'rejected' ? 'Rejeitado' :
      status;

    const isAprovado = statusNormalizado === 'Verificado';
    const isRejeitado = statusNormalizado === 'Rejeitado';

    const adminNotes = isAprovado
      ? `✅ Aprovado pelo admin ${user.full_name || user.email}`
      : isRejeitado && motivo
        ? `❌ Rejeitado pelo admin: ${motivo}`
        : isRejeitado
          ? `❌ Rejeitado pelo admin ${user.full_name || user.email}`
          : '';

    const updateData: Record<string, unknown> = {
      status: statusNormalizado,
      verified_at: isAprovado ? new Date().toISOString() : undefined,
    };
    if (adminNotes) updateData.admin_notes = adminNotes;

    await base44.asServiceRole.entities.Verificacao.update(verificacao_id, updateData);

    // Buscar dados do prestador para notificação
    const providerId = verificacao.provider_id;
    let providerEmail: string | null = null;
    let providerName: string | null = null;

    if (providerId) {
      try {
        // Tentar extrair email/nome da description (padrão do PR #114)
        const descricao = verificacao.description || '';
        const emailMatch = descricao.match(/user_email:\s*([^\s|]+)/);
        const nomeMatch = descricao.match(/user_name:\s*([^|]+?)(?:\s*\||\s*$)/);

        if (emailMatch) providerEmail = emailMatch[1].trim();
        if (nomeMatch) providerName = nomeMatch[1].trim();

        // Fallback: buscar direto no ServiceProvider
        if (!providerEmail) {
          const provider = await base44.asServiceRole.entities.ServiceProvider.get(providerId);
          if (provider) {
            providerEmail = (provider as any).email || (provider as any).contact_email || null;
            providerName = (provider as any).full_name || (provider as any).name || null;
          }
        }
      } catch (_e) {
        // Não bloqueia o fluxo principal
      }
    }

    // Enviar email de notificação ao prestador
    let emailEnviado = false;
    if (providerEmail) {
      try {
        const assunto = isAprovado
          ? '✅ Sua verificação foi aprovada — Trancoso Resolve'
          : '❌ Atualização sobre sua verificação — Trancoso Resolve';

        const corpo = isAprovado
          ? `Olá${providerName ? ` ${providerName}` : ''}!\n\nSua verificação foi aprovada. Seu perfil agora está marcado como verificado na plataforma Trancoso Resolve.\n\nAcesse seu perfil em: https://www.trancosoresolve.com.br/meu-perfil\n\nObrigado por fazer parte da nossa comunidade!\n\nEquipe Trancoso Resolve`
          : `Olá${providerName ? ` ${providerName}` : ''}!\n\nInfelizmente sua verificação não pôde ser aprovada.${motivo ? `\n\nMotivo: ${motivo}` : ''}\n\nSe tiver dúvidas ou quiser tentar novamente, entre em contato conosco pelo WhatsApp ou acesse seu painel.\n\nEquipe Trancoso Resolve`;

        await base44.integrations.Email.sendEmail({
          to: providerEmail,
          subject: assunto,
          body: corpo,
        });
        emailEnviado = true;
      } catch (_e) {
        // Email falhou mas não reverte o status
      }
    }

    return Response.json({
      success: true,
      verificacao_id,
      status: statusNormalizado,
      email_enviado: emailEnviado,
      provider_email: providerEmail,
    });

  } catch (err) {
    console.error('atualizarStatusVerificacao error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    );
  }
});
