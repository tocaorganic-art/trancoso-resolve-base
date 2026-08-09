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
    
    // Step 1: List existing templates to find rejected ones
    const listRes = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "/message_templates?limit=100", {
      method: "GET",
      headers: headers
    });
    const listData = await listRes.json();
    
    const deleteResults = [];
    
    // Delete rejected templates with our names
    if (listData.data) {
      for (const tmpl of listData.data) {
        if (tmpl.status === "REJECTED" && (
          tmpl.name === "trancoso_resolve_boas_vindas" ||
          tmpl.name === "trancoso_resolve_lead_recebida" ||
          tmpl.name === "trancoso_resolve_follow_up"
        )) {
          const delRes = await fetch("https://graph.facebook.com/v20.0/" + tmpl.id, {
            method: "DELETE",
            headers: headers
          });
          const delData = await delRes.json();
          deleteResults.push({ name: tmpl.name, id: tmpl.id, deleted: delData.success === true });
        }
      }
    }
    
    // Step 2: Create new templates with category MARKETING
    const templates = [
      {
        name: "trancoso_resolve_boas_vindas",
        language: "pt_BR",
        category: "MARKETING",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}!\n\nAqui e da Trancoso Resolve - o hub de servicos locais de Trancoso.\n\nRecebemos sua mensagem e ja estamos aqui pra te ajudar. Me conta: que tipo de servico voce esta precisando?"
          }
        ]
      },
      {
        name: "trancoso_resolve_lead_recebida",
        language: "pt_BR",
        category: "MARKETING",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}!\n\nRecebemos seu contato aqui no Trancoso Resolve. Nossa equipe ja esta buscando o profissional ideal para {{2}} na regiao de Trancoso.\n\nEm breve retornamos com uma indicacao."
          }
        ]
      },
      {
        name: "trancoso_resolve_follow_up",
        language: "pt_BR",
        category: "MARKETING",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}! Tudo bem?\n\nPassando pra saber se voce ainda esta precisando de {{2}} em Trancoso. Ainda estamos por aqui pra te ajudar - e so dar um sinal!\n\nTrancoso Resolve - quem resolve, pertinho de voce."
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
        createResults.push({ name: template.name, success: false, error: data.error.message, code: data.error.code, subcode: data.error.error_subcode });
      } else {
        createResults.push({ name: template.name, success: true, id: data.id, status: data.status, category: data.category });
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      waba_id: wabaId, 
      deleted: deleteResults, 
      created: createResults 
    }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: msg }), { 
      status: 500, headers: { "Content-Type": "application/json" } });
  }
}