// Diagnóstico temporário: o que createClientFromRequest + auth.me() veem numa requisição anônima.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let me: any = null;
  let meError: string | null = null;
  try {
    me = await base44.auth.me();
  } catch (e) {
    meError = (e as Error).message;
  }
  return Response.json({ me, meError, hasAuthHeader: Boolean(req.headers.get('authorization')) });
});