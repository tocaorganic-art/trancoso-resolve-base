import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const [users, transactions] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date'),
      base44.asServiceRole.entities.Transaction.list('-date'),
    ]);

    return Response.json({
      users: users || [],
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('[adminDashboardData] erro:', error instanceof Error ? error.message : 'unknown_error');
    return Response.json({ error: 'Não foi possível carregar os dados administrativos.' }, { status: 500 });
  }
});
