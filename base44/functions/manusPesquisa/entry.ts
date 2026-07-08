import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MANUS_BASE_URL = "https://api.manus.im";
const MANUS_API_KEY = Deno.env.get("APY_KEY_MANUS");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { action, task_id, prompt } = body;

    const headers = {
      "Content-Type": "application/json",
      "API_KEY": MANUS_API_KEY,
    };

    // Criar nova tarefa
    if (action === "create") {
      if (!prompt) {
        return Response.json({ error: 'Prompt obrigatório' }, { status: 400 });
      }

      console.log(`[Manus] Criando tarefa para usuário ${user.email}: ${prompt}`);

      const res = await fetch(`${MANUS_BASE_URL}/v1/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt,
          agent_profile: "manus-1.6",
        }),
      });

      const data = await res.json();
      console.log(`[Manus] Tarefa criada:`, JSON.stringify(data));

      if (!res.ok) {
        console.error(`[Manus] Erro ao criar tarefa:`, data);
        return Response.json({ error: data.message || 'Erro ao criar tarefa' }, { status: res.status });
      }

      return Response.json({ task_id: data.id, status: data.status, task_url: data.task_url });
    }

    // Verificar status da tarefa
    if (action === "status") {
      if (!task_id) {
        return Response.json({ error: 'task_id obrigatório' }, { status: 400 });
      }

      const res = await fetch(`${MANUS_BASE_URL}/v1/tasks/${task_id}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        console.error(`[Manus] Erro ao buscar tarefa ${task_id}:`, data);
        return Response.json({ error: data.message || 'Erro ao buscar status' }, { status: res.status });
      }

      // Extrair resultado final se concluído
      let result = null;
      if (data.status === "completed" && data.output) {
        const assistantMessages = data.output
          .filter(m => m.role === "assistant")
          .flatMap(m => m.content || [])
          .filter(c => c.type === "output_text" && c.text)
          .map(c => c.text);
        result = assistantMessages.join("\n\n") || null;
      }

      return Response.json({ task_id: data.id, status: data.status, result, task_url: data.task_url || data.metadata?.task_url });
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    console.error("[Manus] Erro inesperado:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});