// Helpers de segurança — cópia local (a plataforma não permite imports fora da pasta da função).
// Gate padrão: segredo de automação (header x-automation-secret ou body.internal_secret,
// comparado de forma constante) OU usuário admin autenticado.

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function automationSecretValid(req: Request, body: any): boolean {
  const expected = Deno.env.get('AUTOMATION_WEBHOOK_SECRET') ?? '';
  if (!expected) return false;
  const provided = (req.headers.get('x-automation-secret') || body?.internal_secret || '');
  return timingSafeEqual(expected, provided);
}

export async function isAdminUser(base44: any): Promise<boolean> {
  try {
    const user = await base44.auth.me();
    return Boolean(user && user.role === 'admin');
  } catch {
    return false;
  }
}

export async function isTrustedCaller(req: Request, base44: any, body?: any): Promise<boolean> {
  if (automationSecretValid(req, body)) return true;
  if (!base44) return false;
  try {
    return await isAdminUser(base44);
  } catch {
    return false;
  }
}

export function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Cota diária persistida na entidade AiUsoDiario. Retorna allowed=false quando
 * o limite do dia foi atingido; incrementa o contador ao permitir.
 */
export async function quotaCheckAndBump(base44: any, chave: string, limite: number) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `${chave}|${today}`;
  const rows = await base44.asServiceRole.entities.AiUsoDiario.filter({ chave: key });
  const used = (rows || []).reduce((s: number, r: any) => s + (r.usos || 0), 0);
  if (used >= limite) return { allowed: false, used };
  const existing = (rows || [])[0];
  if (existing) {
    await base44.asServiceRole.entities.AiUsoDiario.update(existing.id, { usos: (existing.usos || 0) + 1 });
  } else {
    await base44.asServiceRole.entities.AiUsoDiario.create({ chave: key, usos: 1 });
  }
  return { allowed: true, used: used + 1 };
}
