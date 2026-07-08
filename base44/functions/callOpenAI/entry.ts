import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import OpenAI from 'npm:openai@4.20.1';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Valida autenticação do usuário
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Valida configuração da API Key
        if (!Deno.env.get("OPENAI_API_KEY")) {
            console.error("OPENAI_API_KEY não está configurada");
            return Response.json({ 
                error: 'Configuração de IA não encontrada',
                details: 'A chave da OpenAI não está configurada no servidor.'
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

        // Constrói as mensagens para a OpenAI
        const openAIMessages = [
            {
                role: "system",
                content: systemPrompt || `Você é o Toca, assistente virtual especializado em serviços em Trancoso, Bahia. 
                Você ajuda usuários a encontrar prestadores de serviço, entender como a plataforma funciona e responde dúvidas sobre serviços locais.
                Seja sempre cordial, prestativo e objetivo. Responda em português brasileiro.`
            },
            ...messages
        ];

        // Configura a chamada da OpenAI
        const completionConfig = {
            model: "gpt-4o-mini",
            messages: openAIMessages,
            temperature: 0.7,
            max_tokens: 1000,
        };

        // Adiciona response_format se json_schema foi fornecido
        if (response_json_schema) {
            completionConfig.response_format = {
                type: "json_schema",
                json_schema: {
                    name: "response",
                    strict: true,
                    schema: response_json_schema
                }
            };
        }

        // Chama a OpenAI
        const completion = await openai.chat.completions.create(completionConfig);
        
        const responseContent = completion.choices[0].message.content;

        // Se esperava JSON, faz o parse
        if (response_json_schema) {
            try {
                const parsedResponse = JSON.parse(responseContent);
                return Response.json({ 
                    success: true,
                    data: parsedResponse,
                    usage: completion.usage
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
            message: responseContent,
            usage: completion.usage
        });

    } catch (error) {
        console.error("Erro na função callOpenAI:", error);
        
        // Trata erros específicos da OpenAI
        if (error.status === 401) {
            return Response.json({ 
                error: 'Chave de API inválida',
                details: 'A chave da OpenAI configurada está inválida ou expirou.'
            }, { status: 500 });
        }
        
        if (error.status === 429) {
            return Response.json({ 
                error: 'Limite de uso excedido',
                details: 'O limite de requisições da OpenAI foi atingido. Tente novamente em alguns minutos.'
            }, { status: 429 });
        }

        return Response.json({ 
            error: 'Erro ao processar requisição',
            details: error.message
        }, { status: 500 });
    }
});