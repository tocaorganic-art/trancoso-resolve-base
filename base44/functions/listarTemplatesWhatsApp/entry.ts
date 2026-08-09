export default async function listarTemplatesWhatsApp(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const wabaId = Deno.env.get("waba-id-whatsapp");
    
    if (!token || !wabaId) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais nao configuradas" }), { 
        status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    const fields = "name,status,category,language,components,rejected_reason,quality_score";
    
    // Try multiple API versions
    const versions = ["v20.0", "v21.0", "v23.0"];
    const results = {};
    
    for (const version of versions) {
      try {
        const url = `https://graph.facebook.com/${version}/${wabaId}/message_templates?fields=${fields}&limit=100`;
        const res = await fetch(url, {
          method: "GET",
          headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        
        // Find rejected templates and check for rejected_reason
        const rejected = (data?.data || []).filter((t: any) => t.status === "REJECTED");
        const sample = rejected[0] || null;
        
        results[version] = {
          total: (data?.data || []).length,
          rejected_count: rejected.length,
          sample_rejected: sample ? {
            name: sample.name,
            id: sample.id,
            has_rejected_reason: "rejected_reason" in sample,
            rejected_reason: sample.rejected_reason || null,
            all_keys: Object.keys(sample),
            has_error: !!data?.error,
            error: data?.error?.message || null
          } : null
        };
      } catch (e) {
        results[version] = { error: e instanceof Error ? e.message : String(e) };
      }
    }
    
    // Also try fetching a single rejected template by ID with v21.0
    const listUrl = `https://graph.facebook.com/v21.0/${wabaId}/message_templates?fields=name,status&limit=100`;
    const listRes = await fetch(listUrl, { headers: { "Authorization": "Bearer " + token } });
    const listData = await listRes.json();
    const rejectedId = (listData?.data || []).find((t: any) => t.status === "REJECTED")?.id;
    
    let singleDetail = null;
    if (rejectedId) {
      const detailUrl = `https://graph.facebook.com/v21.0/${rejectedId}?fields=name,status,category,rejected_reason,quality_score,components`;
      const detailRes = await fetch(detailUrl, { headers: { "Authorization": "Bearer " + token } });
      singleDetail = await detailRes.json();
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      results_by_version: results,
      single_template_detail_v21: singleDetail
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
