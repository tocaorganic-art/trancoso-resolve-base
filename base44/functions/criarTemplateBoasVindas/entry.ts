import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Cria um template de mensagem de boas-vindas no WhatsApp Manager via WABA API.
// Secrets necessários (painel Base44):
//   token-id-whatsapp  — token do System User da Meta (WABA access token)
//   waba-id-whatsapp   — WhatsApp Business Account ID

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
    const wabaId = Deno.env.get('waba-id-whatsapp');

    if (!token || !wabaId) {
      return Response.json(
        { error: 'token-id-whatsapp ou waba-id-whatsapp não configurados' },
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
      return Response.json(
        { success: false, error: data?.error?.message || `HTTP ${res.status}`, raw: data },
        { status: res.status }
      );
    }

    console.log(`[criarTemplateBoasVindas] template criado id=${data?.id} status=${data?.status}`);

    return Response.json({
      success: true,
      template_id: data?.id,
      name: data?.name,
      status: data?.status,
      category: data?.category,
      language: data?.language,
      raw: data,
    });
  } catch (err) {
    console.error('[criarTemplateBoasVindas] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});