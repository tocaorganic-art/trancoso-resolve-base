export default async function listarTemplatesWhatsApp(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const wabaId = Deno.env.get("waba-id-whatsapp");
    
    if (!token || !wabaId) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais nao configuradas" }), { 
        status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    const fields = "name,status,category,language,components,rejected_reason,quality_score";
    const url = `https://graph.facebook.com/v20.0/${wabaId}/message_templates?fields=${fields}&limit=100`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify({ success: true, data }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: msg }), { 
      status: 500, headers: { "Content-Type": "application/json" } });
  }
}
