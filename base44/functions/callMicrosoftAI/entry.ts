import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DEFAULT_ENDPOINT = 'https://trancosoresolve-2533-resource.services.ai.azure.com/api/projects/trancosoresolve-2533';
const DEFAULT_MODEL = 'trancoso-phi4-mini';
const DEFAULT_SYSTEM_PROMPT = `Você é o Toca, assistente virtual especializado em serviços em Trancoso, Bahia.
Ajude usuários a encontrar prestadores de serviço, entender a plataforma e tirar dúvidas sobre serviços locais.
Seja cordial, objetivo e responda sempre em português brasileiro.`;

function chatEndpoint(projectEndpoint: string): string {
  const endpoint = projectEndpoint.replace(/\/+$/, '');
  if (endpoint.endsWith('/openai/v1')) return `${endpoint}/chat/completions`;
  if (endpoint.endsWith('/openai')) return `${endpoint}/v1/chat/completions`;
  return `${endpoint}/openai/v1/chat/completions`;
}

function responseText(completion: any): string {
  const content = completion?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) return content.map((part) => String(part?.text || '')).join('');
  return String(content || '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const expectedSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-automation-secret') || body.internal_secret;
    const isInternal = Boolean(expectedSecret && providedSecret === expectedSecret);
    const user = isInternal ? null : await base44.auth.me();
    if (!isInternal && !user) return Response.json({ error: 'Usuário não autenticado' }, { status: 401 });

    const apiKey = Deno.env.get('AZURE_FOUNDRY_API_KEY') || Deno.env.get('AZURE_AI_API_KEY');
    if (!apiKey) {
      console.error('Chave do Microsoft Foundry não configurada');
      return Response.json({
        error: 'Configuração de IA não encontrada',
        details: 'Configure AZURE_FOUNDRY_API_KEY nos segredos do Base44.',
      }, { status: 500 });
    }

    const { messages, response_json_schema, systemPrompt } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({
        error: 'Mensagens inválidas',
        details: 'O campo "messages" é obrigatório e deve ser um array não vazio.',
      }, { status: 400 });
    }

    const chatMessages = [
      { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...messages
        .filter((message) => message?.role !== 'system')
        .map((message) => ({
          role: message?.role === 'assistant' ? 'assistant' : 'user',
          content: String(message?.content || ''),
        })),
    ];

    const response = await fetch(chatEndpoint(
      Deno.env.get('AZURE_FOUNDRY_PROJECT_ENDPOINT') || DEFAULT_ENDPOINT,
    ), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        model: Deno.env.get('AZURE_FOUNDRY_MODEL') || DEFAULT_MODEL,
        messages: chatMessages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro no Microsoft Foundry: ${response.status}`);
    }

    const content = responseText(await response.json());
    if (response_json_schema) {
      try {
        return Response.json({ success: true, data: JSON.parse(content) });
      } catch (parseError) {
        console.error('Resposta JSON inválida do Microsoft Foundry', parseError);
        return Response.json({
          error: 'Erro ao processar resposta da IA',
          details: 'A IA retornou um formato inválido.',
        }, { status: 500 });
      }
    }

    return Response.json({ success: true, message: content });
  } catch (error) {
    console.error('Erro na função callMicrosoftAI:', error);
    return Response.json({
      error: 'Erro ao processar requisição',
      details: (error as Error).message,
    }, { status: 500 });
  }
});
