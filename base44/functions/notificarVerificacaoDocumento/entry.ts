import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Notifica o time interno sobre nova verificação de documento enviada.
// Destinatário fixo no servidor; dados resolvidos do banco (nunca do corpo).

Deno.serve(async (req) => {
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
    const user = await base44.auth.me().catch(() => null);
    if (!user) return json({ error: 'Não autorizado' }, 401);

    const { verificacao_id } = await req.json().catch(() => ({} as any));
    if (!verificacao_id) return json({ error: 'verificacao_id obrigatório' }, 400);

    const verificacao = await base44.asServiceRole.entities.Verificacao.get(verificacao_id);
    if (!verificacao) return json({ error: 'Verificação não encontrada' }, 404);

    const isOwner = verificacao.created_by === user.email || user.role === 'admin';
    if (!isOwner) return json({ error: 'Você só pode notificar sobre a própria verificação' }, 403);

    let meta: any = {};
    try {
      meta = JSON.parse(verificacao.description || '{}');
    } catch {
      meta = {};
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'tocaorganic@gmail.com',
      subject: `Nova verificação de documento enviada por ${meta.user_name || user.full_name}`,
      body: `Prestador: ${meta.user_name || user.full_name || ''}\nEmail: ${meta.user_email || user.email}\nDocumento: ${meta.document_type || 'documento'}\nData: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia' })}\n\nAcesse o painel administrativo para analisar.`,
    });

    return json({ ok: true });
  } catch (error) {
    console.error('[notificarVerificacaoDocumento]', (error as Error).message);
    return json({ error: (error as Error).message || 'Erro interno' }, 500);
  }
});