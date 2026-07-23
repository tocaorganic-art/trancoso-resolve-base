/**
 * Filtragem de dados de contato em mensagens do chat.
 * Bloqueia telefones, e-mails e redes sociais para manter a plataforma segura.
 */

const CONTACT_PATTERNS = [
  // Telefones brasileiros
  /\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/,
  /\+\s?\d{1,3}\s?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/,
  // E-mails
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
  // Redes sociais
  /facebook\.com\/[a-zA-Z0-9_.]+/i,
  /instagram\.com\/[a-zA-Z0-9_.]+/i,
  /linkedin\.com\/[a-zA-Z0-9_.\/]+/i,
  /t\.me\/[a-zA-Z0-9_.]+/i,
  /wa\.me\/\d+/i,
  /twitter\.com\/[a-zA-Z0-9_.]+/i,
  /tiktok\.com\/@[a-zA-Z0-9_.]+/i,
  // WhatsApp e Telegram por nome
  /\bwhatsapp\b/i,
  /\btelegram\b/i,
  /\btelefone\b.*\d{4}/i,
  /\bmeu\s+n[uú]mero\b/i,
  /\bmeu\s+email\b/i,
  /\bmeu\s+zap\b/i,
  /\bzap\s*:?\s*\d/i,
];

const BLOCK_MESSAGE = 
  "Sua mensagem não pôde ser enviada. Para sua segurança e para manter a integridade da plataforma, a troca de informações de contato (telefone, e-mail, redes sociais) não é permitida no chat. Utilize os recursos da plataforma para agendar serviços. 🙏";

/**
 * Verifica se a mensagem contém dados de contato proibidos.
 * @param {string} message 
 * @returns {{ blocked: boolean, reason: string }}
 */
export function checkContactData(message) {
  if (!message) return { blocked: false };
  for (const pattern of CONTACT_PATTERNS) {
    if (pattern.test(message)) {
      return { blocked: true, reason: BLOCK_MESSAGE };
    }
  }
  return { blocked: false };
}