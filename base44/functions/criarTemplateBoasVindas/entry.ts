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
    
    // Check WABA account details
    const wabaRes = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "?fields=name,verification_status,city,country,phone_number,address,business,primary_language,category", {
      method: "GET",
      headers: headers
    });
    const wabaData = await wabaRes.json();
    
    // Try creating ONE simple template
    const simpleTemplate = {
      name: "teste_simples_2026",
      language: "pt_BR",
      category: "MARKETING",
      components: [
        {
          type: "BODY",
          text: "Ola, este e um teste."
        }
      ]
    };
    
    const createRes = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "/message_templates", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(simpleTemplate)
    });
    const createData = await createRes.json();
    
    // Count existing templates
    const listRes = await fetch("https://graph.facebook.com/v20.0/" + wabaId + "/message_templates?limit=100", {
      method: "GET",
      headers: headers
    });
    const listData = await listRes.json();
    const templateCount = listData.data ? listData.data.length : 0;
    
    return new Response(JSON.stringify({ 
      success: true,
      waba_details: wabaData,
      template_count: templateCount,
      create_test: createData
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