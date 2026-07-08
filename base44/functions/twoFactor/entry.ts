import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const VALID_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

// In-memory store for codes (per deployment instance)
// For production, use an entity or Redis. Here we store in base44 user data via updateMe.
// We'll store code data in a temporary entity via base44 service role.

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const masked = local.length <= 2
    ? local[0] + '***'
    : local[0] + '*'.repeat(Math.min(local.length - 2, 4)) + local[local.length - 1];
  return `${masked}@${domain}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'send') {
      // Check lockout
      const now = Date.now();
      const lockoutUntil = user.two_fa_lockout_until;
      if (lockoutUntil && now < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - now) / 60000);
        return Response.json({ error: `Conta bloqueada. Tente novamente em ${remaining} minutos.`, locked: true }, { status: 429 });
      }

      const code = generateCode();
      const expiresAt = now + VALID_MINUTES * 60 * 1000;

      // Store code on user profile
      await base44.auth.updateMe({
        two_fa_code: code,
        two_fa_expires_at: expiresAt,
        two_fa_attempts: 0,
        two_fa_lockout_until: null,
      });

      // Send email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Seu código de verificação — Trancoso Resolve',
        body: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
            <img src="https://media.base44.com/images/public/68eb21726a9614db4a82ba99/866729f3e_trancoso_resolve_logo_principal.png" alt="Trancoso Resolve" style="height: 48px; margin-bottom: 24px;" />
            <h2 style="color: #1e293b; margin-bottom: 8px;">Verificação de segurança</h2>
            <p style="color: #64748b; margin-bottom: 24px;">Use o código abaixo para acessar sua conta. Válido por ${VALID_MINUTES} minutos.</p>
            <div style="background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #92400e;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">Se você não tentou fazer login, ignore este email e sua conta continuará segura.</p>
          </div>
        `,
      });

      return Response.json({ success: true, maskedEmail: maskEmail(user.email) });
    }

    if (action === 'verify') {
      const { code } = body;
      const now = Date.now();

      // Check lockout
      if (user.two_fa_lockout_until && now < user.two_fa_lockout_until) {
        const remaining = Math.ceil((user.two_fa_lockout_until - now) / 60000);
        return Response.json({ error: `Conta bloqueada. Tente novamente em ${remaining} minutos.`, locked: true }, { status: 429 });
      }

      // Check expiry
      if (!user.two_fa_code || !user.two_fa_expires_at || now > user.two_fa_expires_at) {
        return Response.json({ error: 'Código expirado. Solicite um novo.', expired: true }, { status: 400 });
      }

      const attempts = (user.two_fa_attempts || 0) + 1;

      if (user.two_fa_code !== code) {
        if (attempts >= MAX_ATTEMPTS) {
          const lockoutUntil = now + LOCKOUT_MINUTES * 60 * 1000;
          await base44.auth.updateMe({ two_fa_attempts: attempts, two_fa_lockout_until: lockoutUntil, two_fa_code: null });
          return Response.json({ error: `Muitas tentativas. Conta bloqueada por ${LOCKOUT_MINUTES} minutos.`, locked: true }, { status: 429 });
        }
        await base44.auth.updateMe({ two_fa_attempts: attempts });
        return Response.json({ error: `Código incorreto. ${MAX_ATTEMPTS - attempts} tentativa(s) restante(s).`, attemptsLeft: MAX_ATTEMPTS - attempts }, { status: 400 });
      }

      // Success — clear 2FA fields
      await base44.auth.updateMe({ two_fa_code: null, two_fa_expires_at: null, two_fa_attempts: 0, two_fa_lockout_until: null });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    console.error('2FA error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});