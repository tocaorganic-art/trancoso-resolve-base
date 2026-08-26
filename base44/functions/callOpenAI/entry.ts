import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import OpenAI from 'npm:openai@4.20.1';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const expectedSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
        const providedSecret = req.headers.get('x-automation-secret') || body.internal_secret;
        const isInternal = Boolean(expectedSecret && providedSecret === expectedSecret);
        const user = isInternal ? null : await base44.auth.me();
        if (!isInternal && !user) return Response.json({ error: 'Usuário não autenticado' }, { status: 401 });
        if (!Deno.env.get("OPENAI_API_KEY")) {
            return Response.json({ error: 'Configuração de IA não encontrada', details: 'A chave da OpenAI não está configurada no servidor.' }, { status: 500 });
        }
        const { messages, response_json_schema, systemPrompt } = body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: 'Mensagens inválidas', details: 'O campo messages é obrigatório e deve ser um array não vazio.' }, { status: 400 });
        }
        const openAIMessages = [{ role: "system", content: systemPrompt || "Você é o Toca, assistente virtual especializado em serviços em Trancoso, Bahia." }, ...messages];
        const completionConfig: Record<string, unknown> = { model: "gpt-4o-mini", messages: openAIMessages, temperature: 0.7, max_tokens: 1000 };
        if (response_json_schema) {
            completionConfig.response_format = { type: "json_schema", json_schema: { name: "response", strict: true, schema: response_json_schema } };
        }
        const completion = await openai.chat.completions.create(completionConfig as any);
        const responseContent = completion.choices[0].message.content;
        if (response_json_schema) {
            try {
                const parsedResponse = JSON.parse(responseContent as string);
                return Response.json({ success: true, data: parsedResponse, usage: completion.usage });
            } catch (_parseError) {
                return Response.json({ error: 'Erro ao processar resposta da IA' }, { status: 500 });
            }
        }
        return Response.json({ success: true, message: responseContent, usage: completion.usage });
    } catch (error) {
        const err = error as { status?: number; message?: string };
        if (err.status === 401) return Response.json({ error: 'Chave de API inválida' }, { status: 500 });
        if (err.status === 429) return Response.json({ error: 'Limite de uso excedido' }, { status: 429 });
        return Response.json({ error: 'Erro ao processar requisição', details: (err as Error).message }, { status: 500 });
    }
});
