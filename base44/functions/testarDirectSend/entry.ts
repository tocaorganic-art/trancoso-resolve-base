export default async function testarDirectSend(req: Request): Promise<Response> {
  try {
    const token = Deno.env.get("token-id-whatsapp");
    const phoneNumberId = Deno.env.get("phone-number-id-whatsapp");
    
    if (!token || !phoneNumberId) {
      return new Response(JSON.stringify({ success: false, error: "Credenciais nao configuradas" }), { 
        status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    const headers = {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    };
    
    const url = "https://graph.facebook.com/v20.0/" + phoneNumberId + "/messages";
    
    // Test 1: category at top level
    const test1 = {
      messaging_product: "whatsapp",
      to: "5573999854625",
      type: "text",
      category: "utility",
      text: {
        body: "Teste 1: Direct Send com category no top level."
      }
    };
    const res1 = await fetch(url, { method: "POST", headers, body: JSON.stringify(test1) });
    const data1 = await res1.json();
    
    // Test 2: category inside text with name
    const test2 = {
      messaging_product: "whatsapp",
      to: "5573999854625",
      type: "text",
      text: {
        body: "Teste 2: Direct Send com category dentro do text.",
        category: "utility",
        name: "trancoso_test"
      }
    };
    const res2 = await fetch(url, { method: "POST", headers, body: JSON.stringify(test2) });
    const data2 = await res2.json();
    
    // Test 3: Using v21.0 API with category at top level
    const url21 = "https://graph.facebook.com/v21.0/" + phoneNumberId + "/messages";
    const test3 = {
      messaging_product: "whatsapp",
      to: "5573999854625",
      type: "text",
      category: "utility",
      text: {
        body: "Teste 3: Direct Send API v21.0 category top level."
      }
    };
    const res3 = await fetch(url21, { method: "POST", headers, body: JSON.stringify(test3) });
    const data3 = await res3.json();
    
    return new Response(JSON.stringify({
      test1_v20_category_toplevel: { status: res1.status, response: data1 },
      test2_v20_category_in_text: { status: res2.status, response: data2 },
      test3_v21_category_toplevel: { status: res3.status, response: data3 }
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