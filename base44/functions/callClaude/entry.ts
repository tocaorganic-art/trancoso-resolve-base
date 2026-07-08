import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Valida autenticação do usuário
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Valida configuração da API Key
        const claudeKey = Deno.env.get("claude-full") || Deno.env.get("claude-trancosoresolve");
        if (!claudeKey) {
            console.error("Chave do Claude não está configurada");
            return Response.json({ 
                error: 'Configuração de IA não encontrada',
                details: 'A chave do Claude não está configurada no servidor.'
            }, { status: 500 });
        }

        const body = await req.json();
        const { messages, response_json_schema, systemPrompt } = body;

        // Valida payload
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json({ 
                error: 'Mensagens inválidas',
                details: 'O campo "messages" é obrigatório e deve ser um array não vazio.'
            }, { status: 400 });
        }

        // Constrói as mensagens para o Claude
        const claudeMessages = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
        }));

        // Chama a API do Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': claudeKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'false'
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 2048,
                system: systemPrompt || `Você é o Toca, assistente virtual especializado em serviços em Trancoso, Bahia. 
                Você ajuda usuários a encontrar prestadores de serviço, entender como a plataforma funciona e responde dúvidas sobre serviços locais.
                Seja sempre cordial, prestativo e objetivo. Responda em português brasileiro.`,
                messages: claudeMessages
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Erro na API do Claude: ${response.status}`);
        }

        const completion = await response.json();
        const responseContent = completion.content?.[0]?.text || '';

        // Se esperava JSON, faz o parse
        if (response_json_schema) {
            try {
                const parsedResponse = JSON.parse(responseContent);
                return Response.json({ 
                    success: true,
                    data: parsedResponse
                });
            } catch (parseError) {
                console.error("Erro ao fazer parse da resposta JSON:", parseError);
                return Response.json({ 
                    error: 'Erro ao processar resposta da IA',
                    details: 'A IA retornou um formato inválido.'
                }, { status: 500 });
            }
        }

        // Retorna texto simples
        return Response.json({ 
            success: true,
            message: responseContent
        });

    } catch (error) {
        console.error("Erro na função callClaude:", error);
        return Response.json({ 
            error: 'Erro ao processar requisição',
            details: error.message
        }, { status: 500 });
    }
});