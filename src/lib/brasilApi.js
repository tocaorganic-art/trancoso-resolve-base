// Consulta pública de CNPJ via BrasilAPI (https://brasilapi.com.br).
// Gratuita, sem chave e com CORS liberado, então roda direto no navegador.
// Uso só para AUTOPREENCHER razão social e nome fantasia no cadastro: nunca
// bloqueia o formulário, nunca substitui a verificação oficial (Infosimples)
// e nada daqui é salvo além do que o próprio usuário confirmar no formulário.

const BASE_URL = 'https://brasilapi.com.br/api';
const cache = new Map();

/**
 * @param {string} cnpj CNPJ com ou sem máscara
 * @returns {Promise<null | { encontrado: false } | { encontrado: true, razaoSocial: string, nomeFantasia: string, situacao: string, municipio: string, uf: string }>}
 *   null quando a consulta falhou (rede, timeout, API fora do ar).
 */
export async function consultarCnpj(cnpj, { timeoutMs = 8000 } = {}) {
  const digits = String(cnpj || '').replace(/\D/g, '');
  if (digits.length !== 14) return null;
  if (cache.has(digits)) return cache.get(digits);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}/cnpj/v1/${digits}`, { signal: controller.signal });
    if (res.status === 400 || res.status === 404) {
      const naoEncontrado = { encontrado: false };
      cache.set(digits, naoEncontrado);
      return naoEncontrado;
    }
    if (!res.ok) return null;
    const data = await res.json();
    const resultado = {
      encontrado: true,
      razaoSocial: String(data.razao_social || '').trim(),
      nomeFantasia: String(data.nome_fantasia || '').trim(),
      situacao: String(data.descricao_situacao_cadastral || '').trim().toUpperCase(),
      municipio: String(data.municipio || '').trim(),
      uf: String(data.uf || '').trim(),
    };
    cache.set(digits, resultado);
    return resultado;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
