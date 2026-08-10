import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Captura o email do usuário se autenticado (best-effort, não obrigatório)
    let userEmail = String(body.user_email || "").slice(0, 200);
    if (!userEmail) {
      try {
        const user = await base44.auth.me();
        if (user?.email) userEmail = String(user.email).slice(0, 200);
      } catch (_) { /* ignora — usuário pode não estar logado */ }
    }

    await base44.asServiceRole.entities.ClientErrorLog.create({
      error_message: String(body.error_message || "").slice(0, 2000),
      error_stack: String(body.error_stack || "").slice(0, 5000),
      component_stack: String(body.component_stack || "").slice(0, 5000),
      page_url: String(body.page_url || "").slice(0, 500),
      user_agent: String(body.user_agent || "").slice(0, 500),
      user_email: userEmail,
    });

    return Response.json({ ok: true });
  } catch (error) {
    // Nunca falhar — é fire-and-forget para não quebrar a UI
    return Response.json({ ok: false }, { status: 200 });
  }
});