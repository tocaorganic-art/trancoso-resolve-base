import { base44 } from './base44Client';

/**
 * Envia mensagem WhatsApp via function Base44.
 * Uso interno (admin/webhooks). Chamadas de usuário final não têm permissão.
 *
 * @param {object} params
 * @param {string} params.tipo  - tipo do log (ex: 'boas_vindas_plano')
 * @param {string} params.telefone
 * @param {string} params.mensagem
 * @param {string} [params.prestador_id]
 * @param {string} [params.referencia_id]
 * @param {string} [params.referencia_tipo]
 */
export async function enviarMensagemWhatsApp(params) {
  return base44.functions.enviarMensagemWhatsApp(params);
}
