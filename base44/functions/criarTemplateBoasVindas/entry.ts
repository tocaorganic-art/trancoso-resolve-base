export default async function criarTemplateBoasVindas(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const wabaId = Deno.env.get("waba-id-whatsapp");
    
    if (!token || !wabaId) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais nao configuradas" }), { 
        status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    const headers = {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    };
    
    const templates = [
      {
        name: "trancoso_bem_vindo_2026",
        language: "pt_BR",
        category: "MARKETING",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}! Aqui e da Trancoso Resolve, o hub de servicos locais de Trancoso. Recebemos sua mensagem e ja estamos aqui pra te ajudar. Me conta: que tipo de servico voce esta precisando?"
          }
        ]
      },
      {
        name: "trancoso_lead_ok_2026",
        language: "pt_BR",
        category: "MARKETING",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}! Recebemos seu contato no Trancoso Resolve. Nossa equipe ja esta buscando o profissional ideal para {{2}} na regiao de Trancoso. Em breve retornamos com uma indicacao."
          }
        ]
      },
      {
        name: "trancoso_followup_2026",
        language: "pt_BR",
        category: "MARKETING",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}! Tudo bem? Passando pra saber se voce ainda esta precisando de {{2}} em Trancoso. Ainda estamos por aqui pra te ajudar. Trancoso Resolve - quem resolve, pertinho de voce."
          }
        ]
      }
    ];
    
    const createResults = [];
    
    for (const template of templates) {
      const response = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "/message_templates", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(template)
      });
      
      const data = await response.json();
      
      if (data.error) {
        createResults.push({ name: template.name, success: false, error: data.error.message, code: data.error.code, subcode: data.error.error_subcode, fbtrace_id: data.error.fbtrace_id });
      } else {
        createResults.push({ name: template.name, success: true, id: data.id, status: data.status, category: data.category });
      }
    }
    
    return new Response(JSON.stringify({ success: true, waba_id: wabaId, created: createResults }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: msg }), { 
      status: 500, headers: { "Content-Type": "application/json" } });
  }
}