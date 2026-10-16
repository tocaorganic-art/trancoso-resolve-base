// Helpers de segurança — cópia local (a plataforma não permite imports fora da pasta da função).
// Cota diária persistida na entidade AiUsoDiario.

/**
 * Retorna allowed=false quando o limite do dia foi atingido; incrementa o
 * contador ao permitir.
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