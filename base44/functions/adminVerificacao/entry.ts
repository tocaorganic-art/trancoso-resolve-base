import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const APPROVED_STATUSES = new Set(['Verificado', 'approved']);
const PHONE_PATTERN = /^\+55\d{10,11}$/;

function normalizePhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  const digits = value.replace(/\D/g, '');
  return digits ? `+${digits.startsWith('55') ? digits : `55${digits}`}` : '';
}

function safeName(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : 'prestador';
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { verificacao_id: verificationId, action, motivo } = await req.json();
    if (typeof verificationId !== 'string' || !verificationId.trim() || !action) {
      return Response.json({ error: 'verificacao_id e action são obrigatórios' }, { status: 400 });
    }
    if (!['aprovar', 'rejeitar'].includes(action)) {
      return Response.json({ error: 'action deve ser "aprovar" ou "rejeitar"' }, { status: 400 });
    }

    const verification = await base44.asServiceRole.entities.Verificacao.get(verificationId);
    if (!verification?.provider_id) {
      return Response.json({ error: 'Verificação ou prestador não encontrado' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const newStatus = action === 'aprovar' ? 'Verificado' : 'Rejeitado';
    const verificationUpdate: Record<string, unknown> = {
      status: newStatus,
      verified_at: now,
    };
    if (action === 'aprovar') {
      verificationUpdate.admin_notes = `Aprovado pelo administrador em ${now}`;
    } else if (typeof motivo === 'string' && motivo.trim()) {
      // Motivo fica restrito ao painel administrativo; nunca vai para o usuário.
      verificationUpdate.admin_notes = `Rejeitado pelo administrador: ${motivo.trim()}`;
    }
    await base44.asServiceRole.entities.Verificacao.update(verificationId, verificationUpdate);

    const provider = await base44.asServiceRole.entities.ServiceProvider.get(verification.provider_id);
    if (!provider) return Response.json({ error: 'Prestador não encontrado' }, { status: 404 });

    if (action === 'rejeitar') {
      await base44.asServiceRole.entities.ServiceProvider.update(provider.id, {
        status_verificacao: 'reprovado',
        verified: false,
      });

      if (provider.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: provider.email,
          from_name: 'Trancoso Resolve',
          subject: 'Verificação do cadastro — ação necessária',
          body: `Olá, ${safeName(provider.full_name)}!\n\nSeu cadastro não foi autorizado com os dados enviados. Acesse o site para refazer a etapa de verificação com imagens legíveis e atualizadas.\n\nSe precisar de revisão, responda este e-mail ou use o suporte disponível no site.\n\nEquipe Trancoso Resolve`,
        });
      }
      console.log(`[adminVerificacao] ${action} verification ${verificationId} by ${user.email}`);
      return Response.json({ ok: true, status: newStatus, ready_for_release: false });
    }

    const providerVerifications = await base44.asServiceRole.entities.Verificacao.filter({
      provider_id: provider.id,
    });
    const latestVerification = (type: string) => providerVerifications
      .filter((item) => item.verification_type === type)
      .sort((a, b) => Date.parse(b.created_date || b.verified_at || '') - Date.parse(a.created_date || a.verified_at || ''))[0];
    const identityApproved = APPROVED_STATUSES.has(latestVerification('identity')?.status);
    const backgroundApproved = APPROVED_STATUSES.has(latestVerification('background_check')?.status);

    if (!identityApproved || !backgroundApproved) {
      await base44.asServiceRole.entities.ServiceProvider.update(provider.id, {
        status_verificacao: 'em_analise_manual',
        verified: false,
      });
      console.log(`[adminVerificacao] etapa aprovada, aguardando outra etapa para ${provider.id}`);
      return Response.json({ ok: true, status: newStatus, ready_for_release: false });
    }

    await base44.asServiceRole.entities.ServiceProvider.update(provider.id, {
      status_verificacao: 'aprovado',
      verified: true,
      verification_approved_date: now,
    });

    const emailAlreadySent = providerVerifications.some((item) => item.welcome_email_sent_at);
    const whatsappAlreadySent = providerVerifications.some((item) => item.welcome_whatsapp_sent_at);
    const notificationErrors: string[] = [];
    let emailSent = false;
    let whatsappSent = false;

    if (provider.email && !emailAlreadySent) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: provider.email,
          from_name: 'Trancoso Resolve',
          subject: 'Bem-vindo à Trancoso Resolve — cadastro aprovado',
          body: `Olá, ${safeName(provider.full_name)}!\n\nSeu cadastro foi validado e está liberado na Trancoso Resolve.\n\nSeu perfil já pode participar da plataforma conforme as regras vigentes.\n\nAcesse seu dashboard: https://trancosoresolve.com.br/Dashboard\n\nBem-vindo!\nEquipe Trancoso Resolve`,
        });
        await base44.asServiceRole.entities.Verificacao.update(verificationId, { welcome_email_sent_at: now });
        emailSent = true;
      } catch (error) {
        notificationErrors.push('email');
        console.error('[adminVerificacao] boas-vindas por email não enviadas', error instanceof Error ? error.message : 'unknown_error');
      }
    }

    const phone = normalizePhone(provider.phone);
    if (PHONE_PATTERN.test(phone) && !whatsappAlreadySent) {
      try {
        const internalSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
        const result = await base44.asServiceRole.functions.invoke('enviarWhatsApp', {
          destinatario: phone,
          template_name: 'trc_bem_vindo_lead',
          // O template atual da Meta foi criado sem variáveis.
          parametros: [],
          ...(internalSecret ? { internal_secret: internalSecret } : {}),
        });
        const data = result?.data || result;
        if (data?.success !== true) throw new Error('WhatsApp não confirmou o envio');
        await base44.asServiceRole.entities.Verificacao.update(verificationId, { welcome_whatsapp_sent_at: now });
        whatsappSent = true;
      } catch (error) {
        notificationErrors.push('whatsapp');
        console.error('[adminVerificacao] boas-vindas por WhatsApp não enviadas', error instanceof Error ? error.message : 'unknown_error');
      }
    }

    console.log(`[adminVerificacao] cadastro liberado ${provider.id}; email=${emailSent}; whatsapp=${whatsappSent}`);
    return Response.json({
      ok: true,
      status: newStatus,
      ready_for_release: true,
      email_sent: emailSent,
      whatsapp_sent: whatsappSent,
      notification_errors: notificationErrors,
    });
  } catch (error) {
    console.error('[adminVerificacao] Error:', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Não foi possível processar a verificação' }, { status: 500 });
  }
});
