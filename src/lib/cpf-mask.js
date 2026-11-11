/**
 * Máscara de CPF para exibição e para limpeza de dados legados.
 *
 * Regra do projeto: CPF completo só existe em ServiceProviderPrivate.
 * Qualquer exibição em tela administrativa, relatório ou campo público
 * usa estas funções.
 */

const CPF_REGEX = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;

export const CPF_MASCARADO_VAZIO = '***.***.***-**';

/** Devolve só os dígitos de um valor desconhecido. */
export function onlyDigits(value) {
  return typeof value === 'string' ? value.replace(/\D/g, '') : '';
}

/**
 * Mascara um CPF mantendo visíveis apenas o segundo e o terceiro bloco.
 * Entrada inválida (menos de 11 dígitos) devolve a máscara vazia.
 */
export function maskCpf(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return CPF_MASCARADO_VAZIO;
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

/** Substitui todo CPF encontrado em um texto livre pela versão mascarada. */
export function maskCpfInText(text) {
  if (typeof text !== 'string' || !text) return text ?? '';
  return text.replace(CPF_REGEX, (match) => {
    const digits = onlyDigits(match);
    if (digits.length !== 11) return match;
    return maskCpf(digits);
  });
}

/** Verifica se o texto contém algum CPF. */
export function containsCpf(text) {
  if (typeof text !== 'string' || !text) return false;
  CPF_REGEX.lastIndex = 0;
  let encontrado = false;
  let match;
  while ((match = CPF_REGEX.exec(text)) !== null) {
    if (onlyDigits(match[0]).length === 11) {
      encontrado = true;
      break;
    }
  }
  CPF_REGEX.lastIndex = 0;
  return encontrado;
}
