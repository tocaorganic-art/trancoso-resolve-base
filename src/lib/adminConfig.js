/**
 * adminConfig.js — Configuração centralizada de permissões de admin
 *
 * SEGURANÇA: Este arquivo existe apenas para não duplicar a lógica de whitelist.
 * A verificação primária de admin DEVE ser feita via `user.role === 'admin'`
 * retornado pelo backend (Base44 SDK). A whitelist de email é um fallback
 * para o email do proprietário da conta, não um mecanismo de segurança standalone.
 *
 * NÃO adicione emails de terceiros aqui. A autorização real vem do backend.
 */

/**
 * Lista de emails que recebem acesso de admin como fallback.
 * Use apenas para o e-mail do dono da conta Base44.
 */
export const ADMIN_EMAIL_WHITELIST = ['tocaorganic@gmail.com'];

/**
 * Verifica se um usuário tem permissão de admin.
 * Prioriza role do backend; fallback para whitelist de email.
 *
 * @param {object|null} user - Objeto de usuário retornado pelo Base44 SDK
 * @returns {boolean}
 */
export function isAdminUser(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return ADMIN_EMAIL_WHITELIST.includes(user.email);
}
