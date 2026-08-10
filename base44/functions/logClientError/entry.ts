import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const errorMessage = String(body.error_message || "").slice(0, 2000);
    const errorStack = String(body.error_stack || "").slice(0, 5000);
    const componentStack = String(body.component_stack || "").slice(0, 5000);
    const pageUrl = String(body.page_url || "").slice(0, 500);
    const userAgent = String(body.user_agent || "").slice(0, 500);

    // Captura o email do usuário se autenticado (best-effort, não obrigatório)
    let userEmail = String(body.user_email || "").slice(0, 200);
    if (!userEmail) {
      try {
        const user = await base44.auth.me();
        if (user?.email) userEmail = String(user.email).slice(0, 200);
      } catch (_) { /* ignora — usuário pode não estar logado */ }
    }

    // 1) Salva no banco
    await base44.asServiceRole.entities.ClientErrorLog.create({
      error_message: errorMessage,
      error_stack: errorStack,
      component_stack: componentStack,
      page_url: pageUrl,
      user_agent: userAgent,
      user_email: userEmail,
    });

    // 2) Notifica a equipe por email — com throttle de 30min por (erro + página)
    //    para não inundar a caixa em caso de crash em loop.
    try {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const recent = await base44.asServiceRole.entities.ClientErrorLog.filter(
        { error_message: errorMessage, page_url: pageUrl, created_date: { $gte: thirtyMinAgo } },
        "-created_date", 1
      );
      if (!recent || recent.length === 0) {
        const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Bahia", dateStyle: "short", timeStyle: "short" });
        const subject = `🚨 Trancoso Resolve — Erro capturado em ${pageUrl}`;
        const emailBody = `Um erro foi capturado automaticamente pelo ErrorBoundary do app.

PÁGINA: ${pageUrl}
USUÁRIO: ${userEmail || "(não logado)"}
NAVEGADOR: ${userAgent}
DATA: ${now}

MENSAGEM:
${errorMessage}

STACK:
${errorStack}

COMPONENT STACK:
${componentStack}

— Trancoso Resolve · Monitor de Erros`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: "contato@trancosoresolve.com.br",
          from_name: "Trancoso Resolve — Monitor",
          subject,
          body: emailBody,
        });
      }
    } catch (_) { /* notificação é best-effort, nunca derrubar o fluxo */ }

    return Response.json({ ok: true });
  } catch (error) {
    // Nunca falhar — é fire-and-forget para não quebrar a UI
    return Response.json({ ok: false }, { status: 200 });
  }
});