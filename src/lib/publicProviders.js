import { base44 } from '@/api/base44Client';

// Busca prestadores públicos (verificados, sanitizados) via função backend
// listPublicProviders, paginando até esgotar os resultados ou atingir o teto
// de segurança. Usado onde antes se lia ServiceProvider diretamente (RLS
// agora restringe leitura a dono/admin — ver PR fix/auditoria-p0-2).
const MAX_PAGES = 10;

export async function fetchAllPublicProviders({ occupation } = {}) {
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await base44.functions.invoke('listPublicProviders', {
      occupation,
      page,
      limit: 50,
    });
    const providers = res?.data?.providers || [];
    all.push(...providers);
    if (!res?.data?.has_more) break;
  }
  return all;
}

export async function fetchPublicProviderById(providerId) {
  if (!providerId) return null;
  const res = await base44.functions.invoke('listPublicProviders', {
    provider_id: providerId,
    limit: 1,
  });
  return res?.data?.providers?.[0] || null;
}
