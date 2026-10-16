import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Notifica o time interno sobre solicitações de exclusão de conta.
// Dados vêm SEMPRE do usuário autenticado (nunca do corpo da requisição).

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

    const quando = new Date().toLocaleString('pt-BR', { timeZone: 'America/Bahia' });
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'contato@tocaexperience.com.br',
      subject: `[SOLICITAÇÃO] Exclusão de conta: ${user.email}`,
      body: `Usuário ${user.full_name || ''} (${user.email}) solicitou exclusão da conta em ${quando}.`,
    });

    return json({ ok: true });
  } catch (error) {
    console.error('[notificarExclusaoConta]', (error as Error).message);
    return json({ error: (error as Error).message || 'Erro interno' }, 500);
  }
});