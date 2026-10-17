import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { quotaCheckAndBump } from './security.ts';

// Substitui o antigo callMicrosoftAI (Azure AI Foundry, conta cancelada em
// 17/10/2026). Usa o InvokeLLM nativo do Base44, já usado por outras funções
// do projeto (atendimento_chat_ia, tocaTriaTranslator, verificarDocumento),
// sem exigir nenhum secret adicional.
const DEFAULT_SYSTEM_PROMPT = `Você é o Toca, assistente virtual especializado em serviços em Trancoso, Bahia.
Ajude usuários a encontrar prestadores de serviço, entender a plataforma e tirar dúvidas sobre serviços locais.
Seja cordial, objetivo e responda sempre em português brasileiro.
Nunca use travessão (—), meia risca (–) nem hífen como separador de frase nas respostas. Use vírgula, ponto, dois pontos ou parênteses.`;

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function buildPrompt(systemPrompt: string, messages: Array<{ role?: string; content?: string }>): string {
  const history = messages
    .filter((message) => message?.role !== 'system')
    .map((message) => `${message?.role === 'assistant' ? 'Assistente' : 'Usuário'}: ${String(message?.content || '')}`)
    .join('\n');
  return `${systemPrompt}\n\n---\n${history}`;
}

function responseText(result: any): string {
  if (typeof result === 'string') return result;
  return String(result?.response || result?.text || result?.message || '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const expectedSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-automation-secret') || body.internal_secret || '';
    const isInternal = Boolean(expectedSecret && timingSafeEqualStr(providedSecret, expectedSecret));
    const user = isInternal ? null : await base44.auth.me();
    if (!isInternal && !user) return Response.json({ error: 'Usuário não autenticado' }, { status: 401 });
    if (!isInternal) {
      const q = await quotaCheckAndBump(base44, `platform-ai|${user!.email}`, 40);
      if (!q.allowed) return Response.json({ error: 'Limite diário de uso da IA atingido. Tente novamente amanhã.' }, { status: 429 });
    }

    const { messages, response_json_schema, systemPrompt } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({
        error: 'Mensagens inválidas',
        details: 'O campo "messages" é obrigatório e deve ser um array não vazio.',
      }, { status: 400 });
    }

    const prompt = buildPrompt(systemPrompt || DEFAULT_SYSTEM_PROMPT, messages);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      ...(response_json_schema ? { response_json_schema } : {}),
    });

    if (response_json_schema) {
      return Response.json({ success: true, data: result });
    }

    const content = responseText(result);
    if (!content) {
      return Response.json({ error: 'Resposta vazia do assistente' }, { status: 500 });
    }
    return Response.json({ success: true, message: content });
  } catch (error) {
    console.error('Erro na função callPlatformAI:', error);
    return Response.json({
      error: 'Erro ao processar requisição',
      details: (error as Error).message,
    }, { status: 500 });
  }
});
