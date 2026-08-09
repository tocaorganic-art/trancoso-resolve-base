import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cria um template de mensagem de boas-vindas no WhatsApp Manager via WABA API.
// Secrets (mesmos nomes usados por enviarMensagemWhatsApp):
//   token-id-whatsapp        — token do System User da Meta (deve ter permissão whatsapp_business_management)
//   waba-id-whatsapp         — (opcional) ID numérico da conta WABA; se ausente, é derivado via /me
//
// REQUISITO: o token precisa da permissão whatsapp_business_management (além da whatsapp_business_messaging
// usada para enviar mensagens). Sem ela, a Meta rejeita a criação de templates com erro 100/33.

const TEMPLATE_NAME = 'boas_vindas_trancoso';
const TEMPLATE_LANGUAGE = 'pt_BR';
const TEMPLATE_CATEGORY = 'MARKETING';

const BODY_TEXT = "Olá! Bem-vindo à Trancoso Resolve 🌴\n\nSomos a vitrine digital oficial de Trancoso. Conectamos moradores e empresários aos melhores prestadores de serviço da região.\n\nComo podemos te ajudar hoje?";

const COMPONENTS = [
  { type: 'BODY', text: BODY_TEXT },
  {
    type: 'BUTTONS',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Preciso de um serviço' },
      { type: 'QUICK_REPLY', text: 'Sou prestador, quero me cadastrar' },
      { type: 'QUICK_REPLY', text: 'Quero saber mais' },
    ],
  },
];

// Deriva o WABA ID numericamente válido a partir das credenciais disponíveis.
async function resolverWabaId(token: string): Promise<string | null> {
  // 1) Secret explícito se for numericamente válido
  const explicit = Deno.env.get('waba-id-whatsapp');
  if (explicit && /^\d+$/.test(explicit.trim())) {
    return explicit.trim();
  }

  // 2) GET /me — com token de System User que tem gestão de WABA, retorna o nó da WABA
  try {
    const meRes = await fetch('https://graph.facebook.com/v19.0/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (meRes.ok && meData?.id && /^\d+$/.test(String(meData.id))) {
      const candidate = String(meData.id);
      // Confirma que o nó comporta message_templates (edge de WABA)
      const probe = await fetch(`https://graph.facebook.com/v19.0/${candidate}/message_templates?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (probe.ok) return candidate;
    }
  } catch {
    // ignora
  }

  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Apenas admin pode criar templates
    let user: { email?: string; role?: string } | null = null;
    try {
      user = await base44.auth.me();
    } catch {
      // sem usuário
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Apenas administradores podem criar templates' }, { status: 403 });
    }

    const token = Deno.env.get('token-id-whatsapp');
    if (!token) {
      return Response.json({ error: 'token-id-whatsapp não configurado' }, { status: 500 });
    }

    const wabaId = await resolverWabaId(token);
    if (!wabaId) {
      return Response.json(
        {
          error:
            'Não foi possível obter o WABA ID. O token-id-whatsapp provavelmente só tem a permissão whatsapp_business_messaging. Ações necessárias: (1) no Meta Business Manager, edite o System User e adicione a permissão whatsapp_business_management ao token; (2) defina o secret waba-id-whatsapp com o ID numérico da conta WABA (WhatsApp Manager > Account Details).',
        },
        { status: 500 }
      );
    }

    const url = `https://graph.facebook.com/v18.0/${wabaId}/message_templates`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: TEMPLATE_NAME,
        language: TEMPLATE_LANGUAGE,
        category: TEMPLATE_CATEGORY,
        components: COMPONENTS,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[criarTemplateBoasVindas] erro Meta:', JSON.stringify(data?.error || data));
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      const isPermission = /permission|nonexisting|does not exist|support this operation/i.test(errMsg);
      return Response.json(
        {
          success: false,
          waba_id: wabaId,
          error: errMsg,
          permission_issue: isPermission,
          hint: isPermission
            ? 'O token não tem permissão de gestão. Adicione whatsapp_business_management ao System User no Meta Business Manager e gere um novo token.'
            : undefined,
          raw: data,
        },
        { status: res.status }
      );
    }

    console.log(`[criarTemplateBoasVindas] template criado id=${data?.id} status=${data?.status} waba=${wabaId}`);

    return Response.json({
      success: true,
      waba_id: wabaId,
      template_id: data?.id,
      name: data?.name,
      status: data?.status,
      category: data?.category,
      language: data?.language,
    });
  } catch (err) {
    console.error('[criarTemplateBoasVindas] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});