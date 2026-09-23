// ─── Cliente mínimo para a API do Asaas (https://docs.asaas.com) ─────────────
// Não expõe a chave: ela é lida apenas via Deno.env.get('ASAAS_API_KEY') no
// momento da chamada, dentro do próprio ambiente de execução da function.
// Nunca logar `config.apiKey` nem devolvê-lo em respostas.

export interface AsaasConfig {
  apiKey: string;
  baseUrl: string; // sandbox por padrão; produção via ASAAS_ENV=production
}

/**
 * Lê a configuração do Asaas a partir das variáveis de ambiente do Base44.
 * Retorna null se ASAAS_API_KEY não estiver configurada (o caller deve
 * responder 503 nesse caso, igual ao padrão usado com MP_ACCESS_TOKEN).
 */
export function getAsaasConfig(): AsaasConfig | null {
  const apiKey = Deno.env.get('ASAAS_API_KEY');
  if (!apiKey) return null;
  const env = (Deno.env.get('ASAAS_ENV') || 'sandbox').toLowerCase();
  const baseUrl = (env === 'production' || env === 'prod')
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3';
  return { apiKey, baseUrl };
}

export interface AsaasFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

export async function asaasFetch<T = any>(
  config: AsaasConfig,
  path: string,
  init: RequestInit = {},
): Promise<AsaasFetchResult<T>> {
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'access_token': config.apiKey,
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as T };
}

export interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
  externalReference?: string;
  mobilePhone?: string;
}

/**
 * Busca um cliente Asaas existente pelo e-mail; cria um novo caso não exista.
 * Idempotente por e-mail (o Asaas não impede duplicados automaticamente, por
 * isso checamos antes de criar).
 *
 * IMPORTANTE: o Asaas exige cpfCnpj para criar um cliente. O Mercado Pago não
 * exigia isso (bastava payer_email). Isso é uma mudança real de requisito de
 * dado — hoje só ServiceProvider.cpf é coletado (via verificação de
 * identidade do prestador). Para lojistas e clientes, o cpfCnpj precisa vir
 * do corpo da requisição (formulário de checkout) até que exista um campo
 * dedicado no cadastro. Ver comentário em createSubscriptionCheckout e
 * criarPagamentoServico.
 */
export async function getOrCreateAsaasCustomer(
  config: AsaasConfig,
  input: AsaasCustomerInput,
): Promise<{ id: string } | { error: string }> {
  const cpfCnpjDigits = (input.cpfCnpj || '').replace(/\D/g, '');
  if (!cpfCnpjDigits || (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14)) {
    return { error: 'CPF/CNPJ inválido ou ausente — obrigatório para o Asaas criar o cliente de cobrança.' };
  }

  const search = await asaasFetch<{ data?: Array<{ id: string }> }>(
    config,
    `/customers?email=${encodeURIComponent(input.email)}`,
  );
  if (search.ok && Array.isArray(search.data?.data) && search.data!.data!.length > 0) {
    return { id: search.data!.data![0].id };
  }

  const created = await asaasFetch<{ id?: string; errors?: Array<{ description?: string }> }>(
    config,
    '/customers',
    {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        cpfCnpj: cpfCnpjDigits,
        ...(input.externalReference ? { externalReference: input.externalReference } : {}),
        ...(input.mobilePhone ? { mobilePhone: input.mobilePhone } : {}),
      }),
    },
  );

  if (!created.ok || !created.data?.id) {
    const msg = created.data?.errors?.[0]?.description || 'Erro ao criar cliente no Asaas.';
    return { error: msg };
  }
  return { id: created.data.id };
}

/**
 * Valida o header `asaas-access-token` do webhook contra ASAAS_WEBHOOK_TOKEN.
 * Esse token NÃO é a API key — é um valor separado configurado no painel
 * Asaas (Integrações → Webhooks → Token de autenticação), 32-255 caracteres.
 * Comparação em tempo constante para evitar timing attack trivial.
 */
export function isValidAsaasWebhookToken(req: Request): boolean {
  const expected = Deno.env.get('ASAAS_WEBHOOK_TOKEN');
  if (!expected) {
    console.warn('[asaasWebhook] ASAAS_WEBHOOK_TOKEN não configurado — assinatura não validada');
    return false;
  }
  const received = req.headers.get('asaas-access-token') || '';
  if (received.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return diff === 0;
}
