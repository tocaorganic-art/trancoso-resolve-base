export default async function criarTemplateBoasVindas(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const wabaId = Deno.env.get("waba-id-whatsapp");
    
    if (!token || !wabaId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Credenciais WABA nao configuradas" 
      }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    const templates = [
      {
        name: "trancoso_resolve_boas_vindas",
        language: "pt_BR",
        category: "UTILITY",
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
        category: "UTILITY",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}!\n\nRecebemos seu contato aqui no Trancoso Resolve. Nossa equipe ja esta buscando o profissional ideal para {{2}} na regiao de Trancoso.\n\nEm breve retornamos com uma indicacao. Qualquer duvida, e so responder essa mensagem!"
          }
        ]
      },
      {
        name: "trancoso_resolve_follow_up",
        language: "pt_BR",
        category: "UTILITY",
        components: [
          {
            type: "BODY",
            text: "Oi, {{1}}! Tudo bem?\n\nPassando pra saber se voce ainda esta precisando de {{2}} em Trancoso. Ainda estamos por aqui pra te ajudar - e so dar um sinal!\n\nTrancoso Resolve - quem resolve, pertinho de voce."
          }
        ]
      }
    ];
    
    const results = [];
    
    for (const template of templates) {
      const response = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "/message_templates", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(template)
      });
      
      const data = await response.json();
      
      if (data.error) {
        results.push({ name: template.name, success: false, error: data.error.message, code: data.error.code, subcode: data.error.error_subcode });
      } else {
        results.push({ name: template.name, success: true, id: data.id, status: data.status });
      }
    }
    
    return new Response(JSON.stringify({ success: true, waba_id: wabaId, templates: results }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: msg }), { 
      status: 500, headers: { "Content-Type": "application/json" } 
    });
  }
}