import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { quotaCheckAndBump } from './security.ts';

// Gateway IA do app com cota diária — move o consumo de créditos de integração
// (InvokeLLM / GenerateImage) do navegador para o servidor. Cada operação é uma
// ação específica do app; não há proxy genérico: prompts de busca e recomendação
// são montados aqui, e o tamanho dos prompts conversáveis é limitado.

interface IaRequest {
  operacao?: string;
  prompt?: string;
  file_urls?: string[];
  query?: string;
  prestadores?: any[];
  pergunta?: string;
  servicos?: any[];
  file_url?: string;
  existing_image_url?: string;
}

// Limite diário por operação (usuário logado; anônimo recebe fração).
const LIMITES: Record<string, number> = {
  conversa: 40,
  busca_semantica: 30,
  recomendacao: 15,
  extrair_transacoes: 15,
  imagem: 10,
};

const MAX_PROMPT = 8000;
const MAX_URLS = 3;

function ehUrlSegura(u: string): boolean {
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // CORS restrito ao próprio app
  const ALLOWED_ORIGINS = ['https://trancosoresolve.com.br', 'https://www.trancosoresolve.com.br', 'https://trancoso-resolve-app.base44.app'];
  const requestOrigin = req.headers.get('origin') || '';
  const corsOrigin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : 'https://trancosoresolve.com.br';
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405);

  try {
    const base44 = createClientFromRequest(req);
    const body: IaRequest = await req.json().catch(() => ({}));
    const operacao = String(body.operacao || '');
    const limiteBase = LIMITES[operacao];
    if (!limiteBase) return json({ error: 'Operação de IA inválida.' }, 400);

    let user: any = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    // Cota por usuário logado; para anônimos, por IP (limite reduzido).
    const limiteEfetivo = user?.email ? limiteBase : Math.max(3, Math.floor(limiteBase / 3));
    const identidade = user?.email ? `ia|${operacao}|${user.email}` : `ia|${operacao}|ip:${(req.headers.get('x-forwarded-for') || 'anon').split(',')[0].trim()}`;
    const quota = await quotaCheckAndBump(base44, identidade, limiteEfetivo);
    if (!quota.allowed) {
      return json({ error: 'Limite diário de uso da IA atingido. Tente novamente amanhã.' }, 429);
    }

    switch (operacao) {
      // Chat (Toca / suporte): prompt montado no cliente, com limite de tamanho.
      case 'conversa': {
        const prompt = String(body.prompt || '');
        if (!prompt.trim()) return json({ error: 'Mensagem vazia.' }, 400);
        if (prompt.length > MAX_PROMPT) return json({ error: 'Mensagem muito longa.' }, 400);
        const fileUrls = (Array.isArray(body.file_urls) ? body.file_urls : []).filter(ehUrlSegura).slice(0, MAX_URLS);
        const resposta = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          ...(fileUrls.length ? { file_urls: fileUrls } : {}),
        });
        return json({ resposta: typeof resposta === 'string' ? resposta : JSON.stringify(resposta) });
      }

      // Busca semântica de prestadores: prompt e schema fixos no servidor.
      case 'busca_semantica': {
        const query = String(body.query || '').slice(0, 200);
        if (!query.trim()) return json({ error: 'Busca vazia.' }, 400);
        const prestadores = (Array.isArray(body.prestadores) ? body.prestadores : []).slice(0, 50);
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Baseado na busca do usuário "${query}", analise a lista de prestadores e retorne APENAS os IDs dos mais relevantes. Procure por correspondência semântica. Se não encontrar correspondência, retorne array vazio. Contexto: ${JSON.stringify(prestadores)}`,
          response_json_schema: {
            type: 'object',
            properties: { relevant_provider_ids: { type: 'array', items: { type: 'string' } } },
            required: ['relevant_provider_ids'],
          },
        });
        const ids = result?.relevant_provider_ids;
        return json({ relevant_provider_ids: Array.isArray(ids) ? ids : [] });
      }

      // Recomendações de serviços: prompt e schema fixos no servidor.
      case 'recomendacao': {
        const pergunta = String(body.pergunta || '').slice(0, 500);
        if (!pergunta.trim()) return json({ error: 'Pergunta vazia.' }, 400);
        const servicos = (Array.isArray(body.servicos) ? body.servicos : []).slice(0, 50);
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Você é um concierge virtual especializado em Trancoso, Brasil.\n\nUsuário perguntou: "${pergunta}"\n\nServiços disponíveis:\n${JSON.stringify(servicos, null, 2)}\n\nAnalise a pergunta e recomende os 3 MELHORES serviços para o usuário. Para cada recomendação, forneça: 1. Nome do serviço; 2. Por que você recomenda (específico e relevante à pergunta); 3. Dicas práticas para aproveitar melhor.`,
          response_json_schema: {
            type: 'object',
            properties: {
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { service_name: { type: 'string' }, reason: { type: 'string' }, tips: { type: 'string' } },
                },
              },
            },
          },
        });
        return json({ recommendations: response?.recommendations || [] });
      }

      // Extração de transações de documentos financeiros (exige login).
      case 'extrair_transacoes': {
        if (!user?.email) return json({ error: 'Faça login para analisar documentos.' }, 401);
        const prompt = String(body.prompt || '');
        if (!prompt.trim() || prompt.length > MAX_PROMPT) return json({ error: 'Requisição inválida.' }, 400);
        const fileUrl = String(body.file_url || '');
        if (!ehUrlSegura(fileUrl)) return json({ error: 'URL do documento inválida.' }, 400);
        const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          file_urls: [fileUrl],
          response_json_schema: {
            type: 'object',
            properties: {
              transactions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    amount: { type: 'number' },
                    type: { type: 'string' },
                    category: { type: 'string' },
                    date: { type: 'string' },
                    payment_method: { type: 'string' },
                    notes: { type: 'string' },
                  },
                },
              },
            },
          },
        });
        return json(aiResult ?? {});
      }

      // Geração de imagem (Toca Vision).
      case 'imagem': {
        const prompt = String(body.prompt || '').slice(0, 1200);
        if (!prompt.trim()) return json({ error: 'Descreva a imagem.' }, 400);
        const existing = String(body.existing_image_url || '');
        const result = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt,
          ...(ehUrlSegura(existing) ? { existing_image_urls: [existing] } : {}),
        });
        return json({ url: result?.url || null });
      }

      default:
        return json({ error: 'Operação de IA inválida.' }, 400);
    }
  } catch (error) {
    console.error('[iaCreditada]', (error as Error).message);
    return json({ error: (error as Error).message || 'Erro interno' }, 500);
  }
});