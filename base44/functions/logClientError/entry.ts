import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { quotaCheckAndBump, escapeHtml } from './security.ts';

function redact(value: unknown, maxLength: number): string {
  return String(value || '')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [redacted]')
    .replace(/([?&](?:token|key|secret|password|code|access_token)=)[^&\s]+/gi, '$1[redacted]')
    .replace(/(api[_-]?key|secret|authorization|password)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .slice(0, maxLength);
}

function safePageUrl(value: unknown): string {
  try {
    const url = new URL(String(value || ''));
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return redact(value, 500);
  }
}

function aiText(result: any): string {
  return String(result?.data?.message || result?.message || result?.data?.content || '').slice(0, 6000);
}

const TRIAGE_PROMPT = `Analise este erro técnico da plataforma Trancoso Resolve.
Retorne uma triagem curta e prática com: causa provável, gravidade (baixa/média/alta), próximo diagnóstico e correção sugerida.
Não invente fatos, não inclua segredos e não faça alterações, deploy ou envio de mensagens. A análise será revisada por um administrador.

Erro: {{error}}
Página: {{page}}
Stack: {{stack}}
Componente: {{component}}`;

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const errorMessage = redact(body.error_message || 'Erro não identificado', 2000);
    const errorStack = redact(body.error_stack, 5000);
    const componentStack = redact(body.component_stack, 5000);
    const pageUrl = safePageUrl(body.page_url);
    const userAgent = redact(body.user_agent, 500);

    let userEmail = redact(body.user_email, 200);
    if (!userEmail) {
      try {
        const user = await base44.auth.me();
        if (user?.email) userEmail = redact(user.email, 200);
      } catch (_) { /* usuário pode não estar logado */ }
    }

    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const recent = await base44.asServiceRole.entities.ClientErrorLog.filter(
      { error_message: errorMessage, page_url: pageUrl, created_date: { $gte: thirtyMinAgo } },
      '-created_date',
      1,
    );
    if (recent?.length) return Response.json({ ok: true, duplicate: true, triage: 'skipped' });

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const pageBurst = await base44.asServiceRole.entities.ClientErrorLog.filter(
      { page_url: pageUrl, created_date: { $gte: tenMinAgo } },
      '-created_date',
      21,
    );
    if ((pageBurst || []).length >= 20) {
      return Response.json({ ok: true, throttled: true, triage: 'skipped' });
    }

    const record = await base44.asServiceRole.entities.ClientErrorLog.create({
      error_message: errorMessage,
      error_stack: errorStack,
      component_stack: componentStack,
      page_url: pageUrl,
      user_agent: userAgent,
      user_email: userEmail,
      triage_status: 'pending',
    });

    // Triage por IA consome créditos: limite global diário (endpoint público por
    // design — erros de visitantes anônimos precisam ser logáveis sem triagem IA).
    const iaQuota = await quotaCheckAndBump(base44, 'logclienterror-ia', 60).catch(() => ({ allowed: true }));
    if (!iaQuota.allowed) {
      await base44.asServiceRole.entities.ClientErrorLog.update(record.id, { triage_status: 'skipped_quota' }).catch(() => {});
      return Response.json({ ok: true, triage: 'skipped_quota' });
    }

    const internalSecret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET');
    const prompt = TRIAGE_PROMPT
      .replace('{{error}}', errorMessage)
      .replace('{{page}}', pageUrl)
      .replace('{{stack}}', errorStack)
      .replace('{{component}}', componentStack);
    const request = {
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: 'Você é o agente interno de triagem de bugs da Trancoso Resolve. Seja objetivo e seguro. Nunca use travessão (—), meia risca (–) nem hífen como separador de frase nas respostas. Use vírgula, ponto, dois pontos ou parênteses.',
      ...(internalSecret ? { internal_secret: internalSecret } : {}),
    };

    const openaiResult = await Promise.allSettled([
      base44.asServiceRole.functions.invoke('callOpenAI', request),
    ]);
    const openaiText = openaiResult[0].status === 'fulfilled' ? aiText(openaiResult[0].value) : '';
    const completed = Boolean(openaiText);
    const completedAt = new Date().toISOString();

    await base44.asServiceRole.entities.ClientErrorLog.update(record.id, {
      triage_status: completed ? 'completed' : 'failed',
      triage_openai: openaiText || 'Triagem não disponível.',
      triage_completed_at: completedAt,
    });

    const esc = escapeHtml;
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia', dateStyle: 'short', timeStyle: 'short' });
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contato@trancosoresolve.com.br',
      from_name: 'Trancoso Resolve | Agente de Erros',
      subject: `🚨 Erro capturado: ${esc(pageUrl).slice(0, 120)}`,
      body: `Um erro foi capturado e triado automaticamente.\n\nPÁGINA: ${esc(pageUrl)}\nDATA: ${now}\nUSUÁRIO: ${esc(userEmail || '(não logado)')}\n\nMENSAGEM:\n${esc(errorMessage)}\n\nTRIAGEM CHATGPT:\n${esc(openaiText || '(indisponível)')}\n\nO registro completo está no painel administrativo do Base44. Nenhuma correção ou deploy foi executado automaticamente.`,
    });

    return Response.json({ ok: true, triage: completed ? 'completed' : 'failed' });
  } catch (error) {
    console.error('[logClientError] erro de triagem', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ ok: false }, { status: 200 });
  }
});
