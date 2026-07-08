import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificação de autenticação
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Não autorizado. Faça login para continuar." }, { status: 401 });
    }

    const body = await req.json();
    const { email, user_name, verification_code, action = 'verify_email' } = body;

    // Garantir que o e-mail de destino pertence ao usuário logado
    if (user.email !== email) {
      return Response.json({ error: "Operação não permitida. Você só pode enviar e-mails para seu próprio endereço." }, { status: 403 });
    }

    if (!email || !verification_code) {
      return Response.json({ error: 'Email and verification_code required' }, { status: 400 });
    }

    // Rate limiting básico: máximo de 3 tentativas por hora
    const rateLimitKey = `email_rate_limit:${user.email}`;
    const lastAttemptTime = localStorage?.getItem(rateLimitKey);
    const now = Date.now();
    const attempts = JSON.parse(localStorage?.getItem(`${rateLimitKey}:attempts`) || '[]');
    const recentAttempts = attempts.filter(t => now - t < 3600000); // Últimas 1 hora
    
    if (recentAttempts.length >= 3) {
      return Response.json({ error: "Muitas tentativas. Tente novamente em uma hora." }, { status: 429 });
    }

    // Registrar tentativa
    recentAttempts.push(now);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${rateLimitKey}:attempts`, JSON.stringify(recentAttempts));
    }

    // Email templates
    const templates = {
      verify_email: {
        subject: 'Verifique seu Email - Trancoso Resolve',
        html: `
          <h2>Bem-vindo ao Trancoso Resolve!</h2>
          <p>Olá ${user_name || 'usuário'},</p>
          <p>Para verificar sua conta, use o código abaixo:</p>
          <h3 style="font-size: 24px; letter-spacing: 2px; background: #f0f0f0; padding: 10px; border-radius: 5px;">
            ${verification_code}
          </h3>
          <p>Ou clique no link: <a href="https://trancosoresolve.com/verify?code=${verification_code}">Verificar Email</a></p>
          <p>Este código expira em 24 horas.</p>
          <p>Se você não solicitou isso, ignore este email.</p>
        `
      },
      password_reset: {
        subject: 'Redefinir sua Senha - Trancoso Resolve',
        html: `
          <h2>Redefinição de Senha</h2>
          <p>Olá ${user_name || 'usuário'},</p>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="https://trancosoresolve.com/reset-password?code=${verification_code}" 
             style="display: inline-block; padding: 10px 20px; background: #0A81D1; color: white; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou isso, ignore este email.</p>
        `
      },
      booking_confirmation: {
        subject: 'Agendamento Confirmado - Trancoso Resolve',
        html: `
          <h2>Seu Agendamento foi Confirmado!</h2>
          <p>Olá ${user_name || 'usuário'},</p>
          <p>Seu serviço foi agendado com sucesso.</p>
          <p><strong>Detalhes:</strong></p>
          <ul>
            <li>Data: ${body.service_date || 'A confirmar'}</li>
            <li>Horário: ${body.service_time || 'A confirmar'}</li>
            <li>Valor: R$ ${body.amount || '0'}</li>
          </ul>
          <p>Acesse sua conta para ver mais detalhes: <a href="https://trancosoresolve.com/MeusPedidos">Meus Pedidos</a></p>
        `
      }
    };

    const template = templates[action] || templates.verify_email;

    // In production, use SendGrid, AWS SES, or similar
    // For now, we'll log to simulate email sending
    console.log('[sendVerificationEmail]', {
      to: email,
      subject: template.subject,
      timestamp: new Date().toISOString(),
      user: user_name
    });

    // TODO: Integrate with email provider (SendGrid, AWS SES)
    // const result = await sendEmailViaProvider(email, template.subject, template.html);

    return Response.json({
      success: true,
      message: 'Email sent successfully',
      email: email
    });

  } catch (error) {
    console.error('[sendVerificationEmail] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});