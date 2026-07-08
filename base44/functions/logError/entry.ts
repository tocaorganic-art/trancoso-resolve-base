import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    
    // Verificação de autenticação
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Não autorizado." }, { status: 401 });
    }

    const errorData = await req.json();

    // Limitar tamanho do payload (máximo 2KB)
    const payloadSize = JSON.stringify(errorData).length;
    if (payloadSize > 2048) {
      return Response.json({ error: "Payload muito grande. Máximo 2KB por entrada." }, { status: 413 });
    }

    // Rate limiting básico: máximo de 10 logs por minuto por usuário
    const rateLimitKey = `log_rate_limit:${user.email}`;
    const logTimesKey = `${rateLimitKey}:times`;
    const now = Date.now();
    
    // Simular rate limiting (em produção, usar Redis ou similar)
    const logTimes = JSON.parse(Deno.env.get(logTimesKey) || '[]');
    const recentLogs = logTimes.filter(t => now - t < 60000); // Últimos 60 segundos
    
    if (recentLogs.length >= 10) {
      return Response.json({ error: "Muitos logs enviados. Tente novamente em 60 segundos." }, { status: 429 });
    }

    // Log error with structured format
    console.error('CLIENT_ERROR', {
      timestamp: errorData.timestamp,
      message: errorData.message,
      context: errorData.context,
      url: errorData.url,
      userAgent: errorData.userAgent?.substring(0, 200), // Truncate for size
      user_email: user.email
    });

    // In production, you could:
    // - Send to external error tracking (Sentry, Rollbar, etc.)
    // - Store in database for analysis
    // - Alert if critical error

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Error logging error:', error);
    return Response.json({ error: 'Failed to log error' }, { status: 500 });
  }
});