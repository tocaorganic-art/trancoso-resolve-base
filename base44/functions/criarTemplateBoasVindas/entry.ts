import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

// Registra os 3 templates de boas-vindas no WhatsApp Manager via WABA API.
// Templates (todos pt_BR, categoria MARKETING):
//   1. boas_vindas_cliente   — para leads tipo "cliente"
//   2. boas_vindas_prestador — para leads tipo "prestador"
//   3. boas_vindas_lojista   — para leads tipo "lojista"
//
// Secrets:
//   token-id-whatsapp        — token do System User com whatsapp_business_management
//   waba-id-whatsapp         — ID numérico da conta WABA
//   phone-number-id-whatsapp — Phone Number ID

const TEMPLATE_LANGUAGE = 'pt_BR';
const TEMPLATE_CATEGORY = 'MARKETING';

const TEMPLATES = [
  {
    name: 'boas_vindas_cliente',
    body:
      'Olá! Bem-vindo à Trancoso Resolve 🌴\n\nSomos a vitrine digital oficial de Trancoso e da Costa do Descobrimento. Conectamos moradores, visitantes e empresários aos melhores prestadores de serviço da região — diaristas, eletricistas, piscineiros, cozinheiros e muito mais.\n\nComo podemos te ajudar hoje?',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Preciso de um serviço' },
      { type: 'QUICK_REPLY', text: 'Ver profissionais' },
      { type: 'QUICK_REPLY', text: 'Quero saber mais' },
    ],
  },
  {
    name: 'boas_vindas_prestador',
    body:
      'Olá! Bem-vindo à Trancoso Resolve 🌴\n\nSomos a plataforma que conecta prestadores de serviço verificados a clientes em Trancoso, Arraial d\'Ajuda, Porto Seguro e Caraíva. Receba solicitações diretas, sem intermediários.\n\nComo podemos te ajudar hoje?',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Quero me cadastrar' },
      { type: 'QUICK_REPLY', text: 'Conhecer os planos' },
      { type: 'QUICK_REPLY', text: 'Quero saber mais' },
    ],
  },
  {
    name: 'boas_vindas_lojista',
    body:
      'Olá! Bem-vindo à Trancoso Resolve 🌴\n\nSomos a vitrine digital oficial de Trancoso e da Costa do Descobrimento. Anuncie seu negócio para moradores, visitantes e turistas que buscam produtos e serviços na região.\n\nComo podemos te ajudar hoje?',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Quero anunciar' },
      { type: 'QUICK_REPLY', text: 'Conhecer os planos' },
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

    if (!token) {
      return Response.json({ error: 'token-id-whatsapp não configurado' }, { status: 500 });
    }
    if (!wabaId || !/^\d+$/.test(wabaId.trim())) {
      return Response.json(
        { error: 'waba-id-whatsapp não configurado ou inválido (deve ser numérico)' },
        { status: 500 }
      );
    }

    const url = `https://graph.facebook.com/v18.0/${wabaId.trim()}/message_templates`;
    const resultados = [];

    for (const tmpl of TEMPLATES) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: tmpl.name,
            language: TEMPLATE_LANGUAGE,
            category: TEMPLATE_CATEGORY,
            components: [
              { type: 'BODY', text: tmpl.body },
              { type: 'BUTTONS', buttons: tmpl.buttons },
            ],
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Se já existe (código 4) ou duplicado, registra como aviso, não erro
          const errMsg = data?.error?.message || `HTTP ${res.status}`;
          const alreadyExists = /already exists|duplicate|code 4/i.test(errMsg);
          resultados.push({
            name: tmpl.name,
            success: alreadyExists,
            already_exists: alreadyExists,
            status: data?.status || null,
            error: alreadyExists ? null : errMsg,
          });
          console.error(`[criarTemplateBoasVindas] ${tmpl.name}: ${errMsg}`);
        } else {
          resultados.push({
            name: tmpl.name,
            success: true,
            template_id: data?.id,
            status: data?.status,
            category: data?.category,
          });
          console.log(`[criarTemplateBoasVindas] ${tmpl.name} criado id=${data?.id} status=${data?.status}`);
        }
      } catch (e) {
        resultados.push({ name: tmpl.name, success: false, error: (e as Error).message });
      }
    }

    const todosOk = resultados.every((r) => r.success);
    return Response.json(
      {
        success: todosOk,
        waba_id: wabaId.trim(),
        templates: resultados,
      },
      { status: todosOk ? 200 : 500 }
    );
  } catch (err) {
    console.error('[criarTemplateBoasVindas] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});