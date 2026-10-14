// Mascara dados pessoais antes de irem para logs de servidor (console.*).
// Auditoria P2-2: logs de produção expunham e-mail, telefone e nome completo
// em texto puro — qualquer pessoa com acesso aos logs do Base44 via console
// via conseguia extrair PII de clientes e prestadores.

export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '(sem e-mail)';
  const [user, domain] = email.split('@');
  const maskedUser = user.length <= 2 ? `${user[0] || ''}*` : `${user.slice(0, 2)}${'*'.repeat(user.length - 2)}`;
  const domainParts = domain.split('.');
  const label = domainParts[0] || '';
  const maskedLabel = label.length <= 1 ? label : `${label[0]}${'*'.repeat(label.length - 1)}`;
  const tld = domainParts.slice(1).join('.');
  return tld ? `${maskedUser}@${maskedLabel}.${tld}` : `${maskedUser}@${maskedLabel}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '(sem telefone)';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length);
  return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
}

export function maskName(name?: string | null): string {
  if (!name || typeof name !== 'string') return '(sem nome)';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '(sem nome)';
  if (parts.length === 1) return `${parts[0][0]}.`;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
