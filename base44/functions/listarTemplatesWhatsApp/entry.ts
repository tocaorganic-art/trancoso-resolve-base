export default async function listarTemplatesWhatsApp(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const wabaId = Deno.env.get("waba-id-whatsapp");
    
    if (!token || !wabaId) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais nao configuradas" }), { 
        status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    const fields = "name,status,category,language,components,rejected_reason,rejection_reason,quality_score";
    const url = `https://graph.facebook.com/v20.0/${wabaId}/message_templates?fields=${fields}&limit=100`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });
    
    const data = await response.json();
    
    // For rejected templates, try fetching individual details if rejection reason is missing
    if (data?.data) {
      for (const tmpl of data.data) {
        if (tmpl.status === "REJECTED" && !tmpl.rejected_reason && !tmpl.rejection_reason && tmpl.id) {
          try {
            const detailUrl = `https://graph.facebook.com/v20.0/${tmpl.id}?fields=name,status,category,components,rejected_reason,rejection_reason,quality_score`;
            const detailRes = await fetch(detailUrl, {
              method: "GET",
              headers: { "Authorization": "Bearer " + token }
            });
            const detailData = await detailRes.json();
            // Merge any new fields from the individual response
            if (detailData?.rejected_reason) tmpl.rejected_reason = detailData.rejected_reason;
            if (detailData?.rejection_reason) tmpl.rejection_reason = detailData.rejection_reason;
            if (detailData?.quality_score) tmpl.quality_score = detailData.quality_score;
            // Also check components for rejection info
            if (detailData?.components) {
              for (const comp of detailData.components) {
                if (comp?.rejection_reason) {
                  tmpl.component_rejection_reason = comp.rejection_reason;
                }
              }
            }
          } catch (e) {
            // ignore individual fetch errors
          }
        }
      }
    }
    
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
