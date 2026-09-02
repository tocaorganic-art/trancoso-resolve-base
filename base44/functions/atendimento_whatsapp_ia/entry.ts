import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CODE_VERSION = 'v1.0.0';

// ---------------------------------------------------------------------------
// TrIA System Prompt — Toca TrIA, assistente oficial da Trancoso Resolve
// Condensado para uso em WhatsApp (sem tabelas markdown, máx. 200 palavras/resp)
// ---------------------------------------------------------------------------
const TRIA_SYSTEM_PROMPT = `
Você é a Toca TrIA, assistente oficial da Trancoso Resolve — plataforma que conecta moradores, turistas e empresários com prestadores verificados na Costa do Descobrimento (Trancoso, Arraial d'Ajuda, Porto Seguro, Caraíva, Cumuruxatiba e toda a região do Extremo Sul da Bahia).

OBJETIVO PRINCIPAL
Transformar conversas em ações concretas: busca de prestador, agendamento, esclarecimento de dúvidas, gestão de perfil. Tom acolhedor, prático e direto — sem jargão técnico.

ANTES DE CADA RESPOSTA, identifique internamente (não mostre ao usuário):
- INTENÇÃO: BUSCA_SERVICO | AGENDAMENTO | DUVIDA_PLANOS | DUVIDA_VERIFICACAO | DUVIDA_TECNICA | GESTAO_PERFIL | CURADORIA_LOCAL | SAUDACAO
- TIPO_USUARIO: cliente ou prestador?
- DADOS_DISPONÍVEIS: que informações já foram fornecidas?
- PRÓXIMA_AÇÃO: pergunta para coletar dado faltante OU orientação direta

FLUXO CLIENTE (BUSCA_SERVICO):
Colete: tipo de serviço, cidade (nunca assuma Trancoso — pergunte), bairro/região, quando precisa, urgência. Após ter dados, oriente para https://trancosoresolve.com.br/servicos/{categoria}-{cidade} ou ofereça a busca.

FLUXO PRESTADOR:
- Cadastro: oriente para https://trancosoresolve.com.br/SejaPrestador
- Verificação pendente: "Documento recebido, análise em até 48h. Você receberá notificação por e-mail."
- Verificação REJEITADA (QUALQUER motivo): NUNCA revele o motivo real. Use SEMPRE: "⚠️ Seu cadastro não foi aceito em nossa plataforma. Para dúvidas: suporte@trancosoresolve.com.br — equipe responde em até 24h."

PLANOS (resumo):
- Lançamento: R$29,90/mês — 10 serviços/mês, visibilidade básica, taxa 25%
- Regular: R$49,90/mês — ilimitado, visibilidade elevada, taxa 20%
- Empresas: R$89,90/mês — ilimitado, suporte prioritário, taxa 15%

REGRAS CRÍTICAS:
1. NUNCA invente preços, prazos ou disponibilidade — direcione para o prestador ou suporte
2. NUNCA revele CPF, dados bancários ou informações de outros usuários
3. NUNCA prometa aprovação em verificação ou disponibilidade garantida de prestador
4. SEMPRE ofereça um próximo passo claro ("Quer que eu busque...?", "Prefere falar com suporte?")
5. SEMPRE pergunte a cidade antes de sugerir prestadores — a região cobre várias cidades
6. Casos de pagamento, disputa, conta bloqueada → encaminhe SEMPRE para suporte@trancosoresolve.com.br

FORMATO WHATSAPP:
- Máximo 200 palavras por resposta
- Use emojis com moderação (1-3 por mensagem)
- Sem tabelas markdown — use texto simples com • ou números
- Linguagem natural, como se fosse uma conversa de WhatsApp
- Termine com pergunta ou CTA claro quando relevante

ENCERRAMENTO:
"Qualquer coisa é só chamar! 😊"
"Precisando de algo mais, estou aqui."
`.trim();

// ---------------------------------------------------------------------------
// Envio via WABA API
// ---------------------------------------------------------------------------
async function enviarRespostaWABA(fromPhone: string, mensagem: string): Promise<boolean> {
  const token = Deno.env.get('token-id-whatsapp') || '';
  const phoneId = Deno.env.get('phone-number-id-whatsapp') || '';
  if (!token || !phoneId) {
    console.warn('[atendimento_whatsapp_ia] Secrets WABA não configurados');
    return false;
  }
  // Remove + se vier com prefixo
  const phone = fromPhone.replace(/^\+/, '');
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { preview_url: false, body: mensagem },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[atendimento_whatsapp_ia] WABA erro:', JSON.stringify(err));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[atendimento_whatsapp_ia] send error:', (e as Error).message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // --- Autenticação ---
    const expectedSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-automation-secret') || body.internal_secret;
    const isInternal = Boolean(expectedSecret && providedSecret === expectedSecret);

    if (!isInternal) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    const { telefone, mensagem } = body;
    if (!telefone || !mensagem) {
      return Response.json({ error: 'telefone e mensagem são obrigatórios' }, { status: 400 });
    }

    // Normalizar telefone
    const phoneClean = telefone.replace(/^\+/, '');
    const phoneWithPlus = `+${phoneClean}`;

    // --- Carregar histórico de conversa (últimas 8 trocas) ---
    let history = '';
    try {
      const logs = await base44.asServiceRole.entities.LogWhatsApp.filter(
        { telefone: phoneWithPlus },
        '-timestamp',
        8
      );
      if (logs && logs.length > 0) {
        const sorted = [...logs].reverse();
        history = sorted
          .map((log: any) => `${log.tipo === 'recebido' ? 'Usuário' : 'TrIA'}: ${log.mensagem}`)
          .join('\n');
      }
    } catch (e) {
      console.warn('[atendimento_whatsapp_ia] Erro ao carregar histórico:', (e as Error).message);
    }

    // --- Construir prompt completo ---
    const fullPrompt = `${TRIA_SYSTEM_PROMPT}

---
HISTÓRICO DA CONVERSA (do mais antigo ao mais recente):
${history || '(início de conversa — sem histórico anterior)'}

Usuário: ${mensagem}
---
Responda como Toca TrIA. APENAS o texto da resposta, sem prefixo "TrIA:" ou similar.`;

    // --- Chamar TrIA via InvokeLLM ---
    let aiResponse: string;
    try {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt: fullPrompt });
      aiResponse = typeof result === 'string' ? result.trim()
        : (result?.response || result?.text || result?.message || '').trim();
      if (!aiResponse) throw new Error('Resposta vazia do LLM');
      console.log(`[atendimento_whatsapp_ia] TrIA respondeu (${aiResponse.length} chars) para +${phoneClean}`);
    } catch (e) {
      console.error('[atendimento_whatsapp_ia] Erro InvokeLLM:', (e as Error).message);
      aiResponse =
        'Oi! Recebi sua mensagem 🌴 Estou com uma dificuldade técnica no momento. Pode acessar https://trancosoresolve.com.br ou falar com suporte@trancosoresolve.com.br. Respondo em até 24h! 😊';
    }

    // --- Salvar resposta no LogWhatsApp ---
    try {
      await base44.asServiceRole.entities.LogWhatsApp.create({
        tipo: 'enviado',
        telefone: phoneWithPlus,
        mensagem: aiResponse,
        status: 'enviado',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[atendimento_whatsapp_ia] Erro ao salvar log resposta:', (e as Error).message);
    }

    // --- Enviar via WABA ---
    const sent = await enviarRespostaWABA(phoneClean, aiResponse);

    return Response.json({
      success: sent,
      response: aiResponse,
      code_version: CODE_VERSION,
      ...(sent ? {} : { error: 'Resposta gerada mas falha ao enviar WhatsApp' }),
    });
  } catch (err) {
    console.error('[atendimento_whatsapp_ia] Erro geral:', (err as Error).message);
    return Response.json(
      { error: (err as Error).message, code_version: CODE_VERSION },
      { status: 500 }
    );
  }
});
