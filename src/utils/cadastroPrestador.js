/**
 * Validações do formulário de cadastro do prestador (CadastroTipo).
 *
 * Funções puras, sem dependência de React ou do SDK, para poderem ser
 * testadas com node:test. As mensagens são exibidas na própria tela,
 * nunca em alert() nativo do navegador.
 */

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

/** Valida CPF pelos dígitos verificadores (rejeita sequências repetidas). */
export function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

/** Data de nascimento no formato AAAA-MM-DD, existente e não futura. */
export function isValidBirthDate(value, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!isRealDate || year < 1900) return false;
  return date.getTime() <= today.getTime();
}

/**
 * Retorna a primeira mensagem de erro do formulário do prestador, ou null
 * quando tudo está válido. A ordem segue a ordem visual dos campos.
 */
export function validatePrestadorForm({
  tipoPessoa = 'pf',
  cpf = '',
  nomeCompleto = '',
  dataNascimento = '',
  cnpj = '',
  autorizouVerificacao = false,
} = {}, today = new Date()) {
  if (!isValidCpf(cpf)) {
    return 'Informe um CPF válido.';
  }
  if (String(nomeCompleto).trim().length < 5) {
    return 'Informe seu nome completo.';
  }
  if (!dataNascimento) {
    return 'Informe sua data de nascimento. Ela é obrigatória para a verificação de antecedentes.';
  }
  if (!isValidBirthDate(dataNascimento, today)) {
    return 'Informe uma data de nascimento válida.';
  }
  if ((tipoPessoa === 'mei' || tipoPessoa === 'pj') && onlyDigits(cnpj).length < 14) {
    return 'Informe um CNPJ válido.';
  }
  if (!autorizouVerificacao) {
    return 'Autorize a verificação de antecedentes para continuar como prestador.';
  }
  return null;
}
