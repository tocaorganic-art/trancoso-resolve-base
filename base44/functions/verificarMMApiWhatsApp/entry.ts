export default async function verificarMMApiWhatsApp(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const wabaId = Deno.env.get("waba-id-whatsapp");
    
    if (!token || !wabaId) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais nao configuradas" }), { 
        status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    // Check marketing_messages_onboarding_status
    const statusUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=marketing_messages_onboarding_status,owner_business_info,name`;
    const statusRes = await fetch(statusUrl, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token }
    });
    const statusData = await statusRes.json();
    
    // Also check the deprecated field for comparison
    const legacyUrl = `https://graph.facebook.com/v21.0/${wabaId}?fields=marketing_messages_lite_api_status`;
    const legacyRes = await fetch(legacyUrl, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token }
    });
    const legacyData = await legacyRes.json();
    
    return new Response(JSON.stringify({ 
      success: true, 
      waba_id: wabaId,
      marketing_messages_onboarding: statusData,
      legacy_status: legacyData,
      errors: {
        onboarding: statusData?.error || null,
        legacy: legacyData?.error || null
      }
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
